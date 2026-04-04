import { useState } from "react";
import {
  X,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { orderApi } from "@/api/orderApi";
import { formatPrice, formatDate, UNIT_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

// eslint-disable-next-line react-refresh/only-export-components
export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-amber-100 text-amber-700",
    icon: <Clock size={11} />,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700",
    icon: <CheckCircle2 size={11} />,
  },
  shipping: {
    label: "Đang giao",
    color: "bg-purple-100 text-purple-700",
    icon: <Truck size={11} />,
  },
  delivered: {
    label: "Đã giao",
    color: "bg-emerald-100 text-emerald-700",
    icon: <CheckCircle2 size={11} />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={11} />,
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        cfg.color,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipping",
  "delivered",
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/20">
        <XCircle size={14} />
        Đơn hàng đã bị hủy
      </div>
    );
  }

  const currentIdx = TIMELINE_STEPS.indexOf(status);

  return (
    <div className="flex items-start gap-0">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const cfg = STATUS_CONFIG[s];

        return (
          <div key={s} className="flex flex-1 flex-col items-center">
            {/* Connector + dot row */}
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    i <= currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  active
                    ? "border-primary bg-primary text-white"
                    : done
                      ? "border-primary bg-emerald-100 text-emerald-700"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {cfg.icon}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            {/* Label */}
            <p
              className={cn(
                "mt-1.5 text-center text-[10px] font-medium leading-tight",
                active || done ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {cfg.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export function OrderDetailDrawer({
  order,
  onClose,
  onCancelled,
}: {
  order: Order;
  onClose: () => void;
  onCancelled: (updated: Order) => void;
}) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      const updated = await orderApi.cancelOrder(order._id);
      onCancelled(updated as unknown as Order);
      toast.success("Đã hủy đơn hàng");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể hủy đơn hàng",
      );
    } finally {
      setCancelling(false);
    }
  };

  const addr = order.shippingAddress;
  const recipient = [addr?.name, addr?.phone].filter(Boolean).join(" · ");
  const fullAddress = [addr?.street, addr?.district, addr?.city]
    .filter(Boolean)
    .join(", ");

  const canCancel = order.status === "pending";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] text-muted-foreground">Mã đơn hàng</p>
            <p className="font-bold text-primary">{order.orderCode}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Status + Timeline */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Trạng thái</span>
              <StatusBadge status={order.status} />
            </div>
            <OrderTimeline status={order.status} />
            <p className="text-[11px] text-muted-foreground">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Địa chỉ */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600" />
              <span className="text-sm font-semibold">Địa chỉ giao hàng</span>
            </div>
            <p className="text-sm font-medium">
              {recipient || "Chưa có thông tin người nhận"}
            </p>
            <p className="text-sm text-muted-foreground">
              {fullAddress || "Chưa có địa chỉ giao hàng"}
            </p>
          </div>

          {/* Thanh toán */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="mb-2 flex items-center gap-2">
              <CreditCard size={14} className="text-emerald-600" />
              <span className="text-sm font-semibold">Thanh toán</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán online"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {order.paymentStatus === "paid"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>
          </div>

          {/* Sản phẩm */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <span className="text-sm font-semibold">
              Sản phẩm ({order.items.length})
            </span>

            <div className="divide-y divide-border">
              {order.items.map((item, i) => {
                const unit =
                  UNIT_LABEL[item.unit as keyof typeof UNIT_LABEL] ?? item.unit;
                return (
                  <div key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package
                            size={18}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-medium leading-snug">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatPrice(item.price)}/{unit} × {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(order.shippingFee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span>Tổng thanh toán</span>
                <span className="text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {order.note && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                Ghi chú
              </p>
              <p className="text-sm">{order.note}</p>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div className="border-t border-border px-5 py-4">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/40 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              {cancelling ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/30 border-t-destructive" />
              ) : (
                <RotateCcw size={14} />
              )}
              {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
