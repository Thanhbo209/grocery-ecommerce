// services/product.service.js
import { productRepository } from "./product.repository.js";
import Category from "../category/category.model.js";

export const productService = {
  async createProduct(data) {
    if (!data.name || !data.price || !data.category) {
      throw new Error("Missing required fields");
    }

    const category = await Category.findById(data.category);
    if (!category) throw new Error("Invalid category");

    if (data.discountPrice && data.discountPrice >= data.price) {
      throw new Error("Discount price must be less than price");
    }

    return productRepository.create(data);
  },

  // ─── Public: chỉ trả isActive:true ────────────────────────────────────────
  async getAllProducts(query) {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      featured,
    } = query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { "ratings.average": -1 };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.findAll(filter, {
        sort: sortOption,
        skip,
        limit: Number(limit),
      }),
      productRepository.count(filter),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ─── Admin: trả tất cả, hỗ trợ filter isActive + isFeatured ───────────────
  async getAllProductsAdmin(query) {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sort,
      isActive, // "true" | "false" | undefined
      isFeatured, // "true" | undefined
    } = query;

    const filter = {};

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    // Không mặc định isActive:true — admin xem được tất cả
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;
    if (isFeatured === "true") filter.isFeatured = true;

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "rating") sortOption = { "ratings.average": -1 };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productRepository.findAll(filter, {
        sort: sortOption,
        skip,
        limit: Number(limit),
      }),
      productRepository.count(filter),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ─── Stats: countDocuments — không load document, cực nhanh ───────────────
  async getStats() {
    const [total, active, inactive, featured, outOfStock] = await Promise.all([
      productRepository.count({}),
      productRepository.count({ isActive: true }),
      productRepository.count({ isActive: false }),
      productRepository.count({ isFeatured: true }),
      productRepository.count({ stock: 0 }),
    ]);

    return { total, active, inactive, featured, outOfStock };
  },

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
  },

  async updateProduct(id, data) {
    if (data.discountPrice && data.price && data.discountPrice >= data.price) {
      throw new Error("Invalid discount");
    }

    const updated = await productRepository.update(id, data);
    if (!updated) throw new Error("Update failed");
    return updated;
  },

  async deleteProduct(id) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new Error("Delete failed");
    return deleted;
  },
};
