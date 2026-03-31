import { discountPct } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";

const PLACEHOLDER = "https://placehold.co/600x600/f0fdf4/166534?text=SP";

function allImages(p: Product): string[] {
  const imgs = p.images?.length ? p.images : [];
  if (p.thumbnail && !imgs.includes(p.thumbnail)) return [p.thumbnail, ...imgs];
  return imgs.length ? imgs : [PLACEHOLDER];
}

export function ImageGallery({ product }: { product: Product }) {
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
