import { normalizeCategory } from "@/lib/helper";
import { request } from "@/lib/request";
import type { Category } from "@/types/category";

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {
  id: string;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const raw = await request<
      Category[] | { data?: Category[]; categories?: Category[] }
    >("/api/categories");
    const arr = Array.isArray(raw) ? raw : (raw.data ?? raw.categories ?? []);
    return arr
      .filter((c): c is Category => c !== null && c !== undefined)
      .map(normalizeCategory);
  },

  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    const raw = await request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeCategory(raw) as Category;
  },

  update: async ({
    id,
    ...payload
  }: UpdateCategoryPayload): Promise<Category> => {
    const raw = await request<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeCategory(raw) as Category;
  },

  delete: (id: string): Promise<void> =>
    request<void>(`/api/categories/${id}`, { method: "DELETE" }),

  // GET /api/categories/:slug — lấy 1 category theo slug
  getBySlug: async (slug: string): Promise<Category> => {
    const raw = await request<Category>(`/api/categories/${slug}`);
    return normalizeCategory(raw) as Category;
  },
};
