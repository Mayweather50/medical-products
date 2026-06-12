import { createContext, useContext, useEffect, useMemo, useState } from "react";

/* Корзина живёт в localStorage — переживает перезагрузку страницы.
   Храним сам товар (для отрисовки) и количество; на сервер при
   оформлении уходят только productId + quantity. */

const STORAGE_KEY = "medcor_cart";
const CartContext = createContext(null);

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw.filter((it) => it?.product?.id && it.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((sum, it) => sum + it.qty, 0);
    const total = items.reduce(
      (sum, it) => sum + (it.product.priceOnRequest ? 0 : (it.product.price || 0) * it.qty),
      0
    );
    const hasOnRequest = items.some((it) => it.product.priceOnRequest);

    return {
      items,
      count,
      total,
      hasOnRequest,
      add: (product, qty = 1) =>
        setItems((prev) => {
          const i = prev.findIndex((it) => it.product.id === product.id);
          if (i >= 0) {
            const next = prev.slice();
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return next;
          }
          return [...prev, { product, qty }];
        }),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty < 1
            ? prev.filter((it) => it.product.id !== productId)
            : prev.map((it) => (it.product.id === productId ? { ...it, qty } : it))
        ),
      remove: (productId) => setItems((prev) => prev.filter((it) => it.product.id !== productId)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Возвращает { items, count, total, hasOnRequest, add, setQty, remove, clear }. */
export const useCart = () => useContext(CartContext);
