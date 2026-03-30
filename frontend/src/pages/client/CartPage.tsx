import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

import { CartSkeleton } from "@/components/client/cart/CartSkeleton";
import { OrderSummary } from "@/components/client/cart/CartSummary";
import { CartItemRow } from "@/components/client/cart/CartItem";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading, updateQuantity, removeItem } =
    useCart();

  // Track which productId is currently being mutated
  const handleUpdate = async (productId: string, qty: number) => {
    await updateQuantity(productId, qty);
  };

  const handleRemove = async (productId: string) => {
    await removeItem(productId);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <ShoppingCart size={22} className="text-primary" />
        <h1 className="text-xl font-bold">
          Giỏ hàng
          {totalItems > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({totalItems} sản phẩm)
            </span>
          )}
        </h1>
      </div>

      {loading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingCart size={36} className="text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Hãy thêm sản phẩm vào giỏ hàng để tiến hành đặt hàng
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Tiếp tục mua sắm
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: items list */}
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemRow
                key={item.product._id}
                item={item}
                onUpdate={(qty) => handleUpdate(item.product._id, qty)}
                onRemove={() => handleRemove(item.product._id)}
                updating={loading}
              />
            ))}
          </div>

          {/* Right: summary */}
          <OrderSummary
            totalPrice={totalPrice}
            totalItems={totalItems}
            onCheckout={() => navigate("/checkout")}
          />
        </div>
      )}
    </div>
  );
}
