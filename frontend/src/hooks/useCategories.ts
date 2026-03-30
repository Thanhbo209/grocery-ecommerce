import { categoryApi } from "@/api/categoryApi";
import type { Category } from "@/types/category";
import { useCallback, useEffect, useState } from "react";

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(() => {
    setIsLoading(true);
    categoryApi
      .getAll()
      .then(setCategories)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refresh: fetchCategories };
}
