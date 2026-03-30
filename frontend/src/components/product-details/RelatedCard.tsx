// ─── Related Product Card ─────────────────────────────────────────────────────

import { formatPrice } from "@/lib/format";
import { discountPct } from "@/lib/helper";
import type { Product } from "@/types/product";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PLACEHOLDER = "https://placehold.co/600x600/f0fdf4/166534?text=SP";

function allImages(p: Product): string[] {
  const imgs = p.images?.length ? p.images : [];
  if (p.thumbnail && !imgs.includes(p.thumbnail)) return [p.thumbnail, ...imgs];
  return imgs.length ? imgs : [PLACEHOLDER];
}
export function RelatedCard({ product }: { product: Product }) {
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
