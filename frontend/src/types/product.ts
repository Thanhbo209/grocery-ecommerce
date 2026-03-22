// =============================================================================
// types/product.ts
// Khớp với:
//   - productSchema  (name, slug, description, category, price, discountPrice,
//                     unit, stock, images[], thumbnail, ratings, isActive,
//                     isFeatured, timestamps)
//   - categorySchema (name, slug, description, isActive, timestamps)
//   - Toàn bộ component: ProductForm, ProductTableRow, ProductToolbar,
//     ProductStatsRow, ViewProductModal, DeleteProductDialog, hooks, api…
// =============================================================================

// ─── 1. Enum: đơn vị tính ─────────────────────────────────────────────────────
// Khớp với productSchema.unit enum — thứ tự giữ nguyên như schema.

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

// ─── 2. Category ──────────────────────────────────────────────────────────────
// Mongoose trả về _id (string sau JSON.stringify), không phải id.
// Dùng bởi: ProductToolbar (cat._id làm value cho Select),
//           ProductForm    (c._id làm key + value cho SelectItem),
//           ProductTableRow (product.category.name),
//           ViewProductModal (product.category.name),
//           useCategories hook.

export interface Category {
  _id: string; // Mongoose ObjectId → string
  name: string; // unique, required
  slug: string; // auto-generated từ name
  description?: string; // optional
  isActive: boolean; // default: true
  createdAt: string; // ISO string (timestamps: true)
  updatedAt: string;
}

// ─── 3. Ratings sub-document ──────────────────────────────────────────────────
// Khớp với productSchema.ratings { average, count }.
// Dùng bởi: ViewProductModal (product.ratings.average, product.ratings.count).

export interface ProductRatings {
  average: number; // 0–5, default 0
  count: number; // default 0
}

// ─── 4. Product ───────────────────────────────────────────────────────────────
// Mongoose trả về sau populate("category").
//
// Mapping các field schema → interface:
//   schema.name          → name          (required)
//   schema.slug          → slug          (auto, read-only trên FE)
//   schema.description   → description?  (optional)
//   schema.category      → category      (populated Category object)
//   schema.price         → price         (required, min 0)
//   schema.discountPrice → discountPrice?(optional, min 0)
//   schema.unit          → unit          (ProductUnit enum)
//   schema.stock         → stock         (required, min 0, default 0)
//   schema.images        → images        (string array)
//   schema.thumbnail     → thumbnail?    (optional string)
//   schema.ratings       → ratings       (ProductRatings)
//   schema.isActive      → isActive      (boolean, default true)
//   schema.isFeatured    → isFeatured    (boolean, default false)
//   timestamps           → createdAt, updatedAt (ISO string)
//
// KHÔNG có: sku, status, originalPrice, sold
// Dùng bởi: ProductTableRow, ProductTable, ViewProductModal,
//           EditProductModal, DeleteProductDialog, ProductForm (edit mode),
//           useProducts, useProductMutation, ProductsPage.

export interface Product {
  _id: string; // Mongoose ObjectId → string (key React, URL params)
  name: string;
  slug: string; // auto-generated server-side, read-only
  description?: string;
  category: Category; // populated — không phải ObjectId thuần
  price: number;
  discountPrice?: number; // undefined nếu không có giảm giá
  unit: ProductUnit;
  stock: number;
  images: string[]; // mảng URL (có thể rỗng)
  thumbnail?: string; // URL ảnh đại diện (priority hiển thị)
  ratings: ProductRatings;
  isActive: boolean; // hiển thị ngoài cửa hàng
  isFeatured: boolean; // xuất hiện ở banner / trang chủ
  createdAt: string; // ISO 8601
  updatedAt: string;
}

// ─── 5. API Payloads ──────────────────────────────────────────────────────────
// Body gửi lên POST /products và PUT /products/:id.
//
// Những field KHÔNG gửi từ client:
//   - slug      → backend tự sinh qua pre("save") hook
//   - ratings   → backend tự quản lý
//   - _id       → do MongoDB tạo
//
// `category` gửi ObjectId string (chưa populate).
// Dùng bởi: ProductForm.formValuesToPayload, useProductMutation,
//           CreateProductModal, EditProductModal, ProductsPage.

export interface CreateProductPayload {
  name: string;
  description?: string;
  category: string; // ObjectId string → ref Category
  price: number;
  discountPrice?: number; // bỏ qua nếu không có
  unit: ProductUnit;
  stock: number;
  images?: string[]; // tuỳ chọn — upload riêng
  thumbnail?: string; // tuỳ chọn
  isActive?: boolean; // default true theo schema
  isFeatured?: boolean; // default false theo schema
}

// PUT /products/:id — id tách riêng khỏi body vì đưa vào URL params.
export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  id: string; // product._id — dùng làm :id trong URL
}

// ─── 6. API Responses ─────────────────────────────────────────────────────────
// Dùng bởi: useProducts (PaginatedResponse<Product>),
//           lib/api.ts   (productApi.getAll return type).

export interface PaginatedResponse<T> {
  data: T[];
  total: number; // tổng số document khớp filter
  page: number; // trang hiện tại (1-indexed)
  pageSize: number; // số item mỗi trang
  totalPages: number; // ceil(total / pageSize)
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// ─── 7. Filter & Sort ─────────────────────────────────────────────────────────
// Dùng bởi: useProducts hook, ProductToolbar, lib/api.buildProductQuery.
//
// isActive / isFeatured dùng boolean | "" thay vì string
//   "" = không lọc (gửi tất cả)
//   true/false = lọc chính xác
// ProductToolbar encode → "all" | "true" | "false" cho <Select>,
// decode về boolean | "" trước khi set vào filters.

export type SortField =
  | "name"
  | "price"
  | "discountPrice"
  | "stock"
  | "createdAt";

export type SortOrder = "asc" | "desc";

export interface ProductFilters {
  search: string; // full-text: indexes name + description
  category: string; // ObjectId string | "" (không lọc)
  isActive: boolean | ""; // "" = tất cả | true = đang bán | false = ẩn
  isFeatured: boolean | ""; // "" = tất cả | true = nổi bật
  sortField: SortField;
  sortOrder: SortOrder;
  page: number; // 1-indexed
  pageSize: number; // số item mỗi trang
}

// ─── 8. Stats ─────────────────────────────────────────────────────────────────
// Kết quả từ GET /products/stats.
// Dùng bởi: ProductStatsRow (total, active, inactive, featured, outOfStock),
//           useProductStats hook.
//
// Mapping với schema:
//   active     ← count { isActive: true }
//   inactive   ← count { isActive: false }
//   featured   ← count { isFeatured: true }
//   outOfStock ← count { stock: 0 }

export interface ProductStats {
  total: number; // tổng số sản phẩm
  active: number; // isActive === true
  inactive: number; // isActive === false
  featured: number; // isFeatured === true
  outOfStock: number; // stock === 0
}
