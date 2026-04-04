import { useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  Loader2,
  TriangleAlert,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryMutation } from "@/hooks/useCategoryMutation";
import type { Category } from "@/types/category";

// ─── Form modal (dùng cho cả create lẫn edit) ─────────────────────────────────

interface CategoryFormValues {
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: CategoryFormValues;
  title: string;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => void;
}

function CategoryFormModal({
  open,
  onOpenChange,
  initial,
  title,
  isSubmitting,
  onSubmit,
}: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormValues>(initial);

  // Sync khi modal mở với dữ liệu mới
  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  const inputCls =
    "h-9 bg-background border-border text-sm focus-visible:ring-violet-500/40";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-110 gap-0 border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="VD: Rau củ quả"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Mô tả
            </Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Mô tả ngắn (tuỳ chọn)"
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm text-foreground">Hiện thị</p>
              <p className="text-xs text-muted-foreground">
                Danh mục hiển thị ngoài cửa hàng
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={isSubmitting || !form.name.trim()}
          >
            {isSubmitting && (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            )}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  isDeleting: boolean;
  onConfirm: () => void;
}

function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  isDeleting,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-100 border-border bg-card">
        <AlertDialogHeader>
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border ">
            <TriangleAlert size={20} className="text-destructive" />
          </div>
          <AlertDialogTitle className="text-center text-base font-semibold">
            Xóa danh mục?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            Bạn sắp xóa{" "}
            <span className="font-medium text-foreground">
              {category?.name ?? "danh mục này"}
            </span>
            . Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 border border-destructive bg-destructive/20 text-destructive hover:bg-destructive/50"
          >
            {isDeleting && (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            )}
            Xóa
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Category row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Tag size={13} className="text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{category.name}</p>
        {category.description && (
          <p className="truncate text-xs text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      <Badge
        className={cn(
          "text-[11px] font-normal border",
          category.isActive
            ? "border-primary bg-primary/20 text-primary"
            : "border-zinc-700/40 bg-zinc-800/40 text-zinc-400",
        )}
      >
        {category.isActive ? "Hiện" : "Ẩn"}
      </Badge>

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(category)}
        >
          <Pencil size={13} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:bg-red-950/40 hover:text-red-400"
          onClick={() => onDelete(category)}
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const EMPTY_FORM: CategoryFormValues = {
  name: "",
  description: "",
  isActive: true,
};

type CatModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; category: Category }
  | { type: "delete"; category: Category };

export function CategorySection() {
  const { categories, isLoading, refresh } = useCategories();
  const [modal, setModal] = useState<CatModalState>({ type: "none" });

  const {
    createCategory,
    updateCategory,
    deleteCategory,
    state: mutState,
  } = useCategoryMutation(() => {
    refresh();
    setModal({ type: "none" });
  });

  const handleSubmit = (values: CategoryFormValues) => {
    if (modal.type === "create") {
      void createCategory({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        isActive: values.isActive,
      });
    } else if (modal.type === "edit") {
      void updateCategory({
        id: modal.category._id,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        isActive: values.isActive,
      });
    }
  };

  const formInitial: CategoryFormValues =
    modal.type === "edit"
      ? {
          name: modal.category.name,
          description: modal.category.description ?? "",
          isActive: modal.category.isActive,
        }
      : EMPTY_FORM;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Danh mục</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} danh mục
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModal({ type: "create" })}
          className="h-8 "
        >
          <Plus size={13} className="mr-1.5" />
          Thêm
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Chưa có danh mục nào
          </div>
        )}

        {!isLoading &&
          categories.map((cat) => (
            <CategoryRow
              key={cat._id}
              category={cat}
              onEdit={(c) => setModal({ type: "edit", category: c })}
              onDelete={(c) => setModal({ type: "delete", category: c })}
            />
          ))}
      </div>

      {/* Form modal — dùng cho cả create lẫn edit */}
      <CategoryFormModal
        open={modal.type === "create" || modal.type === "edit"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        initial={formInitial}
        title={modal.type === "edit" ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        isSubmitting={mutState.isLoading}
        onSubmit={handleSubmit}
      />

      <DeleteCategoryDialog
        open={modal.type === "delete"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        category={modal.type === "delete" ? modal.category : null}
        isDeleting={mutState.isLoading}
        onConfirm={() => {
          if (modal.type === "delete") void deleteCategory(modal.category._id);
        }}
      />
    </div>
  );
}
