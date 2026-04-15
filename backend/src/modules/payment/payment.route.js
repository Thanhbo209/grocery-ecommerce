import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = Router();

// ── Khách hàng ────────────────────────────────────────────────────────────────
// GET /api/payment/info/:orderId — lấy QR + info ngân hàng cho đơn
router.get("/info/:orderId", authMiddleware, paymentController.getPaymentInfo);

// ── Admin ─────────────────────────────────────────────────────────────────────
const adminOnly = [authMiddleware, authorizeRoles("admin")];

router.get(
  "/admin/pending",
  ...adminOnly,
  paymentController.getPendingPayments,
);
router.get("/admin/all", ...adminOnly, paymentController.getAllPayments);
router.get("/admin/bank-config", ...adminOnly, paymentController.getBankConfig);
router.patch(
  "/admin/:orderId/confirm",
  ...adminOnly,
  paymentController.confirmPayment,
);
router.patch(
  "/admin/:orderId/reject",
  ...adminOnly,
  paymentController.rejectPayment,
);

export default router;
