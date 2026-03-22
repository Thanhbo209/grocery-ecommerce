import { Eye, Pencil, Trash2, ImageOff, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { formatNumber, formatPrice } from "@/lib/format";

interface ProductTableRowProps {
  product: Product;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTableRow({
  product,
  isSelected,
  onSelectChange,
  onView,
  onEdit,
  onDelete,
}: ProductTableRowProps) {
  // Tất cả field đều được normalize tại api.ts — guard thêm cho an toàn
  const displayImage = product?.thumbnail ?? product?.images?.[0] ?? null;

  if (!product) return null;

  return (
    <TableRow
      className={cn(
        "group border-border transition-colors hover:bg-accent/10",
        isSelected && "bg-accent/10",
      )}
    >
      {/* Checkbox */}
      <TableCell className="w-10 pl-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
          className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </TableCell>

      {/* Thumbnail + name + slug */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff size={14} className="text-muted-foreground" />
            )}
            {product.isFeatured && (
              <span className="absolute right-0.5 top-0.5">
                <Star size={9} className="fill-amber-400 text-amber-400" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold ">{product.name}</p>
            <p className="text-[11px] text-muted-foreground">{product.slug}</p>
          </div>
        </div>
      </TableCell>

      {/* Category */}
      <TableCell>
        <Badge variant="outline" className="border-border bg-muted  text-xs">
          {product.category?.name ?? "—"}
        </Badge>
      </TableCell>

      {/* Price */}
      <TableCell className="tabular-nums">
        <span className="text-sm font-medium ">
          {formatPrice(product.price)}
        </span>
        {product.discountPrice !== undefined && (
          <span className="ml-2 text-xs text-primary">
            → {formatPrice(product.discountPrice)}
          </span>
        )}
      </TableCell>

      {/* Stock */}
      <TableCell>
        <span
          className={cn(
            "text-sm tabular-nums",
            product.stock === 0
              ? "text-red-400"
              : product.stock <= 10
                ? "text-amber-400"
                : "text-primary",
          )}
        >
          {formatNumber(product.stock)}{" "}
          <span className="text-xs text-muted-foreground font-semibold">
            {product.unit}
          </span>
        </span>
      </TableCell>

      {/* isActive */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              product.isActive ? "bg-primary" : "bg-zinc-500",
            )}
          />
          <span className="text-sm text-muted-foreground">
            {product.isActive ? "Đang bán" : "Ẩn"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-foreground hover:bg-primary hover:text-background"
            onClick={() => onView(product)}
            title="Xem chi tiết"
          >
            <Eye size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-chart-3 hover:bg-chart-3/20 "
            onClick={() => onEdit(product)}
            title="Chỉnh sửa"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7  hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(product)}
            title="Xóa"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
