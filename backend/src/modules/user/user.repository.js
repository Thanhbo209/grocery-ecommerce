import User from "./user.model.js";

export class UserRepository {
  findByEmail(email) {
    return User.findOne({ email }).select("+password");
  }

  findById(id) {
    return User.findById(id);
  }

  create(data) {
    return User.create(data);
  }

  // Cập nhật thông tin cơ bản (name, phone)
  updateProfile(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  // Đổi password — lấy kèm password để verify
  findByIdWithPassword(id) {
    return User.findById(id).select("+password");
  }

  // ─── Address methods ───────────────────────────────────────────────────────

  // Thêm địa chỉ mới
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    // Nếu isDefault = true → reset tất cả address khác
    if (addressData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    // Nếu chưa có address nào thì tự set default
    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();
    return user;
  }

  // Cập nhật 1 address theo _id
  async updateAddress(userId, addressId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === addressId,
    );
    if (index < 0) throw new Error("Không tìm thấy địa chỉ");

    if (addressData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(user.addresses[index], addressData);
    await user.save();
    return user;
  }

  // Xóa 1 address
  async deleteAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === addressId,
    );
    if (index < 0) throw new Error("Không tìm thấy địa chỉ");

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

    // Nếu xóa địa chỉ mặc định thì gán mặc định cho địa chỉ đầu tiên còn lại
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  }

  // Set địa chỉ mặc định
  async setDefaultAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId;
    });

    await user.save();
    return user;
  }
}
