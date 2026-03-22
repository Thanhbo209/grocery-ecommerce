import { useEffect, useState } from "react";
import { productApi } from "@/hooks/api";
import type { ProductFilters, ProductStats } from "../types/product";

interface UseProductStatsReturn {
  stats: ProductStats | null;
  isLoading: boolean;
  refresh: () => void;
}

// Filters tối giản chỉ để gọi getStats — không cần lọc gì
const STATS_FILTERS: ProductFilters = {
  search: "",
  category: "",
  isActive: "",
  isFeatured: "",
  sortField: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 1000,
};

export function useProductStats(): UseProductStatsReturn {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = () => {
    setIsLoading(true);
    productApi
      .getStats(STATS_FILTERS)
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, []);

  return { stats, isLoading, refresh: fetchStats };
}
