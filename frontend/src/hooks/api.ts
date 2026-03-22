import type {
  Category,
  CreateProductPayload,
  PaginatedResponse,
  Product,
  ProductFilters,
  ProductStats,
  UpdateProductPayload,
} from "../types/product";

// ─── Base URL ─────────────────────────────────────────────────────────────────
// VITE_API_URL = "http://localhost:5000"  (không có /api ở cuối)
// Routes backend: app.use("/api/products", ...), app.use("/api/categories", ...)
const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");

// ─── Auth token ───────────────────────────────────────────────────────────────
// Lấy JWT từ localStorage (key phổ biến, đổi nếu project dùng key khác)
function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("jwt") ??
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Raw Mongoose shapes ──────────────────────────────────────────────────────

interface RawCategory {
  _id?: unknown;
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RawProduct {
  _id?: unknown;
  name?: string;
  slug?: string;
  description?: string;
  category?: RawCategory | string | null;
  price?: number;
  discountPrice?: number;
  unit?: string;
  stock?: number;
  images?: unknown;
  thumbnail?: string;
  ratings?: { average?: number; count?: number };
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RawPagination {
  total?: number;
  page?: number;
  limit?: number; // backend dùng "limit" không phải "pageSize"
  pageSize?: number;
  totalPages?: number;
  totalPage?: number;
}

interface RawListResponse {
  data?: RawProduct[];
  products?: RawProduct[];
  // flat fields (một số backend trả flat)
  total?: number;
  page?: number;
  limit?: number;
  pageSize?: number;
  totalPages?: number;
  totalPage?: number;
  // backend hiện tại bọc trong "pagination" object
  pagination?: RawPagination;
}

// ─── Normalize helpers ────────────────────────────────────────────────────────

function toIdString(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && "toString" in raw)
    return (raw as { toString(): string }).toString();
  return String(raw);
}

function normalizeCategory(
  raw: RawCategory | string | null | undefined,
): Category {
  if (!raw || typeof raw === "string") {
    return {
      _id: typeof raw === "string" ? raw : "",
      name: "—",
      slug: "",
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
  }
  return {
    _id: toIdString(raw._id),
    name: raw.name ?? "—",
    slug: raw.slug ?? "",
    description: raw.description,
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

function normalizeProduct(raw: RawProduct): Product {
  return {
    _id: toIdString(raw._id),
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: raw.description,
    category: normalizeCategory(raw.category),
    price: typeof raw.price === "number" ? raw.price : 0,
    discountPrice:
      typeof raw.discountPrice === "number" ? raw.discountPrice : undefined,
    unit: (raw.unit as Product["unit"]) ?? "cái",
    stock: typeof raw.stock === "number" ? raw.stock : 0,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : undefined,
    ratings: {
      average: raw.ratings?.average ?? 0,
      count: raw.ratings?.count ?? 0,
    },
    isActive: raw.isActive ?? true,
    isFeatured: raw.isFeatured ?? false,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

function normalizeListResponse(
  raw: RawListResponse | RawProduct[],
  filters: ProductFilters,
): PaginatedResponse<Product> {
  let rawItems: RawProduct[];
  let total: number;
  let page: number;
  let pageSize: number;
  let totalPages: number;

  if (Array.isArray(raw)) {
    rawItems = raw;
    total = raw.length;
    page = filters.page;
    pageSize = filters.pageSize;
    totalPages = Math.ceil(total / pageSize) || 1;
  } else {
    const arr = raw.data ?? raw.products ?? [];
    rawItems = Array.isArray(arr) ? arr : [];

    // Backend hiện tại bọc pagination trong object "pagination"
    // { data: [...], pagination: { total, page, limit, totalPages } }
    const pag = raw.pagination;
    total = pag?.total ?? raw.total ?? rawItems.length;
    page = pag?.page ?? raw.page ?? filters.page;
    // backend dùng "limit", không phải "pageSize"
    pageSize =
      pag?.limit ??
      pag?.pageSize ??
      raw.limit ??
      raw.pageSize ??
      filters.pageSize;
    totalPages =
      (pag?.totalPages ??
        pag?.totalPage ??
        raw.totalPages ??
        raw.totalPage ??
        Math.ceil(total / pageSize)) ||
      1;
  }

  const validItems = rawItems.filter(
    (item): item is RawProduct => item !== null && item !== undefined,
  );

  return {
    data: validItems.map(normalizeProduct),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ─── Request ──────────────────────────────────────────────────────────────────

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ??
        `HTTP ${res.status} ${res.statusText}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Query builder ────────────────────────────────────────────────────────────

export function buildProductQuery(filters: ProductFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    // backend đọc "limit" — không phải "pageSize"
    limit: String(filters.pageSize),
  });

  if (filters.search.trim()) params.set("search", filters.search.trim());

  // category: ObjectId string
  if (filters.category) params.set("category", filters.category);

  // isActive: backend service mặc định filter { isActive: true } cho public
  // Admin cần truyền isActive=false để xem sản phẩm ẩn
  if (filters.isActive !== "") params.set("isActive", String(filters.isActive));

  // isFeatured
  if (filters.isFeatured !== "")
    params.set("isFeatured", String(filters.isFeatured));

  // sort — backend nhận format: price_asc | price_desc | rating | newest(default)
  if (filters.sortField === "price" && filters.sortOrder === "asc")
    params.set("sort", "price_asc");
  else if (filters.sortField === "price" && filters.sortOrder === "desc")
    params.set("sort", "price_desc");
  else if (filters.sortField === "discountPrice")
    params.set(
      "sort",
      filters.sortOrder === "asc" ? "price_asc" : "price_desc",
    );

  return params.toString();
}

// ─── Product API ──────────────────────────────────────────────────────────────

export const productApi = {
  getAll: async (
    filters: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const raw = await request<RawListResponse | RawProduct[]>(
      `/products?${buildProductQuery(filters)}`,
    );
    return normalizeListResponse(raw, filters);
  },

  getById: async (id: string): Promise<Product> => {
    const raw = await request<RawProduct>(`/products/${id}`);
    return normalizeProduct(raw);
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const raw = await request<RawProduct>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeProduct(raw);
  },

  update: async ({
    id,
    ...payload
  }: UpdateProductPayload): Promise<Product> => {
    const raw = await request<RawProduct>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeProduct(raw);
  },

  delete: (id: string): Promise<void> =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  // /products/stats không tồn tại trên backend (Express match "stats" vào /:id)
  // → tính từ dữ liệu đã fetch thay vì gọi API riêng
  // GET /api/products/stats
  // Route này phải đứng TRƯỚC /:id trong product.routes.js
  getStats: () => request<ProductStats>("/products/stats"),
};

// ─── Category API ─────────────────────────────────────────────────────────────

// ─── Category payloads ────────────────────────────────────────────────────────

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  id: string;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const raw = await request<
      RawCategory[] | { data?: RawCategory[]; categories?: RawCategory[] }
    >("/categories");
    const arr = Array.isArray(raw) ? raw : (raw.data ?? raw.categories ?? []);
    return arr
      .filter((c): c is RawCategory => c !== null && c !== undefined)
      .map(normalizeCategory);
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const raw = await request<RawCategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeCategory(raw) as Category;
  },

  update: async ({
    id,
    ...payload
  }: UpdateCategoryPayload): Promise<Category> => {
    const raw = await request<RawCategory>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeCategory(raw) as Category;
  },

  delete: (id: string): Promise<void> =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
};
