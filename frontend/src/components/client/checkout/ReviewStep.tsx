import type { useCart } from "@/context/CartContext";
import { formatPrice, UNIT_LABEL } from "@/lib/format";
import { productImg } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { PaymentMethod, ShippingAddress } from "@/types/check-out";
import { CheckCircle2, CreditCard, Edit2, MapPin, Truck } from "lucide-react";

interface ReviewStepProps {
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  onPaymentChange: (v: PaymentMethod) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  cart: ReturnType<typeof useCart>;
}

export function ReviewStep({
  address,
  paymentMethod,
  onPaymentChange,
  note,
  onNoteChange,
  onBack,
  onSubmit,
  submitting,
  cart,
}: ReviewStepProps) {
  const SHIPPING_FEE = cart.totalPrice >= 200_000 ? 0 : 25_000;
  const finalTotal = cart.totalPrice + SHIPPING_FEE;

  return (
    <div className="space-y-4">
      {/* Address summary */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-emerald-600" />
            <span className="text-sm font-semibold">Địa chỉ giao hàng</span>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Edit2 size={11} /> Sửa
          </button>
        </div>
        {address.label && (
          <span className="mb-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            {address.label}
          </span>
        )}
        <p className="text-sm font-medium">
          {address.name} · {address.phone}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {[address.street, address.district, address.city]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      {/* Payment */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-emerald-600" />
          <span className="text-sm font-semibold">Phương thức thanh toán</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              {
                value: "COD",
                label: "Thanh toán khi nhận hàng",
                sub: "Trả tiền mặt khi nhận",
              },
              {
                value: "online",
                label: "Thanh toán online",
                sub: "Chuyển khoản / thẻ",
              },
            ] as { value: PaymentMethod; label: string; sub: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPaymentChange(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                paymentMethod === opt.value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-border hover:border-emerald-300",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center",
                  paymentMethod === opt.value
                    ? "border-emerald-600"
                    : "border-muted-foreground",
                )}
              >
                {paymentMethod === opt.value && (
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-emerald-600" />
          <span className="text-sm font-semibold">
            Sản phẩm ({cart.totalItems})
          </span>
        </div>
        <div className="divide-y divide-border">
          {cart.items.map((item) => {
            const unit =
              UNIT_LABEL[item.product.unit as keyof typeof UNIT_LABEL] ??
              item.product.unit;
            const img =
              item.product.thumbnail ?? productImg(item.product as never);
            return (
              <div
                key={item.product._id}
                className="flex gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={img}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      x{item.quantity} {unit}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-primary">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Ghi chú đơn hàng (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            {SHIPPING_FEE === 0 ? (
              <span className="text-emerald-600 font-medium">Miễn phí</span>
            ) : (
              <span>{formatPrice(SHIPPING_FEE)}</span>
            )}
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
            <span>Tổng thanh toán</span>
            <span className="text-primary">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full rounded-full bg-emerald-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} /> Đặt hàng
          </>
        )}
      </button>
    </div>
  );
}
