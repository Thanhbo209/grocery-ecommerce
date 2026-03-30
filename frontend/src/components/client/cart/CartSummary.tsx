// ─── Order Summary ────────────────────────────────────────────────────────────

import { formatPrice } from "@/lib/format";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function OrderSummary({
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
