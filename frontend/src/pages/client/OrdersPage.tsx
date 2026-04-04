import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Package, AlertCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { orderApi } from "@/api/orderApi";
import { cn } from "@/lib/utils";

import type { Order, OrderStatus } from "@/types/order";
import { OrderCard } from "@/components/client/order/OrderCard";
import { EmptyOrders } from "@/components/client/order/EmptyOrders";
import { OrderSkeleton } from "@/components/client/order/OrderSkeleton";
import { OrderDetailDrawer } from "@/components/client/order/OrderDetailDrawer";
import { STATUS_TABS } from "@/lib/helper";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = (searchParams.get("status") ?? "") as OrderStatus | "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(
    async (page = 1, status: OrderStatus | "" = statusParam) => {
      setLoading(true);
      try {
        const res = await orderApi.getMyOrders({
          page,
          limit: 10,
          status: status || undefined,
        });
        const data = res as unknown as {
          orders: Order[];
          pagination: typeof pagination;
        };
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch {
        toast.error("Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    },
    [statusParam],
  );

  useEffect(() => {
    fetchOrders(1, statusParam);
  }, [statusParam, fetchOrders]);

  const handleTabChange = (status: OrderStatus | "") => {
    setSearchParams(status ? { status } : {});
  };

  const handleCancelled = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setSelectedOrder(updated);
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          Quay về
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Package size={22} className="text-primary" />
          <h1 className="text-xl font-bold">Đơn hàng của tôi</h1>
          {pagination.total > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {pagination.total}
            </span>
          )}
        </div>

        {/* Status tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto pb-1">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleTabChange(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                statusParam === value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          <EmptyOrders status={statusParam} />
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchOrders(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchOrders(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {!loading &&
          orders.length === 0 &&
          pagination.total === 0 &&
          statusParam === "" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <AlertCircle size={14} />
              Nếu bạn vừa đặt hàng, hãy thử tải lại trang.
            </div>
          )}
      </div>

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelled={handleCancelled}
        />
      )}
    </>
  );
}
