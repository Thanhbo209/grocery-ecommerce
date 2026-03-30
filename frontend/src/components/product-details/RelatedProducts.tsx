// ─── Related Products ─────────────────────────────────────────────────────────

import { productApi } from "@/api/productApi";
import { RelatedCard } from "@/components/product-details/RelatedCard";
import type { Product } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function RelatedProducts({
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
