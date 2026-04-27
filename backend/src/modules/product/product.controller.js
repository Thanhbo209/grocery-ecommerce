// product.controller.js
import { productService } from "./product.service.js";

export const productController = {
  // GET /api/products — admin xem tất cả (có filter isActive/isFeatured)
  getAll: async (req, res) => {
    try {
      const result = await productService.getAllProductsAdmin(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // product.controller.js
  countProducts: async (req, res) => {
    try {
      const total = await productService.countProducts({ isActive: true });
      res.json({ total });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // GET /api/products/stats — phải đăng ký TRƯỚC /:id trong routes
  getStats: async (req, res) => {
    try {
      const stats = await productService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      const status = error.message === "Product not found" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body,
      );
      res.json(product);
    } catch (error) {
      const status = error.message === "Update failed" ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      const status = error.message === "Delete failed" ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  },
};
