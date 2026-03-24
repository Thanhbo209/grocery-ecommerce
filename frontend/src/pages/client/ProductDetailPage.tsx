import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, UNIT_LABEL } from "@/lib/format";
import { productApi } from "@/hooks/api";
import type { Product } from "@/types/product";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLACEHOLDER = "https://placehold.co/600x600/f0fdf4/166534?text=SP";

function allImages(p: Product): string[] {
  const imgs = p.images?.length ? p.images : [];
  if (p.thumbnail && !imgs.includes(p.thumbnail)) return [p.thumbnail, ...imgs];
  return imgs.length ? imgs : [PLACEHOLDER];
}

function discountPct(price: number, discountPrice: number) {
  return Math.round(((price - discountPrice) / price) * 100);
}

// ─── Image Gallery ────────────────────────────────────────────────────────────

function ImageGallery({ product }: { product: Product }) {
  const imgs = allImages(product);
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setActive((i) => (i + 1) % imgs.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square">
        <img
          key={active}
          src={imgs[active]}
          alt={product.name}
          className="h-full w-full object-cover transition-opacity duration-300"
        />

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <Star size={10} className="fill-white" /> Nổi bật
            </span>
          )}
          {product.discountPrice && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              -{discountPct(product.price, product.discountPrice)}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-xl bg-black/70 px-5 py-2 text-sm font-semibold text-white">
              Hết hàng
            </span>
          </div>
        )}

        {/* Arrow nav */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm hover:bg-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === active
                  ? "border-emerald-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quantity Selector ────────────────────────────────────────────────────────

function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-border overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus size={15} />
      </button>
      <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

// ─── Rating Stars ─────────────────────────────────────────────────────────────

function RatingStars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

// ─── Info Specs Table ─────────────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

// ─── Related Product Card ─────────────────────────────────────────────────────

function RelatedCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const img = allImages(product)[0];

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.discountPrice && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{discountPct(product.price, product.discountPrice)}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">
              Hết hàng
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug">
          {product.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-bold text-emerald-600">
              {formatPrice(product.discountPrice ?? product.price)}
            </p>
            {product.discountPrice && (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Related Products ─────────────────────────────────────────────────────────

function RelatedProducts({
  categoryId,
  excludeId,
}: {
  categoryId: string;
  excludeId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    productApi
      .getAll({
        search: "",
        category: categoryId,
        isActive: true,
        isFeatured: "",
        sortField: "createdAt",
        sortOrder: "desc",
        page: 1,
        pageSize: 10,
      })
      .then((res) => {
        setProducts(res.data.filter((p) => p._id !== excludeId).slice(0, 8));
      })
      .catch(console.error);
  }, [categoryId, excludeId]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 280 : -280,
      behavior: "smooth",
    });
  };

  if (!products.length) return null;

  return (
    <section className="mt-16">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">
          Sản phẩm cùng danh mục
        </h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="grid grid-flow-col auto-cols-[160px] gap-3 overflow-x-auto pb-3 scrollbar-hide sm:auto-cols-[180px]"
      >
        {products.map((p) => (
          <RelatedCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Skeleton className="mb-6 h-5 w-48" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setQty(1);
    setAddedToCart(false);

    productApi
      .getById(id)
      .then(setProduct)
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Không tìm thấy sản phẩm",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    // TODO: dispatch to cart store / context
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Package size={48} className="text-muted-foreground/40" />
        <p className="text-lg font-semibold text-muted-foreground">
          {error ?? "Sản phẩm không tồn tại"}
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} className="mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const effectivePrice = product.discountPrice ?? product.price;
  const unit = UNIT_LABEL[product.unit] ?? product.unit;
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* ── Breadcrumb ── */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">
            Cửa hàng
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.category._id}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* LEFT — Gallery */}
          <ImageGallery product={product} />

          {/* RIGHT — Info */}
          <div className="flex flex-col gap-5">
            {/* Category + featured badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/shop?category=${product.category._id}`}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                {product.category.name}
              </Link>
              {product.isFeatured && (
                <Badge className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  ⭐ Nổi bật
                </Badge>
              )}
              {!inStock && (
                <Badge variant="destructive" className="rounded-full text-xs">
                  Hết hàng
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-extrabold leading-snug tracking-tight text-foreground lg:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            {product.ratings.count > 0 && (
              <div className="flex items-center gap-2">
                <RatingStars value={product.ratings.average} />
                <span className="text-sm font-semibold text-amber-600">
                  {product.ratings.average.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({formatNumber(product.ratings.count)} đánh giá)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                {formatPrice(effectivePrice)}
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  /{unit}
                </span>
              </span>
              {product.discountPrice && (
                <div className="flex flex-col items-start">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-red-500">
                    Tiết kiệm{" "}
                    {discountPct(product.price, product.discountPrice)}%
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {/* Specs */}
            <div className="rounded-xl border border-border bg-muted/30 px-4">
              <SpecRow label="Danh mục" value={product.category.name} />
              <SpecRow label="Đơn vị" value={unit} />
              <SpecRow
                label="Tồn kho"
                value={
                  <span
                    className={inStock ? "text-emerald-600" : "text-red-500"}
                  >
                    {inStock
                      ? `${formatNumber(product.stock)} ${unit} còn lại`
                      : "Hết hàng"}
                  </span>
                }
              />
              <SpecRow
                label="Trạng thái"
                value={
                  <span
                    className={
                      product.isActive
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                    }
                  >
                    {product.isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                  </span>
                }
              />
            </div>

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className="flex flex-wrap items-center gap-3">
                <QuantitySelector
                  value={qty}
                  max={product.stock}
                  onChange={setQty}
                />
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 rounded-xl font-semibold transition-all",
                    addedToCart
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700",
                  )}
                >
                  <ShoppingCart size={17} className="mr-2" />
                  {addedToCart ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}
                </Button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                {
                  icon: <Truck size={16} className="text-emerald-600" />,
                  label: "Giao trong 2h",
                  sub: "Nội thành",
                },
                {
                  icon: <ShieldCheck size={16} className="text-emerald-600" />,
                  label: "Đảm bảo chất lượng",
                  sub: "Hoàn tiền 100%",
                },
                {
                  icon: <Zap size={16} className="text-emerald-600" />,
                  label: "Tươi mỗi ngày",
                  sub: "Thu hoạch sáng sớm",
                },
              ].map(({ icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                    {icon}
                  </div>
                  <p className="text-[11px] font-semibold leading-tight">
                    {label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        <RelatedProducts
          categoryId={product.category._id}
          excludeId={product._id}
        />
      </div>
    </div>
  );
}
