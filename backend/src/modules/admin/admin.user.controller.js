import User from "../user/user.model.js";
import bcrypt from "bcryptjs";

const PAGE_LIMIT = 15;

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, search = "", role = "", isActive = "" } = req.query;
    const skip = (Number(page) - 1) * PAGE_LIMIT;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== "") filter.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_LIMIT),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: PAGE_LIMIT,
          totalPages: Math.ceil(total / PAGE_LIMIT),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role = "user" } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email đã được sử dụng" });

    const user = await User.create({ name, email, phone, password, role });
    res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, phone, role, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    res.json({ success: true, message: "Cập nhật thành công", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/password
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res
        .status(400)
        .json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });

    const user = await User.findById(req.params.id).select("+password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    user.password = newPassword; // pre-save hook sẽ hash
    await user.save();

    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/toggle-active
const toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    // Không cho khoá chính mình
    if (user._id.toString() === req.user.userId)
      return res
        .status(400)
        .json({
          success: false,
          message: "Không thể khoá tài khoản của chính mình",
        });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.userId)
      return res
        .status(400)
        .json({
          success: false,
          message: "Không thể xóa tài khoản của chính mình",
        });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    res.json({ success: true, message: "Đã xóa người dùng" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminUserController = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  toggleActive,
  deleteUser,
};
