import { request } from "@/lib/request";
import type { Order } from "@/types/order";

export interface BankInfo {
  bankId: string;
  accountNumber: string;
  accountName: string;
  displayName: string;
  branch?: string;
}

export interface PaymentInfo {
  order: {
    _id: string;
    orderCode: string;
    totalAmount: number;
    paymentStatus: "unpaid" | "paid";
    status: string;
  };
  bank: BankInfo;
  qrUrl: string;
}

export interface PaymentOrder extends Order {
  user?: { name: string; email: string; phone?: string };
}

export interface PaymentsResponse {
  orders: PaymentOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const paymentApi = {
  // Khách hàng
  getPaymentInfo: (orderId: string) =>
    request<PaymentInfo>(`/api/payment/info/${orderId}`),

  // Admin
  adminGetPending: (params?: { page?: number; search?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request<PaymentsResponse>(
      `/api/payment/admin/pending${qs ? `?${qs}` : ""}`,
    );
  },

  adminGetAll: (params?: {
    page?: number;
    paymentStatus?: "unpaid" | "paid" | "";
    search?: string;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return request<PaymentsResponse>(
      `/api/payment/admin/all${qs ? `?${qs}` : ""}`,
    );
  },

  adminConfirm: (orderId: string) =>
    request<Order>(`/api/payment/admin/${orderId}/confirm`, {
      method: "PATCH",
    }),

  adminReject: (orderId: string, reason?: string) =>
    request<Order>(`/api/payment/admin/${orderId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  adminGetBankConfig: () => request<BankInfo>("/api/payment/admin/bank-config"),
};
