"use client";
import { createContext, useContext, useMemo, useState } from 'react';

type LineItem = { key: string; name: string; flavor?: string; qty: number; price: number };

type CartContext = {
  items: LineItem[];
  add: (item: LineItem) => void;
  remove: (idx: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LineItem[]>([]);
  const value = useMemo<CartContext>(() => ({
    items,
    add: (item) => setItems((prev) => [...prev, item]),
    remove: (idx) => setItems((prev) => prev.filter((_, i) => i !== idx)),
    clear: () => setItems([]),
  }), [items]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
