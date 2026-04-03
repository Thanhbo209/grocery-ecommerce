import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { productImg } from "@/lib/helper";
import { toast } from "sonner";
import { orderApi } from "@/api/orderApi";
import { StepBar } from "@/components/client/checkout/StepBar";
import type { PaymentMethod, ShippingAddress, Step } from "@/types/check-out";
import { ReviewStep } from "@/components/client/checkout/ReviewStep";
import { OrderSuccess } from "@/components/client/checkout/OrderSuccess";
import { AddressStep } from "@/components/client/checkout/AddressStep";

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

  useEffect(() => {
    if (!cart.loading && cart.items.length === 0 && !success) {
      navigate("/cart", { replace: true });
    }
  }, [cart.loading, cart.items.length, success, navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const user = JSON.parse(raw);
      setAddress((prev) => ({
        ...prev,
        name: user.name ?? prev.name,
        phone: user.phone ?? prev.phone,
      }));
    } catch {
      /* ignore */
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
      const order = res as unknown as { _id: string; orderCode: string };
      setSuccess({ orderId: order._id, orderCode: order.orderCode });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Đặt hàng thất bại");
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

        {/* Mini cart sidebar */}
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
