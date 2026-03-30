import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice, UNIT_LABEL } from "@/lib/format";

import type { Product } from "@/types/product";
import { productApi } from "@/api/productApi";
import { ProductDetailSkeleton } from "@/components/product-details/ProductDetailSkeleton";
import { ImageGallery } from "@/components/product-details/ImageGallery";
import { discountPct } from "@/lib/helper";
import { RelatedProducts } from "@/components/product-details/RelatedProducts";
import { RatingStars } from "@/components/product-details/RatingStars";
import { SpecRow } from "@/components/product-details/SpecRow";
import { QuantitySelector } from "@/components/product-details/QuantitySelector";

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
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setQty(1);
    setAddedToCart(false);

    productApi
      .getById(id)
      .then((nextProduct) => {
        if (!cancelled) setProduct(nextProduct);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Không tìm thấy sản phẩm",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
          categoryId={product.category._id ?? ""}
          excludeId={product._id}
        />
      </div>
    </div>
  );
}
