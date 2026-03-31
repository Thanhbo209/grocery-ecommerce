import { userService } from "./user.service.js";

const getUserId = (req) => req.user.userId;

// ─── Profile ──────────────────────────────────────────────────────────────────
const getAddresses = async (req, res) => {
  try {
    const user = await userService.getById(req.user._id);
    res.json({
      success: true,
      data: user.addresses || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const data = await userService.getProfile(getUserId(req));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const data = await userService.updateProfile(getUserId(req), {
      name,
      phone,
    });
    res.json({ success: true, message: "Cập nhật thông tin thành công", data });
  } catch (error) {
    const status = error.message.includes("Không có") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(getUserId(req), {
      currentPassword,
      newPassword,
    });
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    const status =
      error.message.includes("không đúng") || error.message.includes("ít nhất")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// ─── Addresses ────────────────────────────────────────────────────────────────

const addAddress = async (req, res) => {
  try {
    const user = await userService.addAddress(getUserId(req), req.body);
    res.status(201).json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    const status = error.message.includes("Vui lòng") ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await userService.updateAddress(
      getUserId(req),
      req.params.addressId,
      req.body,
    );
    res.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    const status = error.message.includes("không tìm thấy")
      ? 404
      : error.message.includes("Vui lòng")
        ? 400
        : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await userService.deleteAddress(
      getUserId(req),
      req.params.addressId,
    );
    res.json({
      success: true,
      message: "Xóa địa chỉ thành công",
      data: user.addresses,
    });
  } catch (error) {
    const status = error.message.includes("không tìm thấy") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await userService.setDefaultAddress(
      getUserId(req),
      req.params.addressId,
    );
    res.json({
      success: true,
      message: "Đã đặt làm địa chỉ mặc định",
      data: user.addresses,
    });
  } catch (error) {
    const status = error.message.includes("không tìm thấy") ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const userController = {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddresses,
};
