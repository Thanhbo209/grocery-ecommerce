import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";

interface ProductPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function ProductPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ProductPaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      {/* Summary */}
      <p className="text-xs text-muted-foreground">
        {formatNumber(from)}–{formatNumber(to)} trong{" "}
        <span className="text-muted-foreground">{formatNumber(total)}</span> sản
        phẩm
      </p>

      <div className="flex items-center gap-4 text-muted-foreground">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <span className="text-xs whitespace-nowrap">Mỗi trang</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-15bg-card border-border text-xs ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border">
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs ">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 disabled:opacity-30"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 disabled:opacity-30"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={13} />
          </Button>

          <span className="min-w-20 text-center text-xs">
            {formatNumber(page)} / {formatNumber(totalPages)}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 disabled:opacity-30"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 disabled:opacity-30"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
