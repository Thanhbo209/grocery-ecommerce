import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SearchForm({
  className,
  onSubmit,
}: {
  className?: string;
  onSubmit?: () => void;
}) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex items-center", className)}
    >
      <Search
        size={14}
        className="absolute left-3 text-muted-foreground pointer-events-none"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-background transition-colors"
      />
    </form>
  );
}
