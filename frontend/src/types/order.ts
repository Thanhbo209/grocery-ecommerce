import type { PaymentMethod, ShippingAddress } from "@/types/check-out";

export interface OrderItem {
  productId: string;
  name: string;
  thumbnail?: string;
  price: number;
  unit: string;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface Order {
  _id: string;
  orderCode: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  shippingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
