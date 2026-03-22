import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category, Product } from "@/types/product";
import {
  formValuesToPayload,
  ProductForm,
  type ProductFormValues,
} from "@/components/admin/products/ProductForm";

const FORM_ID = "edit-product-form";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  isSubmitting: boolean;
  /** id = product._id (Mongoose ObjectId string) */
  onSubmit: (
    id: string,
    payload: ReturnType<typeof formValuesToPayload>,
  ) => void;
}

export function EditProductModal({
  open,
  onOpenChange,
  product,
  categories,
  isSubmitting,
  onSubmit,
}: EditProductModalProps) {
  if (!product) return null;

  const handleSubmit = (values: ProductFormValues) =>
    // Use _id — matches PUT /products/:id on backend
    onSubmit(product._id, formValuesToPayload(values));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-150 gap-0 overflow-hidden border-border p-0 ">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-base font-semibold ">
            Chỉnh sửa sản phẩm
          </DialogTitle>
          {/* slug shown as read-only context */}
          <p className="mt-0.5 text-xs text-muted-foreground">
            slug: {product.slug}
          </p>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto py-6">
          <ProductForm
            formId={FORM_ID}
            product={product}
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
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
