// order.route.js
import { Router } from "express";
import { orderController } from "./order.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getMyOrders);
router.get("/:id", authMiddleware, orderController.getOrderDetail);
router.patch("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Admin
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin"),
  orderController.getAllOrders,
);
router.patch(
  "/admin/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  orderController.updateOrderStatus,
);

export default router;
