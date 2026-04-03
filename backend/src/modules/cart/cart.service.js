import Product from "../product/product.model.js";
import { cartRepository } from "./cart.repository.js";
import Cart from "./cart.model.js";

const getCart = async (userId) => {
  const cart = await cartRepository.findByUser(userId);
  if (!cart) return { items: [], totalItems: 0, totalPrice: 0 };
  return formatCart(cart);
};

const addToCart = async (userId, { productId, quantity = 1 }) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Sản phẩm không tồn tại");
  if (!product.isActive) throw new Error("Sản phẩm đã ngừng kinh doanh");
  if (product.stock < quantity) throw new Error("Sản phẩm không đủ số lượng");

  const price = product.discountPrice ?? product.price;


  const existingCart = await Cart.findOne({ user: userId });

  let cart;
  if (!existingCart) {
    // Tạo mới cart với item đầu tiên
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity, price }],
    });
  } else {
    const index = existingCart.items.findIndex((i) =>
      i.product.equals(productId),
    );
    if (index >= 0) {
      existingCart.items[index].quantity += quantity;
    } else {
      existingCart.items.push({ product: productId, quantity, price });
    }
    cart = await existingCart.save();
  }

  await cart.populate(
    "items.product",
    "name thumbnail price discountPrice unit stock isActive",
  );
  return formatCart(cart);
};

const updateQuantity = async (userId, productId, quantity) => {
  if (quantity < 0) throw new Error("Số lượng không hợp lệ");

  if (quantity > 0) {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    if (product.stock < quantity) throw new Error("Sản phẩm không đủ số lượng");
  }

  const cart = await cartRepository.updateItemQuantity(
    userId,
    productId,
    quantity,
  );

  if (!cart) throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");

  return formatCart(
    await cart.populate(
      "items.product",
      "name thumbnail price discountPrice unit stock isActive",
    ),
  );
};

const removeFromCart = async (userId, productId) => {
  const cart = await cartRepository.removeItem(userId, productId);
  if (!cart) throw new Error("Không tìm thấy giỏ hàng");
  return formatCart(
    await cart.populate(
      "items.product",
      "name thumbnail price discountPrice unit stock isActive",
    ),
  );
};

const clearCart = async (userId) => {
  await cartRepository.clearCart(userId);
};

// Helper: chuẩn hóa response cart
const formatCart = (cart) => {
  const items = cart.items.map((item) => ({
    product: {
      _id: item.product._id,
      name: item.product.name,
      thumbnail: item.product.thumbnail,
      price: item.product.price,
      discountPrice: item.product.discountPrice,
      unit: item.product.unit,
      stock: item.product.stock,
    },
    quantity: item.quantity,
    price: item.price,
    subtotal: item.price * item.quantity,
  }));

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.subtotal, 0);

  return { items, totalItems, totalPrice };
};

export const cartService = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
