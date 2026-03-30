import { request } from "@/lib/request";

export const cartApi = {
  getCart: () => request("/api/cart"),
  addToCart: (body: { productId: string; quantity: number }) =>
    request("/api/cart", { method: "POST", body: JSON.stringify(body) }),
  updateItem: (productId: string, body: { quantity: number }) =>
    request(`/api/cart/${productId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  removeItem: (productId: string) =>
    request(`/api/cart/${productId}`, { method: "DELETE" }),
  clearCart: () => request("/api/cart", { method: "DELETE" }),
};
