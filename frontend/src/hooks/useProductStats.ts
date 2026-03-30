import { useEffect, useState } from "react";
import type { ProductStats } from "../types/product";
import { productApi } from "@/api/productApi";

interface UseProductStatsReturn {
  stats: ProductStats | null;
  isLoading: boolean;
  refresh: () => void;
}

export function useProductStats(): UseProductStatsReturn {
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = () => {
    setIsLoading(true);
    productApi
      .getStats()
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
