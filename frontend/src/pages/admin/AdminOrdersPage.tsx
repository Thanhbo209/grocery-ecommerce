import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  Filter,
  RefreshCw,
  User,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { adminOrderApi } from "@/api/orderApi";

import { formatPrice, UNIT_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderItem, OrderStatus } from "@/types/order";
import type { ShippingAddress } from "@/types/check-out";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
    next: OrderStatus[];
  }
> = {
  pending: {
    label: "Chờ xác nhận",
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: <Clock size={11} />,
    next: ["confirmed", "cancelled"],
  },
  confirmed: {
    label: "Đã xác nhận",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <CheckCircle2 size={11} />,
    next: ["shipping", "cancelled"],
  },
  shipping: {
    label: "Đang giao",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: <Truck size={11} />,
    next: ["delivered"],
  },
  delivered: {
    label: "Đã giao",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={11} />,
    next: [],
  },
  cancelled: {
    label: "Đã hủy",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <XCircle size={11} />,
    next: [],
  },
};

const STATUS_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: "Xác nhận đơn",
  shipping: "Bắt đầu giao",
  delivered: "Giao thành công",
  cancelled: "Hủy đơn",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        cfg.bg,
        cfg.text,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Status Updater Dropdown ──────────────────────────────────────────────────

function StatusUpdater({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: (updated: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[order.status];
  const nextStatuses = cfg.next;

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  if (nextStatuses.length === 0) {
    return <StatusBadge status={order.status} />;
  }

  const handleUpdate = async (newStatus: OrderStatus) => {
    setLoading(true);
    setOpen(false);
    try {
      const updated = (await adminOrderApi.updateStatus(
        order._id,
        newStatus,
      )) as unknown as Order;
      onUpdated(updated);
      toast.success(`Đã cập nhật: ${STATUS_CONFIG[newStatus].label}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all hover:opacity-80",
          cfg.bg,
          cfg.text,
          loading && "opacity-60 cursor-not-allowed",
        )}
      >
        {loading ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          cfg.icon
        )}
        {cfg.label}
        <ChevronDown
          size={10}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {nextStatuses.map((s) => {
            const sc = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleUpdate(s)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-muted transition-colors"
              >
                <span className={cn("font-medium", sc.text)}>{sc.icon}</span>
                {NEXT_STATUS_LABEL[s] ?? sc.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
  onUpdated,
}: {
  order: Order;
  onClose: () => void;
  onUpdated: (updated: Order) => void;
}) {
  const addr: ShippingAddress =
    order.shippingAddress ?? ({} as ShippingAddress);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Chi tiết đơn hàng
            </p>
            <p className="font-bold text-primary">{order.orderCode}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Status control */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Trạng thái
            </p>
            <div className="flex items-center justify-between">
              <StatusUpdater order={order} onUpdated={onUpdated} />
              <span className="text-[11px] text-muted-foreground">
                {formatDate(order.createdAt)}
              </span>
            </div>

            {/* Payment status */}
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <CreditCard size={13} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán online"}
              </span>
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
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

          {/* Customer */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <User size={13} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Khách hàng
              </p>
            </div>
            <p className="text-sm font-medium">{addr.name}</p>
            <p className="text-sm text-muted-foreground">{addr.phone}</p>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={13} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Địa chỉ giao hàng
              </p>
            </div>
            <p className="text-sm">
              {[addr.street, addr.district, addr.city]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Package size={13} className="text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sản phẩm ({order.items.length})
              </p>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item: OrderItem, i: number) => {
                const unit =
                  UNIT_LABEL[item.unit as keyof typeof UNIT_LABEL] ?? item.unit;
                return (
                  <div
                    key={i}
                    className="flex gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package
                            size={14}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-medium">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatPrice(item.price)}/{unit} × {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingFee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí ship</span>
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
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ghi chú
                </p>
              </div>
              <p className="text-sm">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

function OrderRow({
  order,
  selected,
  onClick,
  onUpdated,
}: {
  order: Order;
  selected: boolean;
  onClick: () => void;
  onUpdated: (updated: Order) => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/40",
        selected && "bg-primary/5",
      )}
    >
      {/* Order code + date */}
      <td className="px-4 py-3.5">
        <p className="text-xs font-bold text-primary">{order.orderCode}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatDate(order.createdAt)}
        </p>
      </td>

      {/* Customer */}
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <p className="text-xs font-medium">{order.shippingAddress?.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {order.shippingAddress?.phone}
        </p>
      </td>

      {/* Items preview */}
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <p className="line-clamp-1 text-xs">
          {order.items[0]?.name}
          {order.items.length > 1 && (
            <span className="text-muted-foreground">
              {" "}
              +{order.items.length - 1}
            </span>
          )}
        </p>
      </td>

      {/* Total */}
      <td className="px-4 py-3.5">
        <p className="text-xs font-semibold">
          {formatPrice(order.totalAmount)}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {order.paymentMethod === "COD" ? "COD" : "Online"}
        </p>
      </td>

      {/* Status — click stops propagation so row click doesn't conflict */}
      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
        <StatusUpdater order={order} onUpdated={onUpdated} />
      </td>
    </tr>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <tr key={i} className="border-b border-border/50">
          {[140, 120, 180, 90, 100].map((w, j) => (
            <td key={j} className="px-4 py-4">
              <div
                className="h-3.5 animate-pulse rounded bg-muted"
                style={{ width: w }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(
    async (page = 1, status: OrderStatus | "" = statusFilter, q = search) => {
      setLoading(true);
      try {
        const res = await adminOrderApi.getAll({
          page,
          limit: 15,
          status: status || undefined,
          search: q || undefined,
        });
        const data = res as unknown as {
          orders: Order[];
          pagination: typeof pagination;
        };
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch {
        toast.error("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search],
  );

  useEffect(() => {
    fetchOrders(1, statusFilter, search);
  }, [statusFilter, search, fetchOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  const handleUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    setSelectedOrder(updated);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-bold">Quản lý đơn hàng</h1>
          <p className="text-xs text-muted-foreground">
            {pagination.total > 0
              ? `${pagination.total} đơn hàng`
              : "Chưa có đơn hàng"}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(pagination.page)}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw size={12} />
          Làm mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-3 sm:flex-row sm:items-center">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Mã đơn, tên, SĐT..."
            className="h-9 w-full rounded-full border border-border bg-muted/40 pl-8 pr-8 text-xs outline-none focus:border-primary focus:bg-background transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </form>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter size={12} className="shrink-0 text-muted-foreground" />
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                statusFilter === value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 border-b border-border bg-background">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Đơn hàng
                </th>
                <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">
                  Khách hàng
                </th>
                <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                  >
                    <Package
                      size={32}
                      className="mx-auto mb-3 text-muted-foreground/40"
                    />
                    {search
                      ? `Không tìm thấy đơn hàng cho "${search}"`
                      : "Không có đơn hàng nào"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    selected={selectedOrder?._id === order._id}
                    onClick={() =>
                      setSelectedOrder((prev) =>
                        prev?._id === order._id ? null : order,
                      )
                    }
                    onUpdated={handleUpdated}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel — desktop side panel */}
        {selectedOrder && (
          <div className="hidden w-96 shrink-0 border-l border-border lg:flex lg:flex-col">
            <OrderDetailPanel
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onUpdated={handleUpdated}
            />
          </div>
        )}
      </div>

      {/* Mobile detail drawer */}
      {selectedOrder && (
        <div className="lg:hidden">
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdated={handleUpdated}
          />
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages} ·{" "}
            {pagination.total} đơn
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const p = Math.max(
                  1,
                  Math.min(
                    pagination.page - 2 + i,
                    pagination.totalPages - 4 + i,
                  ),
                );
                return (
                  <button
                    key={p}
                    onClick={() => fetchOrders(p)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                      pagination.page === p
                        ? "bg-primary text-white"
                        : "border border-border hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                );
              },
            )}
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
