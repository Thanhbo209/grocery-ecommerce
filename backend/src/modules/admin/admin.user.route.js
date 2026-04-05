import { Router } from "express";
import { adminUserController } from "./admin.user.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware, authorizeRoles("admin"));

router.get("/", adminUserController.getAllUsers);
router.get("/:id", adminUserController.getUserById);
router.post("/", adminUserController.createUser);
router.put("/:id", adminUserController.updateUser);
router.patch("/:id/password", adminUserController.resetPassword);
router.patch("/:id/toggle-active", adminUserController.toggleActive);
router.delete("/:id", adminUserController.deleteUser);

export default router;
