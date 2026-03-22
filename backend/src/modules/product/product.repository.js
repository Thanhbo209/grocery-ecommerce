import Product from "./product.model.js";

export const productRepository = {
  create: (data) => Product.create(data),

  findAll: (filter, options) =>
    Product.find(filter)
      .populate("category", "name slug")
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit),

  findById: (id) => Product.findById(id).populate("category", "name slug"),

  findBySlug: (slug) => Product.findOne({ slug }),

  update: (id, data) => Product.findByIdAndUpdate(id, data, { new: true }),

  delete: (id) => Product.findByIdAndDelete(id),

  count: (filter) => Product.countDocuments(filter),
};
