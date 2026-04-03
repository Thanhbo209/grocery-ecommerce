// cart.route.js
import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js"; // ← đổi tên import

const router = Router();

router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateQuantity);
router.delete("/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
