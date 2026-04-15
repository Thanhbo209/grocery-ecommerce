import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  RefreshCw,
  ChevronLeft,
  Clock,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { paymentApi, type PaymentInfo } from "@/api/paymentApi";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all",
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
      {copied ? "Đã sao chép" : (label ?? "Sao chép")}
    </button>
  );
}

// ─── Bank info row ────────────────────────────────────────────────────────────

function BankRow({
  label,
  value,
  copyable = false,
  highlight = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "text-sm font-medium truncate",
            highlight && "font-bold text-primary text-base",
          )}
        >
          {value}
        </span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  );
}

// ─── Status polling ───────────────────────────────────────────────────────────

function PaidBanner({ orderCode }: { orderCode: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>
      <h2 className="mb-1 text-lg font-bold">Thanh toán thành công!</h2>
      <p className="mb-1 text-sm text-muted-foreground">Mã đơn hàng:</p>
      <p className="mb-5 font-bold text-primary">{orderCode}</p>
      <p className="mb-6 text-sm text-muted-foreground max-w-xs">
        Admin đã xác nhận thanh toán của bạn. Đơn hàng đang được xử lý.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => navigate("/shop")}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchInfo = async (silent = false) => {
    if (!orderId) return;
    if (!silent) setLoading(true);
    try {
      const data = (await paymentApi.getPaymentInfo(
        orderId,
      )) as unknown as PaymentInfo;
      setInfo(data);
      setError("");
      return data;
    } catch (err: unknown) {
      if (!silent)
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin thanh toán",
        );
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll mỗi 10 giây để kiểm tra admin đã xác nhận chưa
  useEffect(() => {
    fetchInfo();
    pollRef.current = setInterval(() => fetchInfo(true), 10_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handleManualCheck = async () => {
    setChecking(true);
    const data = await fetchInfo(true);
    setChecking(false);
    if (data && data.order.paymentStatus !== "paid") {
      toast.info(
        "Chưa ghi nhận thanh toán — admin sẽ xác nhận sau khi kiểm tra",
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <AlertCircle size={36} className="mx-auto mb-3 text-muted-foreground" />
        <p className="mb-4 font-semibold">{error}</p>
        <button
          onClick={() => navigate("/orders")}
          className="rounded-full border border-border px-5 py-2 text-sm hover:bg-muted"
        >
          Quay lại đơn hàng
        </button>
      </div>
    );
  }

  if (!info) return null;

  const { order, bank, qrUrl } = info;

  // Đã thanh toán → hiện banner success
  if (order.paymentStatus === "paid") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <PaidBanner orderCode={order.orderCode} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/orders")}
        className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={15} />
        Đơn hàng của tôi
      </button>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold">Thanh toán đơn hàng</h1>
          <p className="text-sm text-primary font-semibold">
            {order.orderCode}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-right">
          <p className="text-xs text-muted-foreground">Số tiền</p>
          <p className="text-base font-bold text-emerald-700">
            {formatPrice(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* QR Code */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-5 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 w-6 overflow-hidden rounded">
            <img
              src={`https://img.vietqr.io/image/${bank.bankId}-logo.png`}
              alt={bank.displayName}
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p className="text-sm font-semibold">{bank.displayName} — VietQR</p>
        </div>

        {/* QR image */}
        <div className="relative mx-auto w-fit">
          {!qrLoaded && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted">
              <RefreshCw
                size={20}
                className="animate-spin text-muted-foreground"
              />
            </div>
          )}
          <img
            src={qrUrl}
            alt="QR thanh toán"
            onLoad={() => setQrLoaded(true)}
            className={cn(
              "w-56 rounded-xl border border-border transition-opacity",
              qrLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Mở app ngân hàng → Quét mã QR → Kiểm tra thông tin → Chuyển khoản
        </p>
      </div>

      {/* Bank info */}
      <div className="mb-4 rounded-2xl border border-border bg-card px-4 py-2">
        <BankRow label="Ngân hàng" value={bank.displayName} />
        <BankRow
          label="Số tài khoản"
          value={bank.accountNumber}
          copyable
          highlight
        />
        <BankRow label="Chủ tài khoản" value={bank.accountName} />
        {bank.branch && <BankRow label="Chi nhánh" value={bank.branch} />}
        <BankRow
          label="Số tiền"
          value={formatPrice(order.totalAmount)}
          highlight
        />
        <BankRow
          label="Nội dung CK"
          value={`Thanh toan ${order.orderCode}`}
          copyable
          highlight
        />
      </div>

      {/* Notice */}
      <div className="mb-5 flex gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-4">
        <Clock size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Lưu ý quan trọng:</p>
          <p>
            • Nhập đúng <strong>nội dung chuyển khoản</strong> để admin xác nhận
            nhanh hơn
          </p>
          <p>
            • Sau khi chuyển khoản, admin sẽ xác nhận trong vòng{" "}
            <strong>15–30 phút</strong> trong giờ hành chính
          </p>
          <p>• Đơn hàng sẽ được xử lý ngay sau khi xác nhận thanh toán</p>
        </div>
      </div>

      {/* Check status */}
      <button
        onClick={handleManualCheck}
        disabled={checking}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
      >
        <RefreshCw size={14} className={cn(checking && "animate-spin")} />
        {checking
          ? "Đang kiểm tra..."
          : "Tôi đã chuyển khoản — Kiểm tra trạng thái"}
      </button>

      <div className="mt-3 flex items-center gap-1.5 justify-center">
        <Banknote size={12} className="text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground text-center">
          Trang tự động cập nhật mỗi 10 giây
        </p>
      </div>
    </div>
  );
}
