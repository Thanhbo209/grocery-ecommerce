import { useCallback, useEffect, useState } from "react";
import {
  Search,
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Copy,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { paymentApi, type PaymentOrder, type BankInfo } from "@/api/paymentApi";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function CopyBtn({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      {ok ? (
        <CheckCircle2 size={12} className="text-emerald-600" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

// ─── QR Preview Dialog ────────────────────────────────────────────────────────

function QRDialog({
  order,
  bankInfo,
  onClose,
  onConfirm,
  onReject,
}: {
  order: PaymentOrder | null;
  bankInfo: BankInfo | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}) {
  const [confirmingId, setConfirmingId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!order || !bankInfo) return null;

  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNumber}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(`Thanh toan ${order.orderCode}`)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;

  const handleConfirm = async () => {
    setConfirmingId(order._id);
    await onConfirm(order._id);
    setConfirmingId("");
    onClose();
  };

  const handleReject = async () => {
    setConfirmingId(order._id);
    await onReject(order._id, rejectReason);
    setConfirmingId("");
    setShowRejectInput(false);
    setRejectReason("");
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xác nhận thanh toán</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Order info */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã đơn</span>
              <span className="font-bold text-primary">{order.orderCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khách hàng</span>
              <span className="font-medium">{order.shippingAddress?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SĐT</span>
              <span>{order.shippingAddress?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền</span>
              <span className="font-bold text-emerald-700 text-base">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nội dung CK</span>
              <div className="flex items-center">
                <span className="font-medium">
                  Thanh toan {order.orderCode}
                </span>
                <CopyBtn value={`Thanh toan ${order.orderCode}`} />
              </div>
            </div>
          </div>

          {/* QR */}
          <div className="flex justify-center">
            <img
              src={qrUrl}
              alt="QR"
              className="w-48 rounded-xl border border-border"
            />
          </div>

          {/* Reject reason input */}
          {showRejectInput && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Lý do từ chối (tuỳ chọn)
              </label>
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Sai nội dung chuyển khoản..."
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showRejectInput ? (
            <>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setShowRejectInput(true)}
                disabled={!!confirmingId}
              >
                <XCircle size={14} className="mr-1.5" />
                Từ chối
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!!confirmingId}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {confirmingId ? (
                  <span className="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <CheckCircle2 size={14} className="mr-1.5" />
                )}
                Xác nhận đã nhận tiền
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
              >
                Huỷ
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!!confirmingId}
              >
                Xác nhận từ chối
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bank Config Dialog ───────────────────────────────────────────────────────

function BankConfigDialog({
  open,
  onClose,
  bankInfo,
}: {
  open: boolean;
  onClose: () => void;
  bankInfo: BankInfo | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cấu hình tài khoản ngân hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5 text-sm">
            {bankInfo ? (
              <>
                <Row label="Ngân hàng" value={bankInfo.displayName} />
                <Row label="Bank ID" value={bankInfo.bankId} mono />
                <Row label="Số tài khoản" value={bankInfo.accountNumber} mono />
                <Row label="Chủ tài khoản" value={bankInfo.accountName} />
                {bankInfo.branch && (
                  <Row label="Chi nhánh" value={bankInfo.branch} />
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Để thay đổi tài khoản ngân hàng, cập nhật các biến môi trường{" "}
            <code className="font-mono">BANK_ID</code>,{" "}
            <code className="font-mono">BANK_ACCOUNT</code>,{" "}
            <code className="font-mono">BANK_OWNER</code> trong file{" "}
            <code className="font-mono">.env</code> rồi restart server.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn("font-medium truncate", mono && "font-mono text-xs")}>
        {value}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {[140, 120, 100, 90, 90, 80].map((w, j) => (
            <TableCell key={j}>
              <div
                className="h-4 animate-pulse rounded bg-muted"
                style={{ width: w }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPaymentPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "" | "unpaid" | "paid"
  >("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);
  const [bankConfigOpen, setBankConfigOpen] = useState(false);

  // Confirm / Reject confirm
  //   const [confirmTarget, setConfirmTarget] = useState<PaymentOrder | null>(null);

  useEffect(() => {
    paymentApi
      .adminGetBankConfig()
      .then((b) => setBankInfo(b as unknown as BankInfo))
      .catch(() => {});
  }, []);

  const fetchOrders = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        let res;
        if (tab === "pending") {
          res = await paymentApi.adminGetPending({
            page,
            search: search || undefined,
          });
        } else {
          res = await paymentApi.adminGetAll({
            page,
            paymentStatus: paymentStatusFilter || undefined,
            search: search || undefined,
          });
        }
        const data = res as unknown as {
          orders: PaymentOrder[];
          pagination: typeof pagination;
        };
        setOrders(data.orders);
        setPagination(data.pagination);
      } catch {
        toast.error("Không thể tải danh sách thanh toán");
      } finally {
        setLoading(false);
      }
    },
    [tab, search, paymentStatusFilter],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleConfirm = async (orderId: string) => {
    try {
      const updated = (await paymentApi.adminConfirm(
        orderId,
      )) as unknown as PaymentOrder;
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)),
      );
      toast.success("Đã xác nhận thanh toán");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      throw err;
    }
  };

  const handleReject = async (orderId: string, reason: string) => {
    try {
      const updated = (await paymentApi.adminReject(
        orderId,
        reason,
      )) as unknown as PaymentOrder;
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)),
      );
      toast.success("Đã từ chối thanh toán");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      throw err;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-bold">Quản lý thanh toán</h1>
          <p className="text-xs text-muted-foreground">
            Xác nhận các đơn hàng thanh toán chuyển khoản
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBankConfigOpen(true)}
          >
            <Settings size={13} className="mr-1.5" />
            Tài khoản NH
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders(pagination.page)}
          >
            <RefreshCw size={13} className="mr-1.5" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs + toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="h-8">
            <TabsTrigger value="pending" className="text-xs">
              <Clock size={11} className="mr-1" />
              Chờ xác nhận
              {tab === "pending" && pagination.total > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {pagination.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              <Banknote size={11} className="mr-1" />
              Tất cả
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
          }}
          className="relative flex-1 min-w-40 max-w-xs"
        >
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Mã đơn, tên khách..."
            className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X size={11} />
            </button>
          )}
        </form>

        {/* Payment status filter — chỉ cho tab "all" */}
        {tab === "all" && (
          <Select
            value={paymentStatusFilter}
            onValueChange={(v) =>
              setPaymentStatusFilter(v as typeof paymentStatusFilter)
            }
          >
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Trạng thái TT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead className="hidden sm:table-cell">Khách hàng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead className="hidden md:table-cell">Ngày đặt</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead className="hidden lg:table-cell">Đơn hàng</TableHead>
              <TableHead className="w-32 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <CheckCircle2
                    size={28}
                    className="mx-auto mb-2 text-muted-foreground/40"
                  />
                  <p className="text-sm text-muted-foreground">
                    {tab === "pending"
                      ? "Không có đơn hàng nào chờ xác nhận"
                      : "Không tìm thấy kết quả"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order._id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell>
                    <span className="font-bold text-primary text-xs">
                      {order.orderCode}
                    </span>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <p className="text-xs font-medium">
                      {order.shippingAddress?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {order.shippingAddress?.phone}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-bold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "outline" : "secondary"
                      }
                      className={cn(
                        "text-[11px]",
                        order.paymentStatus === "paid"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "bg-amber-100 text-amber-700 border-amber-200",
                      )}
                    >
                      {order.paymentStatus === "paid" ? "Đã TT" : "Chờ TT"}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-[11px]">
                      {order.status === "pending"
                        ? "Chờ xác nhận"
                        : order.status === "confirmed"
                          ? "Đã xác nhận"
                          : order.status === "shipping"
                            ? "Đang giao"
                            : order.status === "delivered"
                              ? "Đã giao"
                              : "Đã hủy"}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.paymentStatus === "unpaid" ? (
                      <Button
                        size="sm"
                        className="h-7 bg-emerald-600 hover:bg-emerald-700 text-xs"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <CheckCircle2 size={12} className="mr-1" />
                        Xác nhận
                      </Button>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 size={12} />
                        Đã xác nhận
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {orders.length} / {pagination.total} đơn hàng
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2 text-sm">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* QR Dialog */}
      <QRDialog
        order={selectedOrder}
        bankInfo={bankInfo}
        onClose={() => setSelectedOrder(null)}
        onConfirm={handleConfirm}
        onReject={handleReject}
      />

      {/* Bank config dialog */}
      <BankConfigDialog
        open={bankConfigOpen}
        onClose={() => setBankConfigOpen(false)}
        bankInfo={bankInfo}
      />
    </div>
  );
}
