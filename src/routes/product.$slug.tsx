import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container, Crumbs, NotFoundBlock, RouteError } from "@/components/site/Page";
import { Badge, BrandButton, Price, ProductCard, QtyStepper, Rating, Reveal, SectionTitle } from "@/components/site/Primitives";
import { getProduct, inr, products, reviewsList } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — Sonrup" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Sonrup Nutrition` },
        { name: "description", content: p.description.slice(0, 155) },
        { property: "og:title", content: `${p.name} — Sonrup Nutrition` },
        { property: "og:description", content: p.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
  errorComponent: RouteError,
  notFoundComponent: () => (
    <NotFoundBlock title="That gummy doesn't exist" body="It may have sold out or been renamed. Have a look at the full range." />
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, wishlist, toggleWish, setCartOpen } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const gallery = [product.image, product.image, product.image];
  const wished = wishlist.includes(product.slug);
  const related = products.filter((p) => p.slug !== product.slug);
  const reviews = reviewsList.filter((r) => product.name.toLowerCase().includes(r.product.toLowerCase().split(" ")[0]!.toLowerCase())).length
    ? reviewsList.filter((r) => product.name.toLowerCase().includes(r.product.toLowerCase().split(" ")[0]!.toLowerCase()))
    : reviewsList.slice(0, 3);

  const bundle = related.slice(0, 2);
  const bundleTotal = [product, ...bundle].reduce((s, p) => s + p.price, 0);

  return (
    <main>
      <Container className="pt-8">
        <Crumbs items={[{ label: "Shop", to: "/shop" }, { label: product.name }]} />
      </Container>

      <Container className="grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            className="surface-card relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-50" />
            <div className="absolute left-5 top-5 z-10 flex flex-col gap-2">
              {product.badges.map((b) => (
                <Badge key={b} token={product.flavourToken}>
                  {b}
                </Badge>
              ))}
            </div>
            <img
              src={gallery[activeImg]}
              alt={product.name}
              width={1024}
              height={1280}
              className={cn(
                "relative aspect-4/5 w-full object-cover transition-transform duration-700 ease-out",
                zoom && "scale-[1.15]",
              )}
            />
          </div>
          <div className="mt-4 flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "h-20 w-16 overflow-hidden rounded-xl border-2 transition-all",
                  activeImg === i ? "border-secondary" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={g} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {product.categories.join(" · ")}
          </p>
          <h1 className="display-xl mt-3 text-4xl leading-[0.95] sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviews} size={16} />
            <a href="#reviews" className="text-xs font-bold uppercase tracking-[0.14em] underline-offset-4 hover:underline">
              Read reviews
            </a>
          </div>

          <div className="mt-6">
            <Price price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · {product.count}</p>
          </div>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Spec label="Flavour" value={product.flavour} />
            <Spec label="Pack size" value={product.count} />
            <Spec label="Format" value="Pectin gummy" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, n))} />
            <BrandButton
              size="lg"
              className="flex-1 min-w-[180px]"
              onClick={() => {
                add(product.slug, qty);
                toast.success(`${product.name} added to bag`);
              }}
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </BrandButton>
            <BrandButton
              variant="gold"
              size="lg"
              className="flex-1 min-w-[180px]"
              onClick={() => {
                add(product.slug, qty);
                setCartOpen(false);
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </BrandButton>
            <button
              aria-label="Add to wishlist"
              onClick={() => {
                toggleWish(product.slug);
                toast(wished ? "Removed from wishlist" : "Saved to wishlist");
              }}
              className="grid h-12 w-12 place-items-center rounded-full border border-border transition-transform hover:scale-105"
            >
              <Heart className={cn("h-5 w-5", wished ? "fill-secondary text-secondary" : "text-muted-foreground")} />
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Trust icon={<Truck className="h-4 w-4" />} text="Free shipping above ₹499" />
            <Trust icon={<ShieldCheck className="h-4 w-4" />} text="Lab tested every batch" />
            <Trust icon={<Undo2 className="h-4 w-4" />} text="7-day easy returns" />
          </div>

          <Accordion type="single" collapsible className="mt-10" defaultValue="benefits">
            <Acc value="benefits" title="Benefits">
              <ul className="space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Plus className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {b}
                  </li>
                ))}
              </ul>
            </Acc>
            <Acc value="ingredients" title="Ingredients">
              <ul className="space-y-3">
                {product.ingredients.map((i) => (
                  <li key={i.name}>
                    <span className="font-bold text-foreground">{i.name}</span> — {i.note}
                  </li>
                ))}
              </ul>
            </Acc>
            <Acc value="nutrition" title="Nutritional information">
              <dl className="divide-y divide-border">
                {product.nutrition.map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-2">
                    <dt>{n.label}</dt>
                    <dd className="font-bold text-foreground">{n.value}</dd>
                  </div>
                ))}
              </dl>
            </Acc>
            <Acc value="how" title="How to use">
              {product.howToUse}
            </Acc>
            <Acc value="storage" title="Storage">
              {product.storage}
            </Acc>
            <Acc value="shipping" title="Shipping">
              Dispatched within 24 working hours. Metro cities in 2-3 days, rest of India in 4-6 days. Free above ₹499.
            </Acc>
            <Acc value="returns" title="Returns">
              Unopened tubes can be returned within 7 days of delivery. Refunds are processed within 5-7 working days.
            </Acc>
          </Accordion>
        </div>
      </Container>

      {/* Frequently bought together */}
      <Container className="py-10">
        <div className="surface-card p-6 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">Frequently bought together</h2>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              {[product, ...bundle].map((p, i) => (
                <div key={p.slug} className="flex items-center gap-4">
                  {i > 0 && <span className="font-display text-2xl text-muted-foreground">+</span>}
                  <div className="w-28">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-32 w-28 rounded-xl object-cover" />
                    <p className="mt-2 text-xs font-bold leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{inr(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:w-64">
              <p className="text-sm text-muted-foreground">Bundle total</p>
              <p className="font-display text-3xl font-extrabold">{inr(bundleTotal)}</p>
              <BrandButton
                className="mt-4 w-full"
                onClick={() => {
                  [product, ...bundle].forEach((p) => add(p.slug, 1));
                  toast.success("Bundle added to bag");
                }}
              >
                Add all three
              </BrandButton>
            </div>
          </div>
        </div>
      </Container>

      {/* Reviews */}
      <Container id="reviews" className="py-14">
        <SectionTitle eyebrow="Verified reviews" title="What customers say" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <div className="surface-card h-full p-6">
                <Rating value={r.rating} />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
                <div className="mt-5 flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-xs font-extrabold text-ink">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-leaf">Verified purchase · {r.city}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* Related */}
      <Container className="pb-20">
        <SectionTitle eyebrow="You may also like" title="Complete the routine" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {related.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} className="h-full" />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/shop">
            <BrandButton variant="outline">View all gummies</BrandButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2.5 text-xs font-semibold">
      <span className="text-secondary">{icon}</span>
      {text}
    </div>
  );
}

function Acc({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="font-display text-base font-extrabold uppercase tracking-tight">{title}</AccordionTrigger>
      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{children}</AccordionContent>
    </AccordionItem>
  );
}

export { Minus };
