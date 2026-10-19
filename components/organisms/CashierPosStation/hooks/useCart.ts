import { useState, useMemo, useCallback } from "react";
import { CashierProductItem } from "@/lib/cashier/actions";
import { CartItem } from "../types";

export function useCart() {
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const cartItems = useMemo(() => Object.values(cart), [cart]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc, it) => acc + it.product.priceSell * it.qty,
        0
      ),
    [cartItems]
  );

  const handleAddToCart = useCallback((product: CashierProductItem) => {
    if (!product.isAvailable) return;
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = (existing?.qty || 0) + 1;
      return {
        ...prev,
        [product.id]: {
          product,
          qty: newQty,
        },
      };
    });
  }, []);

  const handleUpdateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          qty,
        },
      };
    });
  }, []);

  const handleClearCart = useCallback(() => {
    setCart({});
  }, []);

  return {
    cart,
    setCart,
    cartItems,
    cartCount,
    subtotal,
    handleAddToCart,
    handleUpdateQty,
    handleClearCart,
  };
}
