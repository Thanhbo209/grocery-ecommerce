// ─── ProductCard ──────────────────────────────────────────────────────────────

import { formatNumber, formatPrice, UNIT_LABEL } from "@/lib/format";
import { discountPct, productImg } from "@/lib/helper";
import type { Product } from "@/types/product";
import { Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProductCard({
  product,
  view,
}: {
  product: Product;
  view: "grid" | "list";
}) {
  const navigate = useNavigate();
  const img = productImg(product);
  const effectivePrice = product.discountPrice ?? product.price;
  const unit = UNIT_LABEL[product.unit] ?? product.unit;
  const outOfStock = product.stock === 0;

  if (view === "list") {
    return (
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="group flex cursor-pointer gap-4 rounded-2xl border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
      >
        {/* Image */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {product.discountPrice && (
            <span className="absolute left-1 top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              -{discountPct(product.price, product.discountPrice)}%
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
              <span className="text-[10px] font-semibold text-white">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div>
            <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.category?.name}
            </p>
            {product.description && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-primary">
                {formatPrice(effectivePrice)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                /{unit}
              </span>
              {product.discountPrice && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.ratings.count > 0 && (
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {product.ratings.average.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add button */}
        <div className="flex items-center">
          <button
            disabled={outOfStock}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Star size={8} className="fill-white" /> Nổi bật
          </span>
        )}
        {product.discountPrice && (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
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

        {/* Rating */}
        {product.ratings.count > 0 && (
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-muted-foreground">
              {product.ratings.average.toFixed(1)} (
              {formatNumber(product.ratings.count)})
            </span>
          </div>
        )}

        {/* Price + Add */}
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
