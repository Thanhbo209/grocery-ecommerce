import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Truck,
  CreditCard,
  ChevronDown,
  Edit2,
  Plus,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { orderApi } from "@/api/OrderApi";
import { formatPrice } from "@/lib/format";
import { UNIT_LABEL } from "@/lib/format";
import { productImg } from "@/lib/helper";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingAddress {
  label?: string;
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}

type PaymentMethod = "COD" | "online";
type Step = "address" | "review";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredAddresses(): ShippingAddress[] {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return [];
    const user = JSON.parse(raw);
    return user.addresses ?? [];
  } catch {
    return [];
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: Step }) {
  const steps = [
    { key: "address", label: "Địa chỉ", icon: <MapPin size={14} /> },
    { key: "review", label: "Xác nhận", icon: <CheckCircle2 size={14} /> },
  ] as const;

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done =
          (step.key === "address" && current === "review") ||
          step.key === current;
        const active = step.key === current;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white"
                  : done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.icon}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 transition-colors ${current === "review" ? "bg-emerald-400" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Address Form ─────────────────────────────────────────────────────────────

function AddressStep({
  value,
  onChange,
  onNext,
}: {
  value: ShippingAddress;
  onChange: (v: ShippingAddress) => void;
  onNext: () => void;
}) {
  const savedAddresses = getStoredAddresses();
  const [showSaved, setShowSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  const set =
    (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [field]: e.target.value });
      if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    };

  const validate = (): boolean => {
    const errs: Partial<ShippingAddress> = {};
    if (!value.name.trim()) errs.name = "Vui lòng nhập họ tên";
    if (!value.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0|\+84)\d{9}$/.test(value.phone.trim()))
      errs.phone = "Số điện thoại không hợp lệ";
    if (!value.street.trim()) errs.street = "Vui lòng nhập địa chỉ";
    if (!value.city.trim()) errs.city = "Vui lòng nhập thành phố";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const fields: {
    key: keyof ShippingAddress;
    label: string;
    placeholder: string;
    required?: boolean;
  }[] = [
    {
      key: "name",
      label: "Họ và tên",
      placeholder: "Nguyễn Văn A",
      required: true,
    },
    {
      key: "phone",
      label: "Số điện thoại",
      placeholder: "0901234567",
      required: true,
    },
    {
      key: "street",
      label: "Địa chỉ (số nhà, tên đường)",
      placeholder: "123 Lê Lợi",
      required: true,
    },
    { key: "district", label: "Quận / Huyện", placeholder: "Quận 1" },
    {
      key: "city",
      label: "Tỉnh / Thành phố",
      placeholder: "TP. Hồ Chí Minh",
      required: true,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-emerald-600" />
          <h2 className="font-semibold text-base">Địa chỉ giao hàng</h2>
        </div>

        {savedAddresses.length > 0 && (
          <button
            onClick={() => setShowSaved((o) => !o)}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus size={12} />
            Chọn địa chỉ có sẵn
            <ChevronDown
              size={12}
              className={`transition-transform ${showSaved ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Saved addresses dropdown */}
      {showSaved && savedAddresses.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
          {savedAddresses.map((addr, i) => (
            <button
              key={i}
              onClick={() => {
                onChange({ ...addr });
                setShowSaved(false);
              }}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm hover:border-emerald-400 transition-colors"
            >
              <p className="font-medium">
                {addr.name} · {addr.phone}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[addr.street, addr.district, addr.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {addr.label && (
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  {addr.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Form fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder, required }) => (
          <div key={key} className={key === "street" ? "sm:col-span-2" : ""}>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            <input
              value={value[key]}
              onChange={set(key)}
              placeholder={placeholder}
              className={`h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-400 ${
                errors[key]
                  ? "border-destructive focus:border-destructive"
                  : "border-border"
              }`}
            />
            {errors[key] && (
              <p className="mt-1 text-[11px] text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Tiếp tục
      </button>
    </div>
  );
}

// ─── Order Review ─────────────────────────────────────────────────────────────

function ReviewStep({
  address,
  paymentMethod,
  onPaymentChange,
  note,
  onNoteChange,
  onBack,
  onSubmit,
  submitting,
  cart,
}: {
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  onPaymentChange: (v: PaymentMethod) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  cart: ReturnType<typeof useCart>;
}) {
  const SHIPPING_FEE = cart.totalPrice >= 200_000 ? 0 : 25_000;
  const finalTotal = cart.totalPrice + SHIPPING_FEE;

  return (
    <div className="space-y-4">
      {/* Shipping address — summary */}
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
        <p className="text-sm font-medium">
          {address.name} · {address.phone}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {[address.street, address.district, address.city]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      {/* Payment method */}
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
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                paymentMethod === opt.value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-border hover:border-emerald-300"
              }`}
            >
              <div
                className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === opt.value
                    ? "border-emerald-600"
                    : "border-muted-foreground"
                }`}
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

      {/* Items list */}
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

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Ghi chú đơn hàng (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Price summary */}
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

      {/* Submit */}
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
            <CheckCircle2 size={16} />
            Đặt hàng
          </>
        )}
      </button>
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function OrderSuccess({
  orderId,
  orderCode,
}: {
  orderId: string;
  orderCode: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 size={40} className="text-emerald-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold">Đặt hàng thành công!</h2>
      <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng của bạn:</p>
      <p className="mb-6 text-lg font-bold text-primary">{orderCode}</p>
      <p className="mb-8 text-sm text-muted-foreground max-w-sm">
        Chúng tôi sẽ xác nhận đơn hàng trong thời gian sớm nhất. Bạn có thể theo
        dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => navigate("/shop")}
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();

  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    street: "",
    district: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    orderId: string;
    orderCode: string;
  } | null>(null);

  // Redirect nếu cart trống
  useEffect(() => {
    if (!cart.loading && cart.items.length === 0 && !success) {
      navigate("/cart", { replace: true });
    }
  }, [cart.loading, cart.items.length, success, navigate]);

  // Prefill từ user profile nếu có
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw);
      const defaultAddr = user.addresses?.find(
        (a: { isDefault: boolean }) => a.isDefault,
      );
      if (defaultAddr) {
        setAddress({
          name: user.name ?? "",
          phone: user.phone ?? "",
          ...defaultAddr,
        });
      } else {
        setAddress((prev) => ({
          ...prev,
          name: user.name ?? "",
          phone: user.phone ?? "",
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await orderApi.createOrder({
        shippingAddress: address,
        paymentMethod,
        note: note.trim() || undefined,
      });
      const order = (res as { data: { _id: string; orderCode: string } }).data;
      setSuccess({ orderId: order._id, orderCode: order.orderCode });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đặt hàng thất bại";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <OrderSuccess {...success} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Back */}
      <button
        onClick={() =>
          step === "review" ? setStep("address") : navigate("/cart")
        }
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft size={16} />
        {step === "review" ? "Quay lại địa chỉ" : "Quay lại giỏ hàng"}
      </button>

      <h1 className="mb-6 text-xl font-bold">Thanh toán</h1>

      <StepBar current={step} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left: steps */}
        <div>
          {step === "address" ? (
            <AddressStep
              value={address}
              onChange={setAddress}
              onNext={() => setStep("review")}
            />
          ) : (
            <ReviewStep
              address={address}
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              note={note}
              onNoteChange={setNote}
              onBack={() => setStep("address")}
              onSubmit={handleSubmit}
              submitting={submitting}
              cart={cart}
            />
          )}
        </div>

        {/* Right: mini cart summary (desktop) */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-border bg-card p-4 sticky top-28 space-y-3">
            <p className="text-sm font-semibold">
              Đơn hàng ({cart.totalItems} sản phẩm)
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cart.items.map((item) => {
                const img =
                  item.product.thumbnail ?? productImg(item.product as never);
                return (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-2.5"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted-foreground text-[9px] font-bold text-background">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="flex-1 line-clamp-1 text-xs">
                      {item.product.name}
                    </p>
                    <p className="shrink-0 text-xs font-semibold">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
              <div className="flex justify-between font-semibold text-sm pt-1">
                <span>Tổng</span>
                <span className="text-primary">
                  {formatPrice(cart.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
