import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/hooks/api";
import type {
  PaginatedResponse,
  Product,
  ProductFilters,
} from "../types/product";

const DEFAULT_FILTERS: ProductFilters = {
  search: "",
  category: "", // ObjectId string | "" — khớp ProductToolbar onCategoryChange
  isActive: "", // "" = không lọc — khớp ProductToolbar onIsActiveChange
  isFeatured: "", // "" = không lọc
  sortField: "createdAt",
  sortOrder: "desc",
  page: 1,
  pageSize: 10,
};

export interface UseProductsReturn {
  data: PaginatedResponse<Product> | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  // Khớp với ProductToolbar props:
  setSearch: (search: string) => void;
  setCategory: (id: string) => void; // onCategoryChange
  setIsActive: (value: boolean | "") => void; // onIsActiveChange
  setIsFeatured: (value: boolean | "") => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

export function useProducts(): UseProductsReturn {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await productApi.getAll(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const setSearch = (search: string) =>
    setFilters((f) => ({ ...f, search, page: 1 }));

  // category là ObjectId string — "" để bỏ filter
  const setCategory = (category: string) =>
    setFilters((f) => ({ ...f, category, page: 1 }));

  // isActive: boolean | "" — khớp với ProductToolbar handleIsActiveChange
  const setIsActive = (isActive: boolean | "") =>
    setFilters((f) => ({ ...f, isActive, page: 1 }));

  const setIsFeatured = (isFeatured: boolean | "") =>
    setFilters((f) => ({ ...f, isFeatured, page: 1 }));

  const setPage = (page: number) => setFilters((f) => ({ ...f, page }));

  const setPageSize = (pageSize: number) =>
    setFilters((f) => ({ ...f, pageSize, page: 1 }));

  return {
    data,
    isLoading,
    error,
    filters,
    setSearch,
    setCategory,
    setIsActive,
    setIsFeatured,
    setPage,
    setPageSize,
    refresh: fetchProducts,
  };
}
