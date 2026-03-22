import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { formValuesToPayload } from "@/components/admin/products/ProductForm";
import type { ProductFormValues } from "@/components/admin/products/ProductForm";
import type { Category } from "@/types/product";

const FORM_ID = "create-product-form";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  isSubmitting: boolean;
  onSubmit: (payload: ReturnType<typeof formValuesToPayload>) => void;
}

export function CreateProductModal({
  open,
  onOpenChange,
  categories,
  isSubmitting,
  onSubmit,
}: CreateProductModalProps) {
  const handleSubmit = (values: ProductFormValues) =>
    onSubmit(formValuesToPayload(values));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-150 gap-0 overflow-hidden border-border  p-0 ">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-base font-semibold ">
            Thêm sản phẩm mới
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto py-6">
          <ProductForm
            formId={FORM_ID}
            categories={categories}
            onSubmit={handleSubmit}
          />
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            )}
            Lưu sản phẩm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
