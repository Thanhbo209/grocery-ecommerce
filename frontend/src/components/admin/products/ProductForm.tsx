import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  Category,
  CreateProductPayload,
  Product,
  ProductUnit,
} from "@/types/product";

// ─── Enum options matching productSchema.unit ─────────────────────────────────

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "cái", label: "Cái" },
  { value: "hộp", label: "Hộp" },
  { value: "lít", label: "Lít" },
  { value: "chai", label: "Chai" },
  { value: "bó", label: "Bó" },
  { value: "gói", label: "Gói" },
  { value: "túi", label: "Túi" },
];

// ─── Form value shape ─────────────────────────────────────────────────────────
// Numbers kept as string so <input type="number"> stays controlled.
// Booleans stay as boolean (Switch).

export interface ProductFormValues {
  name: string;
  description: string;
  category: string; // ObjectId string — matches schema.category ref
  price: string;
  discountPrice: string; // optional — maps to schema.discountPrice
  unit: ProductUnit; // enum — matches schema.unit
  stock: string;
  thumbnail: string; // maps to schema.thumbnail
  isActive: boolean; // maps to schema.isActive
  isFeatured: boolean; // maps to schema.isFeatured
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

function toFormValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category._id ?? "", // use _id (Mongoose ObjectId)
    price: product ? String(product.price) : "",
    discountPrice: product?.discountPrice ? String(product.discountPrice) : "",
    unit: product?.unit ?? "cái",
    stock: product ? String(product.stock) : "",
    thumbnail: product?.thumbnail ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  };
}

/** Converts validated form values to the exact POST /products body shape. */
export function formValuesToPayload(
  v: ProductFormValues,
): CreateProductPayload {
  return {
    name: v.name.trim(),
    description: v.description.trim() || undefined,
    category: v.category, // ObjectId string
    price: Number(v.price),
    discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
    unit: v.unit,
    stock: Number(v.stock),
    thumbnail: v.thumbnail.trim() || undefined,
    isActive: v.isActive,
    isFeatured: v.isFeatured,
    // slug & ratings are generated server-side — never sent from client
  };
}

// ─── Small reusable primitives ────────────────────────────────────────────────

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, required, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest ">
        {title}
      </p>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

interface SwitchRowProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border  px-4 py-3">
      <div>
        <p className="text-sm ">{label}</p>
        <p className="text-xs text-zinc-600">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface ProductFormProps {
  formId: string;
  product?: Product; // undefined = create mode; defined = edit mode
  categories: Category[];
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductForm({
  formId,
  product,
  categories,
  onSubmit,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({ defaultValues: toFormValues(product) });

  // Re-populate when a different product is opened in edit mode
  useEffect(() => {
    reset(toFormValues(product));
  }, [product, reset]);

  const inputCls =
    "h-9 bg-input border-border text-sm  placeholder:text-muted-foreground ";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 px-6 pb-2"
    >
      {/* ── Thông tin cơ bản ─────────────────────────────────────── */}
      <div>
        <Section title="Thông tin cơ bản" />
        <div className="grid grid-cols-2 gap-4">
          {/* name — required, slug auto-generated server-side */}
          <Field
            label="Tên sản phẩm"
            required
            error={errors.name?.message}
            className="col-span-2"
          >
            <Input
              {...register("name", { required: "Bắt buộc" })}
              placeholder="Nhập tên sản phẩm..."
              className={inputCls}
            />
          </Field>

          {/* category — ObjectId ref to Category collection */}
          <Field label="Danh mục" required error={errors.category?.message}>
            <Select
              value={watch("category")}
              onValueChange={(v) =>
                setValue("category", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className={cn(inputCls, "w-full")}>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {categories.map((c) => (
                  // key & value use _id — matches Mongoose ObjectId
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Đơn vị tính" required error={errors.unit?.message}>
            <Select
              value={watch("unit")}
              onValueChange={(v) =>
                setValue("unit", v as ProductUnit, { shouldValidate: true })
              }
            >
              <SelectTrigger className={cn(inputCls, "w-full")}>
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {UNIT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* price — required, min: 0 */}
          <Field label="Giá bán (₫)" required error={errors.price?.message}>
            <Input
              {...register("price", {
                required: "Bắt buộc",
                min: { value: 0, message: "Phải ≥ 0" },
              })}
              type="number"
              min={0}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          {/* discountPrice — optional, must be < price when present */}
          <Field
            label="Giá khuyến mãi (₫)"
            error={errors.discountPrice?.message}
          >
            <Input
              {...register("discountPrice", {
                min: { value: 0, message: "Phải ≥ 0" },
                validate: (v) => {
                  if (!v) return true;
                  // eslint-disable-next-line react-hooks/incompatible-library
                  const price = Number(watch("price"));
                  if (!price) return true;
                  return Number(v) < price || "Phải nhỏ hơn giá bán";
                },
              })}
              type="number"
              min={0}
              placeholder="Bỏ trống nếu không có"
              className={inputCls}
            />
          </Field>

          {/* description — optional */}
          <Field
            label="Mô tả"
            className="col-span-2"
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              placeholder="Mô tả chi tiết sản phẩm..."
              rows={3}
              className={cn(inputCls, "h-auto resize-none")}
            />
          </Field>
        </div>
      </div>

      {/* ── Kho hàng ─────────────────────────────────────────────── */}
      <div>
        <Section title="Kho hàng" />
        <Field
          label="Số lượng tồn kho"
          required
          error={errors.stock?.message}
          className="max-w-[50%]"
        >
          <Input
            {...register("stock", {
              required: "Bắt buộc",
              min: { value: 0, message: "Phải ≥ 0" },
            })}
            type="number"
            min={0}
            placeholder="0"
            className={inputCls}
          />
        </Field>
      </div>

      {/* ── Hiển thị (isActive, isFeatured) ──────────────────────── */}
      <div>
        <Section title="Hiển thị" />
        <div className="space-y-2">
          <SwitchRow
            label="Đang bán"
            description="Hiện sản phẩm ra ngoài cửa hàng"
            checked={watch("isActive")}
            onCheckedChange={(v) => setValue("isActive", v)}
          />
          <SwitchRow
            label="Nổi bật"
            description="Hiển thị ở trang chủ"
            checked={watch("isFeatured")}
            onCheckedChange={(v) => setValue("isFeatured", v)}
          />
        </div>
      </div>

      {/* ── Hình ảnh ─────────────────────────────────────────────── */}
      <div>
        <Section title="Hình ảnh" />
        <Field label="URL Thumbnail" error={errors.thumbnail?.message}>
          <Input
            {...register("thumbnail")}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
        <div className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-7 text-center transition-colors hover:border-primary hover:bg-accent/20">
          <UploadCloud size={20} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">Click để tải ảnh</span> hoặc kéo thả
          </p>
          <p className="text-[11px] text-muted-foreground">
            PNG, JPG, WEBP — tối đa 5MB
          </p>
        </div>
      </div>
    </form>
  );
}
