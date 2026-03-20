// auth.service.js
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/jwt.js";

export class AuthService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async register(data) {
    const { email, password, name } = data;

    // Check tồn tại
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }

    // Tạo user (password sẽ hash ở model)
    const user = await this.userRepo.create({
      email,
      password,
      name,
    });

    // Tạo token
    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    const { password: _, ...safeUser } = user.toObject();
    return { user: safeUser, token };
  }

  async login(data) {
    const { email, password } = data;

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // So password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    const { password: _, ...safeUser } = user.toObject();
    return { user: safeUser, token };
  }
}
