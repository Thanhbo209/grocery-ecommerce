import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/connectDB.js";
import cors from "cors";
import dns from "dns";
import { UserRepository } from "./modules/user/user.repository.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { createAuthRouter } from "./modules/auth/auth.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import productRoutes from "./modules/product/product.routes.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");
dotenv.config();

const PORT = process.env.PORT || 5000;
const connectionString = process.env.MONGO_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();
app.use(express.json());

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

// routes
app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/api/auth", createAuthRouter(authController));
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
// start server
const startServer = async () => {
  await connectDB(connectionString);
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
  });
};

startServer();
