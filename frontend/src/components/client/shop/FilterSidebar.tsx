import { Button } from "@/components/ui/button";
import { PRICE_RANGES, SORT_OPTIONS } from "@/constants/shop-page";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FilterState } from "@/types/filter";
import type { Category } from "@/types/product";
import { ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export interface FilterSidebarProps {
  filters: FilterState;
  categories: Category[];
  productCount: number;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

export function FilterSidebar({
  filters,
  categories,
  productCount,
  onChange,
  onReset,
}: FilterSidebarProps) {
  const [catExpanded, setCatExpanded] = useState(true);
  const [priceExpanded, setPriceExpanded] = useState(true);

  const hasActiveFilters =
    filters.categoryId !== "" ||
    filters.priceRange !== null ||
    filters.isFeatured ||
    filters.inStockOnly ||
    filters.sort !== "newest";

  return (
    <aside className="flex flex-col gap-0 divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-primary" />
          <span className="text-sm font-semibold">Bộ lọc</span>
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {
                [
                  filters.categoryId !== "",
                  filters.priceRange !== null,
                  filters.isFeatured,
                  filters.inStockOnly,
                  filters.sort !== "newest",
                ].filter(Boolean).length
              }
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RotateCcw size={11} /> Xoá lọc
          </button>
        )}
      </div>

      {/* Quick tags */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Lọc nhanh
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={filters.isFeatured}
              onChange={(e) =>
                onChange({ ...filters, isFeatured: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <span className="text-sm">Sản phẩm nổi bật</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onChange({ ...filters, inStockOnly: e.target.checked })
              }
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <span className="text-sm">Còn hàng</span>
          </label>
        </div>
      </div>

      {/* Sort */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sắp xếp
        </p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, sort: opt.value })}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
                filters.sort === opt.value
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {opt.label}
              {filters.sort === opt.value && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="px-4 py-3 space-y-2">
        <button
          onClick={() => setCatExpanded((o) => !o)}
          className="flex w-full items-center justify-between"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Danh mục
          </p>
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground transition-transform",
              catExpanded && "rotate-180",
            )}
          />
        </button>
        {catExpanded && (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onChange({ ...filters, categoryId: "" })}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
                filters.categoryId === ""
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onChange({ ...filters, categoryId: cat._id })}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
                  filters.categoryId === cat._id
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="px-4 py-3 space-y-2">
        <button
          onClick={() => setPriceExpanded((o) => !o)}
          className="flex w-full items-center justify-between"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Khoảng giá
          </p>
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground transition-transform",
              priceExpanded && "rotate-180",
            )}
          />
        </button>
        {priceExpanded && (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onChange({ ...filters, priceRange: null })}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm transition-colors text-left",
                filters.priceRange === null
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Tất cả mức giá
            </button>
            {PRICE_RANGES.map((range, i) => (
              <button
                key={i}
                onClick={() => onChange({ ...filters, priceRange: i })}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm transition-colors text-left",
                  filters.priceRange === i
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground text-center">
          {formatNumber(productCount)} sản phẩm
        </p>
      </div>
    </aside>
  );
}

// ─── Mobile Filter Drawer ─────────────────────────────────────────────────────

export function MobileFilterDrawer({
  open,
  onClose,
  filters,
  categories,
  productCount,
  onChange,
  onReset,
}: FilterSidebarProps & { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <span className="text-sm font-semibold">Bộ lọc</span>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X size={18} />
          </button>
        </div>
        <FilterSidebar
          filters={filters}
          categories={categories}
          productCount={productCount}
          onChange={(f) => {
            onChange(f);
          }}
          onReset={() => {
            onReset();
            onClose();
          }}
        />
        <div className="p-4">
          <Button className="w-full" onClick={onClose}>
            Xem {formatNumber(productCount)} sản phẩm
          </Button>
        </div>
      </div>
    </>
  );
}
