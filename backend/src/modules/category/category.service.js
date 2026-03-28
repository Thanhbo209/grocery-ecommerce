// services/category.service.js
import { categoryRepository } from "./category.repository.js";

export const categoryService = {
  async createCategory(data) {
    // validate business
    if (!data.name) throw new Error("Name is required");

    // check duplicate slug
    const existed = await categoryRepository.findBySlug(
      data.name.toLowerCase().replace(/\s+/g, "-"),
    );

    if (existed) throw new Error("Category already exists");

    return categoryRepository.create(data);
  },

  async getAllCategories() {
    return categoryRepository.findAll({ isActive: true });
  },

  async getCategoryBySlug(slug) {
    if (!slug) throw new Error("Slug is required");

    const category = await categoryRepository.findBySlug(slug);

    if (!category || !category.isActive) {
      throw new Error("Category not found");
    }

    return category;
  },

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  async updateCategory(id, data) {
    const updated = await categoryRepository.update(id, data);
    if (!updated) throw new Error("Update failed");
    return updated;
  },

  async deleteCategory(id) {
    const deleted = await categoryRepository.delete(id);
    if (!deleted) throw new Error("Delete failed");
    return deleted;
  },
};
