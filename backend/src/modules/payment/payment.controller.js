import { BANK_CONFIG, buildVietQRUrl } from "../../../config/payment.config.js";
import Order from "../order/order.model.js";

// GET /api/payment/info/:orderId
// Trả về thông tin QR + tài khoản ngân hàng cho đơn hàng
const getPaymentInfo = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.userId,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    if (order.paymentMethod === "COD") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng thanh toán COD" });
    }
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã được thanh toán" });
    }
    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Đơn hàng đã bị hủy" });
    }

    const qrUrl = buildVietQRUrl({
      amount: order.totalAmount,
      orderCode: order.orderCode,
    });

    res.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderCode: order.orderCode,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          status: order.status,
        },
        bank: {
          bankId: BANK_CONFIG.bankId,
          accountNumber: BANK_CONFIG.accountNumber,
          accountName: BANK_CONFIG.accountName,
          displayName: BANK_CONFIG.displayName,
          branch: BANK_CONFIG.branch,
        },
        qrUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

// GET /api/admin/payment/pending
// Lấy danh sách đơn hàng online chưa thanh toán
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getPendingPayments = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {
      paymentMethod: "online",
      paymentStatus: "unpaid",
      status: { $nin: ["cancelled"] },
    };

    if (search) {
      const q = escapeRegex(String(search));
      filter.$or = [
        { orderCode: { $regex: q, $options: "i" } },
        { "shippingAddress.name": { $regex: q, $options: "i" } },
        { "shippingAddress.phone": { $regex: q, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/payment/all
// Lấy tất cả đơn hàng online (cả paid và unpaid) để xem lịch sử
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 15, paymentStatus = "", search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { paymentMethod: "online" };
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderCode: { $regex: search, $options: "i" } },
        { "shippingAddress.name": { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/payment/:orderId/confirm
// Admin xác nhận đã nhận tiền → cập nhật paymentStatus: paid
const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được xác nhận thanh toán",
      });
    }

    order.paymentStatus = "paid";
    // Tự động chuyển sang confirmed nếu vẫn còn pending
    if (order.status === "pending") {
      order.status = "confirmed";
    }
    await order.save();

    res.json({
      success: true,
      message: "Xác nhận thanh toán thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/payment/:orderId/reject
// Admin từ chối / đánh dấu thanh toán thất bại
const rejectPayment = async (req, res) => {
  try {
    const { reason = "" } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    order.paymentStatus = "unpaid";
    if (reason) {
      order.note = order.note
        ? `${order.note} | Admin: ${reason}`
        : `Admin: ${reason}`;
    }
    await order.save();

    res.json({
      success: true,
      message: "Đã từ chối thanh toán",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/payment/bank-config
// Lấy cấu hình ngân hàng hiện tại
const getBankConfig = async (req, res) => {
  res.json({
    success: true,
    data: {
      bankId: BANK_CONFIG.bankId,
      accountNumber: BANK_CONFIG.accountNumber,
      accountName: BANK_CONFIG.accountName,
      displayName: BANK_CONFIG.displayName,
      branch: BANK_CONFIG.branch,
    },
  });
};

export const paymentController = {
  getPaymentInfo,
  getPendingPayments,
  getAllPayments,
  confirmPayment,
  rejectPayment,
  getBankConfig,
};
