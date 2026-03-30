export interface CartItem {
  product: {
    _id: string;
    name: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    unit: string;
    stock: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_CART";
      payload: { items: CartItem[]; totalItems: number; totalPrice: number };
    }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR" };
