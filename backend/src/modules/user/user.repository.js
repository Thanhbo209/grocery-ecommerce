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

  updateProfile(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  findByIdWithPassword(id) {
    return User.findById(id).select("+password");
  }

  // Thêm địa chỉ mới
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    if (addressData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();
    return user;
  }

  async updateAddress(userId, addressId, addressData) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === addressId,
    );
    if (index < 0) throw new Error("Không tìm thấy địa chỉ");

    const wasDefault = user.addresses[index].isDefault;
    if (addressData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(user.addresses[index], addressData);
    if (wasDefault && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[index].isDefault = true;
    }
    await user.save();
    return user;
  }

  async deleteAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === addressId,
    );
    if (index < 0) throw new Error("Không tìm thấy địa chỉ");

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

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
    const target = user.addresses.find((a) => a._id.toString() === addressId);
    if (!target) throw new Error("Không tìm thấy địa chỉ");
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === addressId;
    });

    await user.save();
    return user;
  }
}
