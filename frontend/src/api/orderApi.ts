import { request } from "@/lib/request";

export const orderApi = {
  createOrder: (body: {
    shippingAddress: {
      name: string;
      phone: string;
      street: string;
      district?: string;
      city: string;
    };
    paymentMethod: "COD" | "online";
    note?: string;
  }) => request("/api/orders", { method: "POST", body: JSON.stringify(body) }),

  getMyOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  getOrderById: (id: string) => request(`/api/orders/${id}`),

  cancelOrder: (id: string) =>
    request(`/api/orders/${id}/cancel`, { method: "PATCH" }),
};
