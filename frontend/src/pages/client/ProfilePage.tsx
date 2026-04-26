import { useEffect, useMemo, useState } from "react";
import {
  User,
  MapPin,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/api/userApi";
import { cn } from "@/lib/utils";
import type { Address, AddressPayload, UserProfile } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProvinces, getDistricts } from "vietnam-provinces";

type Tab = "info" | "addresses" | "password";
type AddressErrors = Partial<Record<keyof AddressPayload, string>>;

function AddressModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial?: Address;
  onSave: (data: AddressPayload) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  // ─── DATA ─────────────────────────────────────
  const provinces = useMemo(() => getProvinces(), []);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>("");

  const districts = useMemo(() => {
    return selectedProvinceCode ? getDistricts(selectedProvinceCode) : [];
  }, [selectedProvinceCode]);

  // ─── FORM ─────────────────────────────────────
  const [form, setForm] = useState<AddressPayload>({
    label: initial?.label ?? "",
    street: initial?.street ?? "",
    district: initial?.district ?? "",
    city: initial?.city ?? "",
    isDefault: initial?.isDefault ?? false,
  });

  const [errors, setErrors] = useState<AddressErrors>({});

  // ─── INIT EDIT MODE (QUAN TRỌNG) ───────────────
  useEffect(() => {
    if (!initial) return;

    // set province
    const province = provinces.find((p) => p.name === initial.city);
    if (province) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProvinceCode(province.code);

      const districtList = getDistricts(province.code);
      const district = districtList.find((d) => d.name === initial.district);

      if (district) {
        setSelectedDistrictCode(district.code);
      }
    }
  }, [initial, provinces]);

  // ─── HANDLER ──────────────────────────────────
  const set =
    (field: keyof AddressPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));

      if (errors[field]) {
        setErrors((p) => ({ ...p, [field]: "" }));
      }
    };

  const handleProvinceChange = (code: string) => {
    const province = provinces.find((p) => p.code === code);

    setSelectedProvinceCode(code);
    setSelectedDistrictCode(""); // reset district

    setForm((f) => ({
      ...f,
      city: province?.name || "",
      district: "",
    }));
  };

  const handleDistrictChange = (code: string) => {
    const district = districts.find((d) => d.code === code);

    setSelectedDistrictCode(code);

    setForm((f) => ({
      ...f,
      district: district?.name || "",
    }));
  };

  // ─── VALIDATE ─────────────────────────────────
  const validate = () => {
    const errs: Partial<Record<keyof AddressPayload, string>> = {};

    if (!form.street.trim()) errs.street = "Vui lòng nhập địa chỉ";
    if (!selectedProvinceCode) errs.city = "Vui lòng chọn tỉnh/thành";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(form);
  };

  // ─── RENDER ───────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        <h2 className="mb-5 text-base font-semibold">
          {initial ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h2>

        <div className="space-y-4">
          {/* LABEL */}
          <div>
            <label className="mb-1.5 text-xs">Nhãn</label>
            <input
              value={form.label}
              onChange={set("label")}
              placeholder="Nhà, Công ty..."
              className="h-10 w-full rounded-xl border px-3 text-sm"
            />
          </div>

          {/* STREET */}
          <div>
            <label className="mb-1.5 text-xs">
              Địa chỉ <span className="text-destructive">*</span>
            </label>
            <input
              value={form.street}
              onChange={set("street")}
              placeholder="Số nhà, tên đường"
              className={cn(
                "h-10 w-full rounded-xl border px-3 text-sm",
                errors.street && "border-destructive",
              )}
            />
            {errors.street && (
              <p className="text-xs text-destructive">{errors.street}</p>
            )}
          </div>

          {/* PROVINCE */}
          <div>
            <label className="mb-1.5 text-xs">
              Tỉnh / Thành phố <span className="text-destructive">*</span>
            </label>

            <Select
              value={selectedProvinceCode}
              onValueChange={handleProvinceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh / thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.city && (
              <p className="text-xs text-destructive">{errors.city}</p>
            )}
          </div>

          {/* DISTRICT */}
          <div>
            <label className="mb-1.5 text-xs">Quận / Huyện</label>

            <Select
              value={selectedDistrictCode}
              onValueChange={handleDistrictChange}
              disabled={!selectedProvinceCode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận / huyện" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.code} value={d.code}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DEFAULT */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
            />
            Đặt làm mặc định
          </label>
        </div>

        {/* ACTION */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border py-2.5 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm text-white"
          >
            {saving ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  loading,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  loading: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 transition-all",
        address.isDefault
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card",
      )}
    >
      {address.isDefault && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Star size={9} className="fill-primary" /> Mặc định
        </span>
      )}

      {address.label && (
        <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {address.label}
        </p>
      )}
      <p className="text-sm font-medium">
        {[address.street, address.district, address.city]
          .filter(Boolean)
          .join(", ")}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {!address.isDefault && (
          <button
            onClick={onSetDefault}
            disabled={loading}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Check size={11} /> Đặt mặc định
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Pencil size={11} /> Sửa
        </button>
        <button
          onClick={onDelete}
          disabled={loading}
          className="flex items-center gap-1 rounded-full border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={11} /> Xóa
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Thông tin cá nhân ───────────────────────────────────────────────────

function InfoTab({
  profile,
  onUpdated,
}: {
  profile: UserProfile;
  onUpdated: (p: UserProfile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      onUpdated(updated as unknown as UserProfile);
      toast.success("Cập nhật thông tin thành công");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-md">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Email{" "}
          <span className="text-muted-foreground/60">(không thể thay đổi)</span>
        </label>
        <input
          value={profile.email}
          disabled
          className="h-10 w-full rounded-xl border border-border bg-muted/60 px-3 text-sm text-muted-foreground cursor-not-allowed"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Họ và tên <span className="text-destructive">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nguyễn Văn A"
          className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Số điện thoại
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0901234567"
          className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-sm outline-none focus:border-primary focus:bg-background transition-colors"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

// ─── Tab: Địa chỉ ─────────────────────────────────────────────────────────────

function AddressTab({
  addresses,
  onAddressesUpdated,
}: {
  addresses: Address[];
  onAddressesUpdated: (next: Address[]) => void;
}) {
  const [modal, setModal] = useState<"add" | Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSave = async (data: AddressPayload) => {
    setSaving(true);
    try {
      let updated: Address[];
      if (modal === "add") {
        updated = (await userApi.addAddress(data)) as unknown as Address[];
      } else {
        updated = (await userApi.updateAddress(
          (modal as Address)._id,
          data,
        )) as unknown as Address[];
      }

      onAddressesUpdated(updated);
      setModal(null);
      toast.success(
        modal === "add" ? "Đã thêm địa chỉ" : "Đã cập nhật địa chỉ",
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    setLoading(addressId);
    try {
      const updated = (await userApi.deleteAddress(
        addressId,
      )) as unknown as Address[];
      onAddressesUpdated(updated);
      toast.success("Đã xóa địa chỉ");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setLoading(addressId);
    try {
      const updated = (await userApi.setDefaultAddress(
        addressId,
      )) as unknown as Address[];
      onAddressesUpdated(updated);
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có địa chỉ nào. Thêm địa chỉ để thanh toán nhanh hơn.
            </p>
          </div>
        ) : (
          addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onEdit={() => setModal(addr)}
              onDelete={() => handleDelete(addr._id)}
              onSetDefault={() => handleSetDefault(addr._id)}
              loading={loading === addr._id}
            />
          ))
        )}

        <button
          onClick={() => setModal("add")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={16} /> Thêm địa chỉ mới
        </button>
      </div>

      {modal !== null && (
        <AddressModal
          initial={modal !== "add" ? (modal as Address) : undefined}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </>
  );
}

// ─── Tab: Đổi mật khẩu ───────────────────────────────────────────────────────

function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<typeof form>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((p) => ({ ...p, [field]: "" }));
    };

  const validate = () => {
    const errs = { currentPassword: "", newPassword: "", confirmPassword: "" };
    if (!form.currentPassword)
      errs.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!form.newPassword) errs.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (form.newPassword.length < 6) errs.newPassword = "Ít nhất 6 ký tự";
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await userApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Đổi mật khẩu thành công");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      key: "currentPassword" as const,
      label: "Mật khẩu hiện tại",
      placeholder: "••••••••",
    },
    {
      key: "newPassword" as const,
      label: "Mật khẩu mới",
      placeholder: "Ít nhất 6 ký tự",
    },
    {
      key: "confirmPassword" as const,
      label: "Xác nhận mật khẩu mới",
      placeholder: "Nhập lại mật khẩu mới",
    },
  ];

  return (
    <div className="space-y-5 max-w-md">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {label}
          </label>
          <input
            type="password"
            value={form[key]}
            onChange={set(key)}
            placeholder={placeholder}
            className={cn(
              "h-10 w-full rounded-xl border bg-muted/40 px-3 text-sm outline-none transition-colors focus:bg-background",
              errors[key]
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary",
            )}
          />
          {errors[key] && (
            <p className="mt-1 text-[11px] text-destructive">{errors[key]}</p>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Đổi mật khẩu"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    userApi
      .getProfile()
      .then((p) => setProfile(p as unknown as UserProfile))
      .catch(() => toast.error("Không thể tải thông tin"))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "info", label: "Thông tin", icon: <User size={15} /> },
    { key: "addresses", label: "Địa chỉ", icon: <MapPin size={15} /> },
    { key: "password", label: "Mật khẩu", icon: <Lock size={15} /> },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-7 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
              activeTab === key
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "info" && (
          <InfoTab profile={profile} onUpdated={setProfile} />
        )}
        {activeTab === "addresses" && (
          <AddressTab
            addresses={profile.addresses}
            onAddressesUpdated={(addresses) =>
              setProfile((prev) => (prev ? { ...prev, addresses } : prev))
            }
          />
        )}
        {activeTab === "password" && <PasswordTab />}
      </div>
    </div>
  );
}
