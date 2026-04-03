export interface ShippingAddress {
  label?: string;
  name: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}

export type PaymentMethod = "COD" | "online";
export type Step = "address" | "review";
