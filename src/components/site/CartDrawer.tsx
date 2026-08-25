import { Link } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, inr } from "@/lib/products";
import { useStore } from "@/lib/store";
import { BrandButton, FreeShipBar, QtyStepper } from "./Primitives";

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, setQty, remove } = useStore();

  return (
    <div className={cn("fixed inset-0 z-70", cartOpen ? "pointer-events-auto" : "pointer-events-none")}>
      <div
        onClick={() => setCartOpen(false)}
        className={cn("absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-400", cartOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          cartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">Your Bag</h3>
          <button aria-label="Close cart" onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <FreeShipBar subtotal={subtotal} threshold={FREE_SHIPPING_THRESHOLD} />
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
          {lines.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-extrabold">Your bag is empty</p>
              <p className="max-w-xs text-sm text-muted-foreground">Sweeten it up with a tube or two of our most-loved gummies.</p>
              <Link to="/shop" onClick={() => setCartOpen(false)}>
                <BrandButton variant="gold">Shop Gummies</BrandButton>
              </Link>
            </div>
          )}

          {lines.map(({ product, qty }) => (
            <div key={product.slug} className="flex gap-4 rounded-2xl border border-border/70 bg-card p-3">
              <img src={product.image} alt={product.name} className="h-24 w-20 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    onClick={() => setCartOpen(false)}
                    className="text-sm font-bold leading-snug hover:text-secondary"
                  >
                    {product.name}
                  </Link>
                  <button onClick={() => remove(product.slug)} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{product.flavour}</p>
                <div className="mt-auto flex items-center justify-between">
                  <QtyStepper qty={qty} onChange={(n) => setQty(product.slug, n)} />
                  <span className="font-display text-base font-extrabold">{inr(product.price * qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="space-y-4 border-t border-border bg-card px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl font-extrabold">{inr(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={() => setCartOpen(false)} className="block">
              <BrandButton variant="solid" size="lg" className="w-full">
                Proceed to Checkout
              </BrandButton>
            </Link>
            <Link to="/cart" onClick={() => setCartOpen(false)} className="block text-center text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
