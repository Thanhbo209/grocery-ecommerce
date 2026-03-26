import type { SORT_OPTIONS } from "@/constants/shop-page";

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export interface FilterState {
  categoryId: string;
  sort: SortValue;
  priceRange: number | null; // index in PRICE_RANGES
  isFeatured: boolean;
  inStockOnly: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  categoryId: "",
  sort: "newest",
  priceRange: null,
  isFeatured: false,
  inStockOnly: false,
};
