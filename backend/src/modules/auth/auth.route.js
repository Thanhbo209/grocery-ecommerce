// auth.route.js
import express from "express";

export const createAuthRouter = (authController) => {
  const router = express.Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);

  return router;
};
