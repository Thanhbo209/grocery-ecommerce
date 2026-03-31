import { request } from "@/lib/request";
import type { CartState } from "@/types/cart";

export const cartApi = {
  getCart: () => request<CartState>("/api/cart"),

  addToCart: (body: { productId: string; quantity: number }) =>
    request<CartState>("/api/cart", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateItem: (productId: string, body: { quantity: number }) =>
    request<CartState>(`/api/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  removeItem: (productId: string) =>
    request<CartState>(`/api/cart/${productId}`, { method: "DELETE" }),

  clearCart: () => request<void>("/api/cart", { method: "DELETE" }),
};
