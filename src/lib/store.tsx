import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartLine = { slug: string; qty: number };

type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  lines: { product: Product; qty: number }[];
  subtotal: number;
  count: number;
};

const StoreContext = createContext<StoreValue | null>(null);

const KEY = "sonrup-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCart(parsed.cart ?? []);
        setWishlist(parsed.wishlist ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ cart, wishlist }));
    } catch {
      /* ignore */
    }
  }, [cart, wishlist]);

  const add = useCallback((slug: string, qty = 1) => {
    setCart((c) => {
      const found = c.find((l) => l.slug === slug);
      if (found) return c.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      return [...c, { slug, qty }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.slug !== slug) : c.map((l) => (l.slug === slug ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((slug: string) => setCart((c) => c.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setCart([]), []);
  const toggleWish = useCallback(
    (slug: string) => setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug])),
    [],
  );

  const lines = useMemo(
    () =>
      cart
        .map((l) => ({ product: products.find((p) => p.slug === l.slug)!, qty: l.qty }))
        .filter((l) => Boolean(l.product)),
    [cart],
  );

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.product.price * l.qty, 0), [lines]);
  const count = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);

  const value: StoreValue = {
    cart,
    wishlist,
    cartOpen,
    setCartOpen,
    add,
    setQty,
    remove,
    clear,
    toggleWish,
    lines,
    subtotal,
    count,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
