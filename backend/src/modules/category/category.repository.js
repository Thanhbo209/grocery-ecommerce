// repositories/category.repository.js
import Category from "./category.model.js";

export const categoryRepository = {
  create: (data) => Category.create(data),

  findAll: (filter = {}) => Category.find(filter),

  findById: (id) => Category.findById(id),

  findBySlug: (slug) => Category.findOne({ slug }),

  update: (id, data) => Category.findByIdAndUpdate(id, data, { new: true }),

  delete: (id) => Category.findByIdAndDelete(id),
};
