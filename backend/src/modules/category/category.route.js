// routes/category.routes.js
import express from "express";
import { categoryController } from "./category.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// PROTECTED - ADMIN ONLY
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  categoryController.create,
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  categoryController.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  categoryController.delete,
);

export default router;
