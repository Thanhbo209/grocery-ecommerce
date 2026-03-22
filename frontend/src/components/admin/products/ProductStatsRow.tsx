import {
  Package,
  ShoppingBag,
  EyeOff,
  Star,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import type { ProductStats } from "@/types/product";

interface StatCardProps {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  sub?: string;
  subColor?: string;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  sub,
  subColor,
  isLoading,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider ">
          {label}
        </span>
        <span>{icon}</span>
      </div>

      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded " />
      ) : (
        <p className="text-[28px] font-semibold leading-none tracking-tight ">
          {value !== null ? formatNumber(value) : "—"}
        </p>
      )}

      {sub && <p className={cn("mt-2 text-xs", subColor ?? "0")}>{sub}</p>}
    </div>
  );
}

interface ProductStatsRowProps {
  stats: ProductStats | null;
  isLoading?: boolean;
}

export function ProductStatsRow({ stats, isLoading }: ProductStatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-foreground lg:grid-cols-5">
      <StatCard
        label="Tổng sản phẩm"
        value={stats?.total ?? null}
        sub="Sản phẩm trong hệ thống"
        icon={<Package size={15} />}
        isLoading={isLoading}
      />
      {/* isActive: true */}
      <StatCard
        label="Đang bán"
        value={stats?.active ?? null}
        icon={<ShoppingBag size={15} />}
        sub="Sản phẩm đang bán"
        subColor="text-emerald-600"
        isLoading={isLoading}
      />
      {/* isActive: false */}
      <StatCard
        label="Đang ẩn"
        value={stats?.inactive ?? null}
        icon={<EyeOff size={15} />}
        sub="Sản phẩm đang ẩn"
        subColor="text-zinc-600"
        isLoading={isLoading}
      />
      {/* isFeatured: true */}
      <StatCard
        label="Nổi bật"
        value={stats?.featured ?? null}
        icon={<Star size={15} />}
        sub="Sản phẩm nổi bật"
        subColor="text-amber-600"
        isLoading={isLoading}
      />
      {/* stock === 0 */}
      <StatCard
        label="Hết hàng"
        value={stats?.outOfStock ?? null}
        icon={<AlertTriangle size={15} />}
        sub="Số lượng hàng đã hết"
        subColor="text-red-500"
        isLoading={isLoading}
      />
    </div>
  );
}
