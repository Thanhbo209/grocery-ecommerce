// ─── CategoryStrip — navigate sang /category/:slug ────────────────────────────

import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import { Link, useLocation } from "react-router-dom";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  const { pathname } = useLocation();

  // Chỉ hiện ở trang chủ "/"
  if (pathname !== "/" && !pathname.startsWith("/category/")) return null;

  // Xác định slug đang active từ pathname
  const activeSlug = pathname.startsWith("/category/")
    ? pathname.replace("/category/", "")
    : "";

  const items: Pick<Category, "_id" | "name" | "slug">[] = [
    { _id: "", name: "Tất Cả", slug: "" },
    ...categories,
  ];

  return (
    <div className="border-b border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-9 items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {items.map((cat) => {
            const active = cat.slug === activeSlug;
            return (
              <Link
                key={cat._id || "all"}
                // "Tất Cả" → /shop, còn lại → /category/:slug
                to={cat.slug ? `/category/${cat.slug}` : "/"}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.name}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
