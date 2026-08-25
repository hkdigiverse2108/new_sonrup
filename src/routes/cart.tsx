import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Container, Crumbs, EmptyState, RouteError } from "@/components/site/Page";
import { BrandButton, FreeShipBar, QtyStepper } from "@/components/site/Primitives";
import { FREE_SHIPPING_THRESHOLD, inr } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Sonrup Gummies" },
      { name: "description", content: "Review your Sonrup gummy tubes before checkout. Free shipping above ₹499." },
      { property: "og:title", content: "Your Cart — Sonrup Gummies" },
      { property: "og:description", content: "Review your gummies and check out in a couple of taps." },
    ],
  }),
  errorComponent: RouteError,
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, subtotal } = useStore();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 59;

  return (
    <main>
      <Container className="py-10 sm:py-14">
        <Crumbs items={[{ label: "Cart" }]} />
        <h1 className="display-xl mt-6 text-4xl sm:text-6xl">Your cart</h1>

        {lines.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8" />}
              title="Your cart is empty"
              body="Add a tube or two — free shipping kicks in above ₹499."
              action={
                <Link to="/shop">
                  <BrandButton variant="solid">Shop gummies</BrandButton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div className="grid gap-4">
              <div className="surface-card p-5">
                <FreeShipBar subtotal={subtotal} threshold={FREE_SHIPPING_THRESHOLD} />
              </div>
              {lines.map(({ product, qty }) => (
                <div key={product.slug} className="surface-card flex gap-4 p-4 sm:gap-6 sm:p-5">
                  <Link to="/product/$slug" params={{ slug: product.slug }} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-28 w-24 rounded-2xl object-cover sm:h-32 sm:w-28"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="font-display text-lg font-extrabold leading-tight hover:text-secondary"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.flavour} · {product.count}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <QtyStepper qty={qty} onChange={(n) => setQty(product.slug, n)} />
                      <div className="flex items-center gap-4">
                        <span className="font-display text-lg font-extrabold">{inr(product.price * qty)}</span>
                        <button
                          aria-label={`Remove ${product.name}`}
                          onClick={() => remove(product.slug)}
                          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-card h-fit p-6 lg:sticky lg:top-32">
              <h2 className="font-display text-2xl font-extrabold">Order summary</h2>
              <dl className="mt-6 grid gap-3 text-sm">
                <Row label="Subtotal" value={inr(subtotal)} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
                <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
                  <dt className="font-display text-lg font-extrabold">Total</dt>
                  <dd className="font-display text-2xl font-extrabold">{inr(subtotal + shipping)}</dd>
                </div>
              </dl>
              <Link to="/checkout" className="mt-6 block">
                <BrandButton variant="solid" size="lg" className="w-full">
                  Proceed to checkout
                </BrandButton>
              </Link>
              <Link to="/shop" className="mt-3 block">
                <BrandButton variant="ghost" className="w-full">
                  Continue shopping
                </BrandButton>
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
