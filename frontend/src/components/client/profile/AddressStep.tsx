import { useEffect, useRef, useState } from "react";
import { MapPin, Plus, ChevronDown } from "lucide-react";
import { userApi } from "@/api/userApi";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/auth";

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}

interface Props {
  value: ShippingAddress;
  onChange: (v: ShippingAddress) => void;
  onNext: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddressStep({ value, onChange, onNext }: Props) {
  const latestValueRef = useRef(value);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    userApi
      .getProfile()
      .then((profile) => {
        const addrs =
          (profile as unknown as { addresses: Address[] }).addresses ?? [];
        setSavedAddresses(addrs);

        // Prefill địa chỉ mặc định nếu có
        const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (defaultAddr) {
          setSelectedId(defaultAddr._id);
          // Giữ name/phone từ value (đã prefill từ user profile ở CheckoutPage)
          onChange({
            ...latestValueRef.current,
            street: latestValueRef.current.street || defaultAddr.street,
            district:
              latestValueRef.current.district || defaultAddr.district || "",
            city: latestValueRef.current.city || defaultAddr.city,
          });
        }
      })
      .catch(() => {
        setUseManual(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectSaved = (addr: Address) => {
    setSelectedId(addr._id);
    onChange({
      ...value, // giữ name/phone
      street: addr.street,
      district: addr.district ?? "",
      city: addr.city,
    });
    setShowSaved(false);
    setUseManual(false);
  };

  const selectedAddr = savedAddresses.find((a) => a._id === selectedId);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-primary" />
        <h2 className="font-semibold text-base">Địa chỉ giao hàng</h2>
      </div>

      {/* Name + Phone luôn hiện — bất kể chọn saved hay nhập tay */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["name", "phone"] as const).map((key) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {key === "name" ? "Họ và tên" : "Số điện thoại"}
              <span className="ml-0.5 text-destructive">*</span>
            </label>
            <input
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              placeholder={key === "name" ? "Nguyễn Văn A" : "0901234567"}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Saved addresses picker */}
      {savedAddresses.length > 0 && !useManual && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Địa chỉ đã lưu
            </p>
            <button
              onClick={() => setUseManual(true)}
              className="text-xs text-primary hover:underline"
            >
              + Nhập địa chỉ mới
            </button>
          </div>

          {/* Selected address display */}
          {selectedAddr && (
            <button
              onClick={() => setShowSaved((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-left transition-colors hover:border-primary"
            >
              <div>
                {selectedAddr.label && (
                  <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {selectedAddr.label}
                  </span>
                )}
                <span className="text-sm">
                  {[
                    selectedAddr.street,
                    selectedAddr.district,
                    selectedAddr.city,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "shrink-0 text-muted-foreground transition-transform",
                  showSaved && "rotate-180",
                )}
              />
            </button>
          )}

          {/* Dropdown list */}
          {showSaved && (
            <div className="mt-2 space-y-2 rounded-xl border border-border bg-card p-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr._id}
                  onClick={() => handleSelectSaved(addr)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                    selectedId === addr._id && "bg-primary/5",
                  )}
                >
                  <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    {addr.label && (
                      <span className="mr-1.5 text-[10px] font-semibold text-primary uppercase">
                        {addr.label}
                      </span>
                    )}
                    <span>
                      {[addr.street, addr.district, addr.city]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    {addr.isDefault && (
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        (mặc định)
                      </span>
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => {
                  setUseManual(true);
                  setShowSaved(false);
                  setSelectedId(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <Plus size={13} /> Nhập địa chỉ mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual form — khi chọn nhập tay hoặc chưa có saved address */}
      {(useManual || savedAddresses.length === 0) && (
        <div>
          {useManual && savedAddresses.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">
                Nhập địa chỉ mới
              </p>
              <button
                onClick={() => {
                  setUseManual(false);
                  if (savedAddresses.length > 0) {
                    handleSelectSaved(
                      savedAddresses.find((a) => a.isDefault) ??
                        savedAddresses[0],
                    );
                  }
                }}
                className="text-xs text-primary hover:underline"
              >
                Dùng địa chỉ đã lưu
              </button>
            </div>
          )}

          {/* Chỉ render street, district, city — name/phone đã có ở trên */}
          {(["street", "district", "city"] as const).map((key) => (
            <div key={key} className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {key === "street"
                  ? "Địa chỉ"
                  : key === "district"
                    ? "Quận / Huyện"
                    : "Thành phố"}
                {key !== "district" && (
                  <span className="ml-0.5 text-destructive">*</span>
                )}
              </label>
              <input
                value={value[key]}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                placeholder={
                  key === "street"
                    ? "123 Lê Lợi"
                    : key === "district"
                      ? "Quận 1"
                      : "TP. Hồ Chí Minh"
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        Tiếp tục
      </button>
    </div>
  );
}
