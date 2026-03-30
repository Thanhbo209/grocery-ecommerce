import type { useCart } from "@/context/CartContext";
import { formatPrice, UNIT_LABEL } from "@/lib/format";
import { productImg } from "@/lib/helper";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export function CartItemRow({
  item,
  onUpdate,
  onRemove,
  updating,
}: {
  item: ReturnType<typeof useCart>["items"][number];
  onUpdate: (qty: number) => void;
  onRemove: () => void;
  updating: boolean;
}) {
  const unit =
    UNIT_LABEL[item.product.unit as keyof typeof UNIT_LABEL] ??
    item.product.unit;
  const img = item.product.thumbnail ?? productImg(item.product);
  const isOutOfStock = item.product.stock === 0;
  const maxQty = item.product.stock;

  return (
    <div
      className={`flex gap-3 rounded-2xl border bg-card p-3 transition-all sm:gap-4 sm:p-4 ${isOutOfStock ? "border-destructive/30 opacity-70" : "border-border"}`}
    >
      {/* Image */}
      <Link to={`/product/${item.product._id}`} className="shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-xl bg-muted">
          <img
            src={img}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <Link
            to={`/product/${item.product._id}`}
            className="line-clamp-2 text-sm font-semibold hover:text-primary transition-colors"
          >
            {item.product.name}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatPrice(item.price)}/{unit}
            {item.product.discountPrice && (
              <span className="ml-2 text-destructive text-[10px] font-medium">
                Giá KM
              </span>
            )}
          </p>
          {isOutOfStock && (
            <p className="mt-0.5 text-[11px] font-medium text-destructive">
              Sản phẩm đã hết hàng
            </p>
          )}
        </div>

        {/* Bottom row: qty + subtotal */}
        <div className="flex items-center justify-between gap-2 mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-full border border-border bg-background">
            <button
              onClick={() => onUpdate(item.quantity - 1)}
              type="button"
              aria-label="Giảm số lượng"
              disabled={updating || item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={updating || item.quantity >= maxQty}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Subtotal + delete */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-primary">
              {formatPrice(item.subtotal)}
            </p>
            <button
              type="button"
              aria-label="Xóa sản phẩm khỏi giỏ hàng"
              onClick={onRemove}
              disabled={updating}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
