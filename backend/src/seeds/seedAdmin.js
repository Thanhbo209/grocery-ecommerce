import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../modules/user/user.model.js";

dotenv.config();
const connectionString = process.env.MONGO_URI;
const seedAdmin = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log("✅ Kết nối MongoDB thành công");

    const existing = await User.findOne({ email: "admin@food.vn" });
    if (existing) {
      console.log("⚠️  Admin đã tồn tại, bỏ qua seed.");
      return;
    }

    await User.create({
      name: "Admin",
      email: "admin@food.vn",
      phone: "0900000000",
      password: "Admin@123",
      role: "admin",
      isActive: true,
      addresses: [
        {
          label: "Công ty",
          street: "123 Nguyễn Huệ",
          district: "Quận 1",
          city: "Hồ Chí Minh",
          isDefault: true,
        },
      ],
    });

    console.log("🎉 Seed admin thành công!");
    console.log("   Email   : admin@food.vn");
    console.log("   Password: Admin@123");
  } catch (err) {
    console.error("❌ Seed thất bại:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB");
  }
};

seedAdmin();
