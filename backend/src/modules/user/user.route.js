import { Router } from "express";
import { userController } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

// Tất cả user routes đều yêu cầu đăng nhập
router.use(authMiddleware);

// Profile
router.get("/me", userController.getProfile);
router.put("/me", userController.updateProfile);
router.put("/me/password", userController.changePassword);

// Addresses
router.get("/me/addresses", userController.getAddresses);
router.post("/me/addresses", userController.addAddress);
router.put("/me/addresses/:addressId", userController.updateAddress);
router.delete("/me/addresses/:addressId", userController.deleteAddress);
router.patch(
  "/me/addresses/:addressId/default",
  userController.setDefaultAddress,
);

export default router;
