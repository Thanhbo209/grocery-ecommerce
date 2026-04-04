import { request } from "@/lib/request";
import type { PaymentMethod, ShippingAddress } from "@/types/check-out";
import type { Order, OrderStatus } from "@/types/order";

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  getMyOrders: (params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus | "";
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request<OrdersResponse>(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string) => request<Order>(`/api/orders/${id}`),

  cancelOrder: (id: string) =>
    request<Order>(`/api/orders/${id}/cancel`, { method: "PATCH" }),

  createOrder: (body: {
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
    note?: string;
  }) =>
    request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
