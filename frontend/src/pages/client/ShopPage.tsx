import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  LayoutGrid,
  List,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categoryApi, productApi } from "@/hooks/api";
import { formatNumber } from "@/lib/format";
import type {
  Category,
  PaginatedResponse,
  Product,
  ProductFilters,
} from "@/types/product";
import { PAGE_SIZE, PRICE_RANGES } from "@/constants/shop-page";
import { sortToFilters } from "@/lib/helper";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductCard } from "@/components/client/shop/ProductCard";
import {
  DEFAULT_FILTERS,
  type FilterState,
  type SortValue,
} from "@/types/filter";
import {
  FilterSidebar,
  MobileFilterDrawer,
} from "@/components/client/shop/FilterSidebar";
import { ProductSkeleton } from "@/components/client/shop/ProductSkeleton";
import { Pagination } from "@/components/client/shop/Pagination";
import { ActiveFilterBadges } from "@/components/client/shop/ActiveFilter";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const [localSearch, setLocalSearch] = useState(
    searchParams.get("search") ?? "",
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const safePage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawPrice = searchParams.get("priceRange");
  const parsedPrice = rawPrice !== null ? Number.parseInt(rawPrice, 10) : null;
  const safePriceRange =
    parsedPrice !== null &&
    Number.isInteger(parsedPrice) &&
    parsedPrice >= 0 &&
    parsedPrice < PRICE_RANGES.length
      ? parsedPrice
      : null;

  const [filters, setFilters] = useState<FilterState>({
    categoryId: searchParams.get("category") ?? "",
    sort: (searchParams.get("sort") as SortValue) ?? "newest",
    priceRange: safePriceRange,
    isFeatured: searchParams.get("featured") === "true",
    inStockOnly: searchParams.get("inStockOnly") === "true",
  });

  const [page, setPage] = useState(safePage);
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(localSearch, 400);

  // Sync filters → URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (filters.categoryId) p.set("category", filters.categoryId);
    if (filters.sort !== "newest") p.set("sort", filters.sort);
    if (filters.priceRange !== null)
      p.set("priceRange", String(filters.priceRange));
    if (filters.isFeatured) p.set("featured", "true");
    if (filters.inStockOnly) p.set("inStockOnly", "true");
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [debouncedSearch, filters, page, setSearchParams]);

  // Fetch categories once
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  // Build ProductFilters from local state
  const productFilters = useMemo<ProductFilters>(() => {
    const sorted = sortToFilters(filters.sort);
    return {
      search: debouncedSearch,
      category: filters.categoryId,
      isActive: true,
      isFeatured: filters.isFeatured ? true : "",
      ...sorted,
      page,
      pageSize: PAGE_SIZE,
    };
  }, [debouncedSearch, filters, page]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    productApi
      .getAll(productFilters)
      .then((data) => {
        if (!cancelled) {
          // Client-side filter: inStockOnly, priceRange (backend doesn't support)
          let products = data.data;

          if (filters.inStockOnly) {
            products = products.filter((p) => p.stock > 0);
          }

          const priceR =
            filters.priceRange !== null
              ? PRICE_RANGES[filters.priceRange]
              : null;
          if (priceR) {
            products = products.filter(
              (p) =>
                (p.discountPrice ?? p.price) >= priceR.min &&
                (p.discountPrice ?? p.price) <= priceR.max,
            );
          }

          setResult({ ...data, data: products });
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productFilters, filters.inStockOnly, filters.priceRange]);

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setLocalSearch("");
    setPage(1);
  }, []);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const products = result?.data ?? [];
  const totalProducts = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;

  const activeCatName = categories.find(
    (c) => c._id === filters.categoryId,
  )?.name;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* ── Page header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeCatName ?? "Tất Cả Sản Phẩm"}
          </h1>
          <nav className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground ">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">
              {activeCatName ?? "Cửa hàng"}
            </span>
          </nav>
        </div>

        {/* ── Search bar ── */}
        <div className="mb-5 relative flex items-center rounded-2xl border border-border bg-muted/40 focus-within:border-primary focus-within:bg-background transition-all">
          <Search size={16} className="absolute left-4 text-muted-foreground" />
          <input
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm rau củ, thịt, trái cây, đồ khô..."
            className="h-11 w-full bg-transparent pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                setPage(1);
              }}
              className="absolute right-3 rounded-full p-1 hover:bg-muted"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar — desktop ── */}
          <div className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-26">
              <FilterSidebar
                filters={filters}
                categories={categories}
                productCount={totalProducts}
                onChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition-colors lg:hidden"
              >
                <Filter size={14} />
                Bộ lọc
                {(filters.categoryId ||
                  filters.priceRange !== null ||
                  filters.isFeatured ||
                  filters.inStockOnly) && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    !
                  </span>
                )}
              </button>

              {/* Result count */}
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" /> Đang tải...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {formatNumber(totalProducts)}
                    </span>{" "}
                    sản phẩm
                    {debouncedSearch && (
                      <>
                        {" "}
                        cho "
                        <span className="font-medium">{debouncedSearch}</span>"
                      </>
                    )}
                  </>
                )}
              </p>

              {/* View toggle */}
              <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-card p-1">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "rounded-sm p-1.5 transition-colors",
                    view === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "rounded-sm p-1.5 transition-colors",
                    view === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Active filter badges */}
            <div className="mb-4">
              <ActiveFilterBadges
                filters={filters}
                categories={categories}
                onChange={handleFilterChange}
              />
            </div>

            {/* Product grid / list */}
            {loading ? (
              <div
                className={cn(
                  view === "grid"
                    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-2",
                )}
              >
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <ProductSkeleton key={i} view={view} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="text-5xl">🥦</div>
                <p className="text-lg font-semibold">Không tìm thấy sản phẩm</p>
                <p className="text-sm text-muted-foreground">
                  Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="mt-1"
                >
                  <RotateCcw size={14} className="mr-2" /> Xoá bộ lọc
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  view === "grid"
                    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-2",
                )}
              >
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} view={view} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        categories={categories}
        productCount={totalProducts}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
    </div>
  );
}
