import type { Category } from "@/types/category";
import { Tag } from "lucide-react";
import { Link } from "react-router-dom";

export function OtherCategories({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug: string;
}) {
  const others = categories.filter((c) => c.slug !== currentSlug && c.isActive);
  if (!others.length) return null;

  return (
    <div className="mb-6">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Danh mục khác
      </p>
      <div className="flex flex-wrap gap-2">
        {others.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Tag size={11} />

            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
