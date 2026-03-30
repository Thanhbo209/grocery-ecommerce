import Product from "../product/product.model.js";
import { cartRepository } from "../cart/cart.repository.js";
import { orderRepository } from "./order.repository.js";

const createOrder = async (
  userId,
  { addressId, shippingAddress, paymentMethod = "COD", note },
) => {
  // 1. Lấy giỏ hàng và populate product
  const cart = await cartRepository.findByUser(userId);
  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  // 2. Kiểm tra stock từng sản phẩm
  for (const item of cart.items) {
    const product = item.product;
    if (!product.isActive) {
      throw new Error(`Sản phẩm "${product.name}" đã ngừng kinh doanh`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Sản phẩm "${product.name}" chỉ còn ${product.stock} ${product.unit}`,
      );
    }
  }

  // 3. Snapshot items — không lưu ref sang Product
  const items = cart.items.map((item) => ({
    productId: item.product._id,
    name: item.product.name,
    thumbnail: item.product.thumbnail,
    price: item.product.discountPrice ?? item.product.price,
    unit: item.product.unit,
    quantity: item.quantity,
  }));

  // 4. Tính tiền
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = 0; // free ship — mở rộng sau
  const totalAmount = subtotal + shippingFee;

  // 5. Tạo order
  const order = await orderRepository.create({
    user: userId,
    items,
    subtotal,
    shippingFee,
    totalAmount,
    shippingAddress,
    paymentMethod,
    note,
  });

  // 6. Trừ stock và clear cart song song
  await Promise.all([
    ...cart.items.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      }),
    ),
    cartRepository.clearCart(userId),
  ]);

  return order;
};

const getMyOrders = async (userId, { page = 1, limit = 10, status } = {}) => {
  const [orders, total] = await Promise.all([
    orderRepository.findByUser(userId, { page, limit, status }),
    orderRepository.countByUser(userId, status),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getOrderDetail = async (orderId, userId) => {
  const order = await orderRepository.findByIdAndUser(orderId, userId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await orderRepository.findByIdAndUser(orderId, userId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  if (order.status !== "pending") {
    throw new Error("Chỉ có thể hủy đơn hàng đang chờ xử lý");
  }

  // Hoàn lại stock
  await Promise.all(
    order.items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      }),
    ),
  );

  return orderRepository.updateStatus(orderId, "cancelled");
};

// ---- Admin ----

const getAllOrders = async ({ page = 1, limit = 10, status, userId } = {}) => {
  const [orders, total] = await Promise.all([
    orderRepository.findAll({ page, limit, status, userId }),
    orderRepository.countAll({ status, userId }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateOrderStatus = async (orderId, status) => {
  const VALID_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping", "cancelled"],
    shipping: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const order = await orderRepository.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(status)) {
    throw new Error(`Không thể chuyển từ "${order.status}" sang "${status}"`);
  }

  // Nếu admin cancel, hoàn lại stock
  if (status === "cancelled") {
    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        }),
      ),
    );
  }

  return orderRepository.updateStatus(orderId, status);
};

export const orderService = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
