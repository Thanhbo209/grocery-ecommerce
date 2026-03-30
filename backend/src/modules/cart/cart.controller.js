// cart.controller.js
import { cartService } from "./cart.service.js";

// Helper lấy userId nhất quán từ JWT payload
const getUserId = (req) => req.user.userId;

const getCart = async (req, res) => {
  try {
    const data = await cartService.getCart(getUserId(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId là bắt buộc" });
    }

    const data = await cartService.addToCart(getUserId(req), {
      productId,
      quantity: Number(quantity) || 1,
    });
    res
      .status(201)
      .json({ success: true, message: "Đã thêm vào giỏ hàng", data });
  } catch (error) {
    const status = error.message.includes("không tồn tại")
      ? 404
      : error.message.includes("không đủ")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "quantity là bắt buộc" });
    }

    const data = await cartService.updateQuantity(
      getUserId(req), // ← fix
      req.params.productId,
      Number(quantity),
    );
    res.json({ success: true, message: "Đã cập nhật giỏ hàng", data });
  } catch (error) {
    const status = error.message.includes("không tìm thấy")
      ? 404
      : error.message.includes("không đủ")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const data = await cartService.removeFromCart(
      getUserId(req), // ← fix
      req.params.productId,
    );
    res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(getUserId(req)); // ← fix
    res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cartController = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
