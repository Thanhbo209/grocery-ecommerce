import type { Category } from "@/types/category";

export type ProductUnit =
  | "kg"
  | "gram"
  | "cái"
  | "hộp"
  | "lít"
  | "chai"
  | "bó"
  | "túi"
  | "gói";

// Ratings sub-document

export interface ProductRatings {
  average: number;
  count: number;
}

// Product

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: Category;
  price: number;
  discountPrice?: number;
  unit: ProductUnit;
  stock: number;
  images: string[];
  thumbnail?: string;
  ratings: ProductRatings;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── 5. API Payloads ──────────────────────────────────────────────────────────

export interface CreateProductPayload {
  name: string;
  description?: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: ProductUnit;
  stock: number;
  images?: string[];
  thumbnail?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Filter & Sort

export type SortField =
  | "name"
  | "price"
  | "discountPrice"
  | "stock"
  | "createdAt";

export type SortOrder = "asc" | "desc";

export interface ProductFilters {
  search: string;
  category: string;
  isActive: boolean | "";
  isFeatured: boolean | "";
  sortField: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

//  Stats

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  outOfStock: number;
}

// Raw Mongoose shapes

export interface RawPagination {
  total?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
  totalPage?: number;
}

export interface RawListResponse {
  data?: Product[];
  products?: Product[];
  total?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
  totalPage?: number;
  pagination?: RawPagination;
}
