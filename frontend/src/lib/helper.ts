// Helpers

import type { SORT_OPTIONS } from "@/constants/shop-page";
import type { Address, UserProfile } from "@/types/auth";
import type { Category } from "@/types/category";
import type { ShippingAddress } from "@/types/check-out";
import type {
  PaginatedResponse,
  Product,
  ProductFilters,
  RawListResponse,
} from "@/types/product";

const PLACEHOLDER = "https://placehold.co/400x400/f0fdf4/166534?text=SP";
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type ProductImageSource = {
  thumbnail?: string;
  images?: string[];
};

export function productImg(p: ProductImageSource) {
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

    const pag = raw.pagination;
    total = pag?.total ?? raw.total ?? rawItems.length;
    page = pag?.page ?? raw.page ?? filters.page;
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

    limit: String(filters.pageSize),
  });

  if (filters.search.trim()) params.set("search", filters.search.trim());

  if (filters.category) params.set("category", filters.category);

  if (filters.isActive !== "") params.set("isActive", String(filters.isActive));

  if (filters.isFeatured !== "")
    params.set("isFeatured", String(filters.isFeatured));

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

// CheckOutPage Helpers

export function getStoredAddresses(): ShippingAddress[] {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return [];
    const user = JSON.parse(raw);
    return user.addresses ?? [];
  } catch {
    return [];
  }
}

// Checkout Helpers
export function mapProfileToShipping(p: UserProfile): ShippingAddress {
  const def =
    p.addresses?.find((a: Address) => a.isDefault) ?? p.addresses?.[0];

  return {
    name: p.name ?? "",
    phone: p.phone ?? "",
    street: def?.street ?? "",
    district: def?.district ?? "",
    city: def?.city ?? "",
    label: def?.label,
  };
}

export const validate = (
  value: ShippingAddress,
  setErrors: (errs: Partial<ShippingAddress>) => void,
): boolean => {
  const errs: Partial<ShippingAddress> = {};
  if (!value.name.trim()) errs.name = "Vui lòng nhập họ tên";
  if (!value.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
  else if (!/^(0|\+84)\d{9}$/.test(value.phone.trim()))
    errs.phone = "Số điện thoại không hợp lệ";
  if (!value.street.trim()) errs.street = "Vui lòng nhập địa chỉ";
  if (!value.city.trim()) errs.city = "Vui lòng nhập thành phố";
  setErrors(errs);
  return Object.keys(errs).length === 0;
};
