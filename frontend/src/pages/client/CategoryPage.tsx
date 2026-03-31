import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, Plus, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, UNIT_LABEL } from "@/lib/format";
import type { PaginatedResponse, Product } from "@/types/product";
import { discountPct, productImg } from "@/lib/helper";
import { CardSkeleton } from "@/components/client/category/CategorySkeleton";
import { PAGE_SIZE } from "@/constants/shop-page";
import { Pagination } from "@/components/client/category/CategoryPagination";
import { OtherCategories } from "@/components/client/category/OtherCategories";
import type { Category } from "@/types/category";
import { productApi } from "@/api/productApi";
import { categoryApi } from "@/api/categoryApi";

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Mới nhất",
    sortField: "createdAt" as const,
    sortOrder: "desc" as const,
  },
  {
    value: "price_asc",
    label: "Giá thấp → cao",
    sortField: "price" as const,
    sortOrder: "asc" as const,
  },
  {
    value: "price_desc",
    label: "Giá cao → thấp",
    sortField: "price" as const,
    sortOrder: "desc" as const,
  },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const outOfStock = product.stock === 0;
  const effectivePrice = product.discountPrice ?? product.price;
  const unit = UNIT_LABEL[product.unit] ?? product.unit;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/product/${product._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/product/${product._id}`);
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-card">
        <img
          src={productImg(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Star size={8} className="fill-white" /> Nổi bật
          </span>
        )}
        {product.discountPrice && (
          <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">
            -{discountPct(product.price, product.discountPrice)}%
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug">
          {product.name}
        </p>
        {product.description && (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {product.description}
          </p>
        )}
        {product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-muted-foreground">
              {product.ratings.average.toFixed(1)}
              <span className="ml-1">
                ({formatNumber(product.ratings.count)})
              </span>
            </span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <p className="text-sm font-bold text-primary">
              {formatPrice(effectivePrice)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {product.discountPrice ? (
                <span className="line-through">
                  {formatPrice(product.price)}
                </span>
              ) : (
                `/${unit}`
              )}
            </p>
          </div>
          <button
            disabled={outOfStock}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PaginatedResponse<Product> | null>(null);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);

  // Fetch all categories (for sidebar + breadcrumb)
  useEffect(() => {
    categoryApi.getAll().then(setAllCategories).catch(console.error);
  }, []);

  // Fetch category by slug
  useEffect(() => {
    if (!slug) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingCat(true);
    setCatError(null);
    setPage(1);

    categoryApi
      .getBySlug(slug)
      .then(setCategory)
      .catch(() => setCatError("Không tìm thấy danh mục"))
      .finally(() => setLoadingCat(false));
  }, [slug]);

  // Fetch products by category._id
  useEffect(() => {
    if (!category) return;

    const sortOpt =
      SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingProducts(true);
    setProductError(null);
    productApi
      .getAll({
        search: "",
        category: category._id ?? "",
        isActive: true,
        isFeatured: "",
        sortField: sortOpt.sortField,
        sortOrder: sortOpt.sortOrder,
        page,
        pageSize: PAGE_SIZE,
      })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setProductError("Không thể tải sản phẩm");
      })
      .finally(() => {
        if (!cancelled) setLoadingProducts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, sort, page]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loadingCat) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (catError || !category) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🥬</div>
        <p className="text-lg font-semibold">Danh mục không tồn tại</p>
        <p className="text-sm text-muted-foreground">
          Danh mục này có thể đã bị xóa hoặc chưa được tạo
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <RotateCcw size={14} className="mr-2" /> Về trang chủ
        </Button>
      </div>
    );
  }

  const products = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl pt-20 px-4 py-8">
        {/* Sort bar + result count */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {!loadingProducts && (
              <>
                Hiển thị{" "}
                <span className="font-semibold text-foreground">
                  {formatNumber(Math.min(page * PAGE_SIZE, total))}
                </span>
                /{formatNumber(total)} sản phẩm
              </>
            )}
          </p>

          {/* Sort tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSort(opt.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  sort === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Other categories */}
        <OtherCategories categories={allCategories} currentSlug={slug ?? ""} />

        {/* Product grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : productError ? (
          <div className="py-24 text-center text-sm text-destructive">
            {productError}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="text-6xl">🥦</div>
            <p className="text-lg font-semibold">Chưa có sản phẩm</p>
            <p className="text-sm text-muted-foreground">
              Danh mục này chưa có sản phẩm nào. Quay lại sau nhé!
            </p>
            <Button variant="outline" asChild>
              <Link to="/shop">
                <ArrowRight size={14} className="mr-2" /> Xem tất cả sản phẩm
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
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
  );
}
