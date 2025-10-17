import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const STORAGE_KEY = 'cart_items_v1';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(product.quantity, next[idx].quantity + quantity) };
        return next;
      }
      return [...prev, { product, quantity: Math.min(product.quantity, quantity) }];
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId));
  const updateQty = (productId, quantity) => setItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity } : i));
  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    const amount = items.reduce((acc, i) => acc + Number(i.product.price) * i.quantity, 0);
    return { count, amount };
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    totals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
