// ─── 3. FEATURED PRODUCTS ─────────────────────────────────────────────────────

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLACEHOLDER_IMG = "https://placehold.co/400x400/f0fdf4/166534?text=SP";

function productImage(p: Product) {
  return p.thumbnail ?? p.images?.[0] ?? PLACEHOLDER_IMG;
}
function FeaturedCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  return (
    <div
      className="group flex w-50 shrink-0 flex-col overflow-hidden cursor-pointer rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative h-40 overflow-hidden bg-card">
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.discountPrice && (
          <Badge className="absolute left-2 top-3 rounded-full bg-destructive px-2 py-0.5 text-[12px] text-white">
            Giảm giá
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug">
          {product.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <div>
            <p className="text-sm font-bold text-primary">
              {formatPrice(product.discountPrice ?? product.price)}
            </p>
            {product.discountPrice && (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/product/${product._id}`)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white hover:scale-105"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedSection({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 440 : -440,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Sản Phẩm Nổi Bật
        </h2>
        <div className="flex items-center gap-2">
          <Link
            to="/shop?featured=true"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Xem Tất Cả <ArrowRight size={15} />
          </Link>
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
      >
        {products.map((p) => (
          <FeaturedCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
