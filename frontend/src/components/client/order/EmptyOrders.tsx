import { STATUS_CONFIG } from "@/components/client/order/OrderDetailDrawer";
import type { OrderStatus } from "@/types/order";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

export function EmptyOrders({ status }: { status: OrderStatus | "" }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Package size={32} className="text-muted-foreground" />
      </div>
      <p className="mb-1 font-semibold">
        {status
          ? `Không có đơn hàng "${STATUS_CONFIG[status].label}"`
          : "Chưa có đơn hàng nào"}
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        {status
          ? "Thử xem các trạng thái khác"
          : "Hãy mua sắm và đặt hàng nhé!"}
      </p>
      <Link
        to="/shop"
        className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
      >
        Mua sắm ngay
      </Link>
    </div>
  );
}
