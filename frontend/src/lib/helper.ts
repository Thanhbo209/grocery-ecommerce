// ─── Helpers ──────────────────────────────────────────────────────────────────

import type { SORT_OPTIONS } from "@/constants/shop-page";
import type { Product, ProductFilters } from "@/types/product";

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
