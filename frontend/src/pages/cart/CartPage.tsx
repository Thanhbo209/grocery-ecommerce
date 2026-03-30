import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { UNIT_LABEL } from "@/lib/format";
import { productImg } from "@/lib/helper";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-border bg-card p-4 animate-pulse"
        >
          <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
          <div className="flex flex-1 flex-col justify-between">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <ShoppingCart size={36} className="text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Hãy thêm sản phẩm vào giỏ hàng để tiến hành đặt hàng
      </p>
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Tiếp tục mua sắm
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({
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
  const img = item.product.thumbnail ?? productImg(item.product as never);
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
              disabled={updating || item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
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

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary({
  totalPrice,
  totalItems,
  onCheckout,
}: {
  totalPrice: number;
  totalItems: number;
  onCheckout: () => void;
}) {
  const SHIPPING_THRESHOLD = 200_000;
  const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : 25_000;
  const finalTotal = totalPrice + shippingFee;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-28">
      <h2 className="font-semibold text-base">Tóm tắt đơn hàng</h2>

      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Tạm tính ({totalItems} sản phẩm)
          </span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          {shippingFee === 0 ? (
            <span className="font-medium text-emerald-600">Miễn phí</span>
          ) : (
            <span className="font-medium">{formatPrice(shippingFee)}</span>
          )}
        </div>

        {shippingFee > 0 && (
          <p className="text-[11px] text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            Mua thêm{" "}
            <span className="font-semibold text-emerald-600">
              {formatPrice(SHIPPING_THRESHOLD - totalPrice)}
            </span>{" "}
            để được miễn phí vận chuyển
          </p>
        )}

        <div className="border-t border-border pt-2.5 flex justify-between font-semibold text-base">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 flex items-center justify-center gap-2"
      >
        Tiến hành thanh toán
        <ArrowRight size={15} />
      </button>

      <Link
        to="/shop"
        className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={13} />
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading, updateQuantity, removeItem } =
    useCart();

  // Track which productId is currently being mutated
  const handleUpdate = async (productId: string, qty: number) => {
    await updateQuantity(productId, qty);
  };

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <ShoppingCart size={22} className="text-primary" />
        <h1 className="text-xl font-bold">
          Giỏ hàng
          {totalItems > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({totalItems} sản phẩm)
            </span>
          )}
        </h1>
      </div>

      {loading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: items list */}
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemRow
                key={item.product._id}
                item={item}
                onUpdate={(qty) => handleUpdate(item.product._id, qty)}
                onRemove={() => handleRemove(item.product._id)}
                updating={loading}
              />
            ))}
          </div>

          {/* Right: summary */}
          <OrderSummary
            totalPrice={totalPrice}
            totalItems={totalItems}
            onCheckout={() => navigate("/checkout")}
          />
        </div>
      )}
    </div>
  );
}
