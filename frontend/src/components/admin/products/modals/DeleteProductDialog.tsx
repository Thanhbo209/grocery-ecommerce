import { Loader2, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  isDeleting: boolean;
  /** Called with product._id (Mongoose ObjectId string) → DELETE /products/:id */
  onConfirm: (id: string) => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  isDeleting,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-105 border-border">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-destructive/30 bg-destructive/20">
            <TriangleAlert size={22} className="text-destructive" />
          </div>
          <AlertDialogTitle className="text-start text-base font-semibold ">
            Xóa sản phẩm này?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start text-sm leading-relaxed ">
            Bạn sắp xóa{" "}
            <span className="font-bold text-primary">
              {product?.name ?? "sản phẩm này"}
            </span>
            .<br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 flex-row justify-center gap-3 sm:justify-center">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => product && onConfirm(product._id)}
            disabled={isDeleting || !product}
            className="flex-1 border"
          >
            {isDeleting && (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            )}
            Xóa vĩnh viễn
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
