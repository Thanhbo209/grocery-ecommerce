// Helpers

import type { SORT_OPTIONS } from "@/constants/shop-page";
import type { Category } from "@/types/category";
import type {
  PaginatedResponse,
  Product,
  ProductFilters,
  RawListResponse,
} from "@/types/product";

const PLACEHOLDER = "https://placehold.co/400x400/f0fdf4/166534?text=SP";
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export function productImg(p: Product) {
  return p.thumbnail ?? p.images?.[0] ?? PLACEHOLDER;
}

export function discountPct(price: number, dp: number) {
  return Math.round(((price - dp) / price) * 100);
}

export function sortToFilters(
  sort: SortValue,
): Pick<ProductFilters, "sortField" | "sortOrder"> {
  switch (sort) {
    case "price_asc":
      return { sortField: "price", sortOrder: "asc" };
    case "price_desc":
      return { sortField: "price", sortOrder: "desc" };
    case "rating":
      return { sortField: "createdAt", sortOrder: "desc" }; // best available
    default:
      return { sortField: "createdAt", sortOrder: "desc" };
  }
}

// ─── Normalize helpers ────────────────────────────────────────────────────────

export function toIdString(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && "toString" in raw)
    return (raw as { toString(): string }).toString();
  return String(raw);
}

export function normalizeCategory(
  raw: Category | string | null | undefined,
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

export function normalizeProduct(raw: Product): Product {
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

export function normalizeListResponse(
  raw: RawListResponse | Product[],
  filters: ProductFilters,
): PaginatedResponse<Product> {
  let rawItems: Product[];
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
    (item): item is Product => item !== null && item !== undefined,
  );

  return {
    data: validItems.map(normalizeProduct),
    total,
    page,
    pageSize,
    totalPages,
  };
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
