import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { CartAction, CartState } from "@/types/cart";
import { useAuth } from "@/hooks/useAuth";
import { cartApi } from "@/api/cartApi";

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CART":
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue extends CartState {
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Lấy token trực tiếp từ AuthContext — không cần đọc localStorage thủ công
  // Khi user login/logout, AuthContext cập nhật token → CartProvider tự re-run effect
  const { token, loading: authLoading } = useAuth();

  const fetchCart = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const res = await cartApi.getCart();
      console.log("fetchCart response:", res);
      dispatch({ type: "SET_CART", payload: res as CartState });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Không thể tải giỏ hàng" });
    }
  }, []);

  // Re-fetch khi token xuất hiện (login), clear khi token mất (logout)
  // authLoading guard: tránh fetch trước khi AuthProvider đọc xong localStorage
  useEffect(() => {
    if (authLoading) return;

    if (token) {
      fetchCart();
    } else {
      dispatch({ type: "CLEAR" });
    }
  }, [token, authLoading, fetchCart]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!token) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        return;
      }
      try {
        const res = await cartApi.addToCart({ productId, quantity });
        dispatch({ type: "SET_CART", payload: res as CartState });
        toast.success("Đã thêm vào giỏ hàng");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Không thể thêm vào giỏ hàng";
        toast.error(msg);
      }
    },
    [token],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      try {
        const res = await cartApi.updateItem(productId, { quantity });
        dispatch({ type: "SET_CART", payload: res as CartState });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Không thể cập nhật giỏ hàng";
        toast.error(msg);
      }
    },
    [],
  );

  const removeItem = useCallback(async (productId: string) => {
    try {
      const res = await cartApi.removeItem(productId);
      dispatch({ type: "SET_CART", payload: res as CartState });
      toast.success("Đã xóa sản phẩm");
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clearCart();
      dispatch({ type: "CLEAR" });
    } catch {
      toast.error("Không thể xóa giỏ hàng");
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng trong CartProvider");
  return ctx;
}
