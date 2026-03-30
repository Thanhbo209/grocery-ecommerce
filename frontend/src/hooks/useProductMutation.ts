import { useState } from "react";
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../types/product";
import { productApi } from "@/api/productApi";
import type { MutationState } from "@/types/mutation-state";

interface UseProductMutationReturn {
  createProduct: (payload: CreateProductPayload) => Promise<boolean>;
  updateProduct: (payload: UpdateProductPayload) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  state: MutationState;
  reset: () => void;
}

export function useProductMutation(
  onSuccess?: () => void,
): UseProductMutationReturn {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  });

  const run = async (fn: () => Promise<unknown>): Promise<boolean> => {
    setState({ isLoading: true, error: null });
    try {
      await fn();
      setState({ isLoading: false, error: null });
      onSuccess?.();
      return true;
    } catch (err) {
      setState({
        isLoading: false,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
      return false;
    }
  };

  const createProduct = (payload: CreateProductPayload) =>
    run(() => productApi.create(payload));

  const updateProduct = (payload: UpdateProductPayload) =>
    run(() => productApi.update(payload));

  const deleteProduct = (id: string) => run(() => productApi.delete(id));

  const reset = () => setState({ isLoading: false, error: null });

  return { createProduct, updateProduct, deleteProduct, state, reset };
}
