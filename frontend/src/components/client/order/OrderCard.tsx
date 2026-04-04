// ─── Order Card ───────────────────────────────────────────────────────────────

import { StatusBadge } from "@/components/client/order/OrderDetailDrawer";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";
import { ChevronRight, Package } from "lucide-react";

export function OrderCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
    >
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-primary">{order.orderCode}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Products preview */}
      <div className="mb-3 flex items-center gap-3">
        {/* Thumbnails */}
        <div className="flex -space-x-2">
          {order.items.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className="h-10 w-10 overflow-hidden rounded-lg border-2 border-background bg-muted"
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package size={14} className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">
              +{extraCount}
            </div>
          )}
        </div>

        {/* First item name */}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-xs font-medium">{firstItem?.name}</p>
          {order.items.length > 1 && (
            <p className="text-[11px] text-muted-foreground">
              và {order.items.length - 1} sản phẩm khác
            </p>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Tổng: </span>
          <span className="text-sm font-bold text-primary">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
          Xem chi tiết <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
}
