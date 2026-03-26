import { PRICE_RANGES, SORT_OPTIONS } from "@/constants/shop-page";
import type { FilterState } from "@/types/filter";
import type { Category } from "@/types/product";
import { X } from "lucide-react";

export function ActiveFilterBadges({
  filters,
  categories,
  onChange,
}: {
  filters: FilterState;
  categories: Category[];
  onChange: (f: FilterState) => void;
}) {
  const badges: { label: string; onRemove: () => void }[] = [];

  if (filters.categoryId) {
    const cat = categories.find((c) => c._id === filters.categoryId);
    if (cat)
      badges.push({
        label: cat.name,
        onRemove: () => onChange({ ...filters, categoryId: "" }),
      });
  }
  if (filters.priceRange !== null) {
    badges.push({
      label: PRICE_RANGES[filters.priceRange].label,
      onRemove: () => onChange({ ...filters, priceRange: null }),
    });
  }
  if (filters.isFeatured)
    badges.push({
      label: "Nổi bật",
      onRemove: () => onChange({ ...filters, isFeatured: false }),
    });
  if (filters.inStockOnly)
    badges.push({
      label: "Còn hàng",
      onRemove: () => onChange({ ...filters, inStockOnly: false }),
    });
  if (filters.sort !== "newest") {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sort);
    if (opt)
      badges.push({
        label: opt.label,
        onRemove: () => onChange({ ...filters, sort: "newest" }),
      });
  }

  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Đang lọc:</span>
      {badges.map(({ label, onRemove }) => (
        <button
          key={label}
          onClick={onRemove}
          className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          {label}
          <X size={11} />
        </button>
      ))}
    </div>
  );
}
