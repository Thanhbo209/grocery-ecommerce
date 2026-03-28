// controllers/category.controller.js
import { categoryService } from "./category.service.js";

export const categoryController = {
  async create(req, res) {
    try {
      const data = await categoryService.createCategory(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const data = await categoryService.getAllCategories();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getCategoryBySlug(req, res) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.json(category);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const data = await categoryService.getCategoryById(req.params.id);
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const data = await categoryService.updateCategory(
        req.params.id,
        req.body,
      );
      res.json(data);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async delete(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};
