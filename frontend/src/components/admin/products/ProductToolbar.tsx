import { Plus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFilters } from "@/types/product";
import type { Category } from "@/types/category";

interface ProductToolbarProps {
  filters: ProductFilters;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  /** "" = tất cả, true = đang bán, false = ẩn */
  onIsActiveChange: (value: boolean | "") => void;
  onAdd: () => void;
}

export function ProductToolbar({
  filters,
  categories,
  onSearchChange,
  onCategoryChange,
  onIsActiveChange,
  onAdd,
}: ProductToolbarProps) {
  // Convert boolean | "" → select string value
  const isActiveValue =
    filters.isActive === "" ? "all" : String(filters.isActive);

  const handleIsActiveChange = (v: string) => {
    if (v === "all") onIsActiveChange("");
    else onIsActiveChange(v === "true");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search — full-text (name + description indexes) */}
      <div className="relative min-w-50 flex-1 max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Tìm sản phẩm, mô tả..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 border-border] text-sm  placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Category — filter by ObjectId, use category._id */}
      <Select
        value={filters.category || "all"}
        onValueChange={(v) => onCategoryChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="h-9 w-40 border-border text-sm ">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent className="border-border">
          <SelectItem value="all" className="">
            Tất cả danh mục
          </SelectItem>
          {categories.map((cat) => (
            // Use _id (ObjectId string) as value
            <SelectItem key={cat._id} value={cat._id} className="">
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* isActive filter */}
      <Select value={isActiveValue} onValueChange={handleIsActiveChange}>
        <SelectTrigger className="h-9 w-35  border-border text-sm ">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent className=" border-border">
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="true">Đang bán</SelectItem>
          <SelectItem value="false">Đang ẩn</SelectItem>
        </SelectContent>
      </Select>

      {/* Export */}
      <Button size="sm">
        <Download size={13} className="mr-1.5" />
        Xuất CSV
      </Button>

      {/* Add — pushed right */}
      <Button size="sm" onClick={onAdd} className="ml-auto font-medium">
        <Plus size={14} className="mr-1.5" />
        Thêm sản phẩm
      </Button>
    </div>
  );
}
