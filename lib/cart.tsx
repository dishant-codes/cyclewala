"use client";

/* Client-side cart — there's no payment gateway or checkout on this site,
   so "cart" here means a list of cycles someone's interested in. It's
   real and functional (persisted in localStorage, badge count updates,
   items can be removed) — it just ends in a call/WhatsApp message with
   the list attached, not a completed online purchase. */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  slug: string;
  brand: string;
  model: string;
  image: string;
  price: number | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  cartCount: number;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartContext = createContext<CartCtx | null>(null);

const KEY = "cw_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount (avoids an SSR mismatch)
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* corrupt or blocked storage — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* private mode — the cart just won't persist */
    }
  }, [items, hydrated]);

  const addToCart: CartCtx["addToCart"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.slug === item.slug);
      if (existing) {
        return prev.map((p) => (p.slug === item.slug ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setOpen(true);
  };

  const removeFromCart = (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug));
  const setQty = (slug: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((p) => p.slug !== slug) : prev.map((p) => (p.slug === slug ? { ...p, qty } : p))));
  const clearCart = () => setItems([]);

  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, cartCount, addToCart, removeFromCart, setQty, clearCart, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
