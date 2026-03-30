import Order from "./order.model.js";

const create = (orderData) => Order.create(orderData);

const findByUser = (userId, { page = 1, limit = 10, status } = {}) => {
  const filter = { user: userId };
  if (status) filter.status = status;

  return Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      "orderCode status totalAmount paymentMethod paymentStatus createdAt items",
    );
};

const countByUser = (userId, status) => {
  const filter = { user: userId };
  if (status) filter.status = status;
  return Order.countDocuments(filter);
};

const findById = (orderId) =>
  Order.findById(orderId).populate("user", "name email phone");

const findByIdAndUser = (orderId, userId) =>
  Order.findOne({ _id: orderId, user: userId });

const updateStatus = (orderId, status) =>
  Order.findByIdAndUpdate(orderId, { status }, { new: true });

// Admin: lấy tất cả đơn hàng với filter
const findAll = ({ page = 1, limit = 10, status, userId } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;

  return Order.find(filter)
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

const countAll = ({ status, userId } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.user = userId;
  return Order.countDocuments(filter);
};

export const orderRepository = {
  create,
  findByUser,
  countByUser,
  findById,
  findByIdAndUser,
  updateStatus,
  findAll,
  countAll,
};
