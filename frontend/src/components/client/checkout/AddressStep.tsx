import { userApi } from "@/api/userApi";
import { mapProfileToShipping, validate } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { Address, UserProfile } from "@/types/auth";
import type { ShippingAddress } from "@/types/check-out";
import { CheckCircle2, ChevronDown, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type AddressMode = "saved" | "manual";

export function AddressStep({
  value,
  onChange,
  onNext,
}: {
  value: ShippingAddress;
  onChange: (v: ShippingAddress) => void;
  onNext: () => void;
}) {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [mode, setMode] = useState<AddressMode>("saved");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  useEffect(() => {
    userApi
      .getProfile()
      .then((profile) => {
        const p = profile as UserProfile;
        const addrs = p.addresses ?? [];
        setSavedAddresses(addrs);

        const mapped = mapProfileToShipping(profile);

        onChange(mapped);

        if (addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) ?? addrs[0];
          setSelectedId(def._id);
          setMode("saved");
        } else {
          setMode("manual");
        }
      })
      .catch(() => setMode("manual"))
      .finally(() => setLoadingAddresses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAddr = savedAddresses.find((a) => a._id === selectedId);

  const handleSelectAddr = (addr: Address) => {
    setSelectedId(addr._id);
    onChange({
      ...value,
      street: addr.street,
      district: addr.district ?? "",
      city: addr.city,
      label: addr.label,
    });

    setShowDropdown(false);
  };

  const set =
    (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, [field]: e.target.value });
      if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    };

  const manualFields: {
    key: keyof ShippingAddress;
    label: string;
    placeholder: string;
    required?: boolean;
    colSpan?: boolean;
  }[] = [
    {
      key: "street",
      label: "Địa chỉ (số nhà, tên đường)",
      placeholder: "123 Lê Lợi",
      required: true,
      colSpan: true,
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
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-primary" />
        <h2 className="font-semibold text-base">Địa chỉ giao hàng</h2>
      </div>

      {/* Name + Phone — luôn hiện */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(["name", "phone"] as const).map((key) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {key === "name" ? "Họ và tên" : "Số điện thoại"}
              <span className="ml-0.5 text-destructive">*</span>
            </label>
            <input
              value={value[key]}
              onChange={set(key)}
              placeholder={key === "name" ? "Nguyễn Văn A" : "0901234567"}
              className={cn(
                "h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:border-emerald-400",
                errors[key] ? "border-destructive" : "border-border",
              )}
            />
            {errors[key] && (
              <p className="mt-1 text-[11px] text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Mode toggle — chỉ hiện khi có saved address */}
      {!loadingAddresses && savedAddresses.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setMode("saved")}
            className={cn(
              "flex-1 rounded-xl border py-2 text-xs font-medium transition-all",
              mode === "saved"
                ? "border-border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                : "border-border text-muted-foreground hover:border-emerald-300",
            )}
          >
            Địa chỉ đã lưu
          </button>
          <button
            onClick={() => {
              setMode("manual");
              setSelectedId(null);
              onChange({
                ...value,
                street: "",
                district: "",
                city: "",
                label: undefined,
              });
            }}
            className={cn(
              "flex-1 rounded-xl border py-2 text-xs font-medium transition-all",
              mode === "manual"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                : "border-border text-muted-foreground hover:border-emerald-300",
            )}
          >
            <Plus size={11} className="mr-1 inline" />
            Nhập địa chỉ mới
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loadingAddresses && (
        <div className="h-14 animate-pulse rounded-xl bg-muted" />
      )}

      {/* Saved mode: dropdown chọn địa chỉ */}
      {!loadingAddresses && mode === "saved" && savedAddresses.length > 0 && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Chọn địa chỉ giao hàng
          </label>
          <button
            onClick={() => setShowDropdown((o) => !o)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              selectedAddr
                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10"
                : "border-border bg-background",
            )}
          >
            <div className="min-w-0 flex-1">
              {selectedAddr ? (
                <>
                  {selectedAddr.label && (
                    <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {selectedAddr.label}
                    </span>
                  )}
                  <span>
                    {[
                      selectedAddr.street,
                      selectedAddr.district,
                      selectedAddr.city,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Chọn địa chỉ...</span>
              )}
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "ml-2 shrink-0 text-muted-foreground transition-transform",
                showDropdown && "rotate-180",
              )}
            />
          </button>

          {showDropdown && (
            <div className="mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-md">
              {savedAddresses.map((addr) => (
                <button
                  key={addr._id}
                  onClick={() => handleSelectAddr(addr)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left text-sm last:border-0 hover:bg-muted transition-colors",
                    selectedId === addr._id &&
                      "bg-emerald-50/60 dark:bg-emerald-950/10",
                  )}
                >
                  <MapPin
                    size={13}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                      {addr.label && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {addr.label}
                        </span>
                      )}
                      {addr.isDefault && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-sm">
                      {[addr.street, addr.district, addr.city]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  {selectedId === addr._id && (
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual mode: nhập street, district, city */}
      {!loadingAddresses && mode === "manual" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {manualFields.map(
            ({ key, label, placeholder, required, colSpan }) => (
              <div key={key} className={colSpan ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  {label}
                  {required && (
                    <span className="ml-0.5 text-destructive">*</span>
                  )}
                </label>
                <input
                  value={value[key] ?? ""}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className={cn(
                    "h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition-colors focus:border-emerald-400",
                    errors[key] ? "border-destructive" : "border-border",
                  )}
                />
                {errors[key] && (
                  <p className="mt-1 text-[11px] text-destructive">
                    {errors[key]}
                  </p>
                )}
              </div>
            ),
          )}
        </div>
      )}

      <button
        onClick={() => validate(value, setErrors) && onNext()}
        disabled={loadingAddresses}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        Tiếp tục
      </button>
    </div>
  );
}
