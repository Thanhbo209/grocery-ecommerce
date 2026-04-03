// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 20;

export const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao" },
] as const;



export const PRICE_RANGES = [
  { label: "Dưới 50.000₫", min: 0, max: 50000 },
  { label: "50.000 – 100.000₫", min: 50000, max: 100000 },
  { label: "100.000 – 200.000₫", min: 100000, max: 200000 },
  { label: "200.000 – 500.000₫", min: 200000, max: 500000 },
  { label: "Trên 500.000₫", min: 500000, max: 9999999 },
] as const;

// Grocery-specific quick filters
export const QUICK_TAGS = [
  { id: "featured", label: "⭐ Nổi bật", isFeatured: true },
  { id: "instock", label: "✅ Còn hàng", inStock: true },
] as const;
