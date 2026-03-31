import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

interface AddButtonProps {
  size?: "sm" | "md";
  product: Product;
}

export function AddButton({ size = "md", product }: AddButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || added) return;

    await addToCart(product._id, 1);

    // Flash "đã thêm" feedback
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const iconSize = size === "sm" ? 13 : 15;

  return (
    <Button
      disabled={outOfStock}
      onClick={handleAddToCart}
      title={outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
      className={`flex ${dim} shrink-0 items-center justify-center  transition-all disabled:opacity-40 ${
        added
          ? "bg-primary  scale-95"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {added ? (
        <Check size={iconSize} strokeWidth={2.5} />
      ) : (
        <Plus size={iconSize} />
      )}
    </Button>
  );
}
