import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableRow } from "./ProductTableRow";
import type { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedIds: Set<string>;
  onSelectOne: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  isLoading,
  error,
  selectedIds,
  onSelectOne,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const allSelected =
    products.length > 0 && selectedIds.size === products.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 pl-4">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (
                      el as HTMLButtonElement & { indeterminate?: boolean }
                    ).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={onSelectAll}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sản phẩm
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Danh mục
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Giá
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Tồn kho
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Trạng thái
            </TableHead>
            <TableHead className="w-24 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && (
            <TableRow className="border-transparent hover:bg-transparent">
              <td colSpan={7} className="py-16 text-center">
                <Loader2
                  size={20}
                  className="mx-auto animate-spin text-muted-foreground"
                />
              </td>
            </TableRow>
          )}

          {!isLoading && error && (
            <TableRow className="border-transparent hover:bg-transparent">
              <td
                colSpan={7}
                className="py-16 text-center text-sm text-destructive"
              >
                {error}
              </td>
            </TableRow>
          )}

          {!isLoading && !error && products.length === 0 && (
            <TableRow className="border-transparent hover:bg-transparent">
              <td
                colSpan={7}
                className="py-16 text-center text-sm text-muted-foreground"
              >
                Không tìm thấy sản phẩm nào
              </td>
            </TableRow>
          )}

          {/* _id is the Mongoose ObjectId string — use as React key */}
          {!isLoading &&
            !error &&
            products.map((product) => (
              <ProductTableRow
                key={product._id}
                product={product}
                isSelected={selectedIds.has(product._id)}
                onSelectChange={(checked) => onSelectOne(product._id, checked)}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
