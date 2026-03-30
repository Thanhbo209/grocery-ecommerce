import {
  buildProductQuery,
  normalizeListResponse,
  normalizeProduct,
} from "@/lib/helper";
import { request } from "@/lib/request";
import type {
  CreateProductPayload,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductStats,
  RawListResponse,
  UpdateProductPayload,
} from "@/types/product";

export const productApi = {
  getAll: async (
    filters: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const raw = await request<RawListResponse | Product[]>(
      `/api/products?${buildProductQuery(filters)}`,
    );
    return normalizeListResponse(raw, filters);
  },

  getById: async (id: string): Promise<Product> => {
    const raw = await request<Product>(`/api/products/${id}`);
    return normalizeProduct(raw);
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const raw = await request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeProduct(raw);
  },

  update: async ({
    id,
    ...payload
  }: UpdateProductPayload): Promise<Product> => {
    const raw = await request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeProduct(raw);
  },

  delete: (id: string): Promise<void> =>
    request<void>(`/api/products/${id}`, { method: "DELETE" }),

  // /products/stats không tồn tại trên backend (Express match "stats" vào /:id)
  // → tính từ dữ liệu đã fetch thay vì gọi API riêng
  // GET /api/products/stats
  // Route này phải đứng TRƯỚC /:id trong product.routes.js
  getStats: () => request<ProductStats>("/api/products/stats"),
};
