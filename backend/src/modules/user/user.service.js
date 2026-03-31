import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository.js";

const userRepo = new UserRepository();

const getProfile = async (userId) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

const updateProfile = async (userId, { name, phone }) => {
  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (phone !== undefined) data.phone = phone.trim();

  if (Object.keys(data).length === 0) {
    throw new Error("Không có thông tin nào để cập nhật");
  }

  const user = await userRepo.updateProfile(userId, data);
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new Error("Vui lòng nhập đầy đủ mật khẩu");
  }
  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  const user = await userRepo.findByIdWithPassword(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu hiện tại không đúng");

  user.password = newPassword; // pre-save hook sẽ hash
  await user.save();
};

// ─── Addresses ────────────────────────────────────────────────────────────────

const addAddress = async (userId, addressData) => {
  validateAddress(addressData);
  return userRepo.addAddress(userId, addressData);
};

const updateAddress = async (userId, addressId, addressData) => {
  validateAddress(addressData);
  return userRepo.updateAddress(userId, addressId, addressData);
};

const deleteAddress = async (userId, addressId) => {
  return userRepo.deleteAddress(userId, addressId);
};

const setDefaultAddress = async (userId, addressId) => {
  return userRepo.setDefaultAddress(userId, addressId);
};

// Helper validate địa chỉ
function validateAddress({ street, city }) {
  if (!street?.trim()) throw new Error("Vui lòng nhập địa chỉ");
  if (!city?.trim()) throw new Error("Vui lòng nhập thành phố");
}

export const userService = {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
