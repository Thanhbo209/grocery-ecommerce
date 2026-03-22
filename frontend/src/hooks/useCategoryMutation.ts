import {
  categoryApi,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "@/hooks/api";
import { useState } from "react";

interface MutationState {
  isLoading: boolean;
  error: string | null;
}

interface UseCategoryMutationReturn {
  createCategory: (payload: CreateCategoryPayload) => Promise<boolean>;
  updateCategory: (payload: UpdateCategoryPayload) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  state: MutationState;
}

export function useCategoryMutation(
  onSuccess?: () => void,
): UseCategoryMutationReturn {
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

  return {
    createCategory: (payload) => run(() => categoryApi.create(payload)),
    updateCategory: (payload) => run(() => categoryApi.update(payload)),
    deleteCategory: (id) => run(() => categoryApi.delete(id)),
    state,
  };
}
