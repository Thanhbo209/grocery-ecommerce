import { orderService } from "./order.service.js";

// Khớp với JWT payload dùng userId (giống cart.controller)
const getUserId = (req) => req.user.userId;

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, note } = req.body;

    if (
      !shippingAddress?.street ||
      !shippingAddress?.city ||
      !shippingAddress?.name ||
      !shippingAddress?.phone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin địa chỉ giao hàng (name, phone, street, city)",
      });
    }

    const data = await orderService.createOrder(getUserId(req), {
      shippingAddress,
      paymentMethod,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data,
    });
  } catch (error) {
    const status = error.message.includes("trống")
      ? 400
      : error.message.includes("ngừng kinh doanh")
        ? 400
        : error.message.includes("chỉ còn")
          ? 400
          : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const data = await orderService.getMyOrders(getUserId(req), {
      page,
      limit,
      status,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const data = await orderService.getOrderDetail(
      req.params.id,
      getUserId(req),
    );
    res.json({ success: true, data });
  } catch (error) {
    const status = error.message.includes("không tìm thấy") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const data = await orderService.cancelOrder(req.params.id, getUserId(req));
    res.json({ success: true, message: "Đã hủy đơn hàng", data });
  } catch (error) {
    const status = error.message.includes("không tìm thấy")
      ? 404
      : error.message.includes("Chỉ có thể")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ---- Admin ----

const getAllOrders = async (req, res) => {
  try {
    const { page, limit, status, userId } = req.query;
    const data = await orderService.getAllOrders({
      page,
      limit,
      status,
      userId,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "status là bắt buộc" });
    }

    const data = await orderService.updateOrderStatus(req.params.id, status);
    res.json({
      success: true,
      message: "Đã cập nhật trạng thái đơn hàng",
      data,
    });
  } catch (error) {
    const status = error.message.includes("không tìm thấy")
      ? 404
      : error.message.includes("Không thể chuyển")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const orderController = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
