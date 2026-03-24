import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ─── 5. ALL PRODUCTS ──────────────────────────────────────────────────────────
const PLACEHOLDER_IMG = "https://placehold.co/400x400/f0fdf4/166534?text=SP";

function productImage(p: Product) {
  return p.thumbnail ?? p.images?.[0] ?? PLACEHOLDER_IMG;
}
function AllProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  return (
    <div
      className="group flex flex-col overflow-hidden cursor-pointer rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative h-36 overflow-hidden bg-card">
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isFeatured && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <Star size={9} className="fill-white" /> Nổi bật
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              Hết hàng
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-snug">
          {product.name}
        </p>
        {product.description && (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
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
            disabled={product.stock === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllProductsSection({
  products,
  page,
  totalPages,
  onPageChange,
}: {
  products: Product[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Tất Cả Sản Phẩm
        </h2>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
        >
          Xem tất cả <ArrowRight size={15} />
        </Link>
      </div>

      {/* 6 cột × 2 hàng = 12 sản phẩm */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((p) => (
          <AllProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border bg-background hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
