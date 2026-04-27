import express from "express";
import { productController } from "./product.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", productController.getAll);
router.get("/stats", productController.getStats);
router.get("/count", productController.countProducts);
router.get("/:id", productController.getById);

// ADMIN
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  productController.create,
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  productController.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  productController.delete,
);

export default router;
