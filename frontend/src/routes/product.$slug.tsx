import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container, Crumbs, NotFoundBlock, RouteError } from "@/components/site/Page";
import { Badge, BrandButton, Price, ProductCard, QtyStepper, Rating, Reveal, SectionTitle } from "@/components/site/Primitives";
import { inr } from "@/lib/products";
import { useProducts, useProductReviews, fetchJson } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  shouldReload: true,
  loader: async ({ params }) => {
    try {
      const product = await fetchJson<any>(`/api/products/${params.slug}`);
      return { product };
    } catch (e) {
      throw notFound();
    }
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


function getTrustIcon(iconName: string) {
  switch (iconName) {
    case "Truck": return <Truck className="h-4 w-4" />;
    case "ShieldCheck": return <ShieldCheck className="h-4 w-4" />;
    case "Undo2": return <Undo2 className="h-4 w-4" />;
    case "Heart": return <Heart className="h-4 w-4" />;
    case "ShoppingBag": return <ShoppingBag className="h-4 w-4" />;
    default: return <ShieldCheck className="h-4 w-4" />;
  }
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, wishlist, toggleWish, setCartOpen } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const { data: allProducts = [] } = useProducts();
  const { data: productReviewsAll = [] } = useProductReviews();

  const gallery = Array.from(new Set([product.image, ...(product.gallery || [])].filter(Boolean)));
  const wished = wishlist.includes(product.slug);
  const related = (product.related_products && product.related_products.length > 0)
    ? allProducts.filter((p) => product.related_products!.includes(p.slug))
    : allProducts.filter((p) => p.slug !== product.slug).slice(0, 3);

  const productReviews = productReviewsAll.filter((r: any) => r.product_slug === product.slug);
  const reviewsCount = productReviews.length;
  const averageRating = reviewsCount > 0 
    ? (productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount).toFixed(1)
    : "5.0";



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
            <Rating value={parseFloat(averageRating)} count={reviewsCount} size={16} />
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
            <Spec label="Format" value={product.format || "Pectin Gummy"} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 w-full sm:w-auto animate-fade-in">
              <QtyStepper qty={qty} onChange={(n) => setQty(Math.max(1, n))} className="flex-1 sm:flex-initial" />
              <button
                aria-label="Add to wishlist"
                onClick={() => {
                  toggleWish(product.slug);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border transition-transform hover:scale-105"
              >
                <Heart className={cn("h-5 w-5", wished ? "fill-secondary text-secondary" : "text-muted-foreground")} />
              </button>
            </div>
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-1">
              <BrandButton
                size="lg"
                className="w-full sm:flex-1"
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
                className="w-full sm:flex-1"
                onClick={() => {
                  add(product.slug, qty);
                  setCartOpen(false);
                  navigate({ to: "/checkout" });
                }}
              >
                Buy Now
              </BrandButton>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {product.trust_badges && product.trust_badges.length > 0 ? (
              product.trust_badges.map((badge: any, i: number) => (
                <Trust key={i} icon={getTrustIcon(badge.icon)} text={badge.text} />
              ))
            ) : (
              <>
                <Trust icon={<Truck className="h-4 w-4" />} text="Free shipping above ₹499" />
                <Trust icon={<ShieldCheck className="h-4 w-4" />} text="Lab tested every batch" />
                <Trust icon={<Undo2 className="h-4 w-4" />} text="7-day easy returns" />
              </>
            )}
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
            {product.accordions && product.accordions.length > 0 ? (
              product.accordions.map((acc: any, i: number) => (
                <Acc key={i} value={`tab-${i}`} title={acc.title}>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{acc.content}</div>
                </Acc>
              ))
            ) : (
              <>
                <Acc value="how" title="How to use">
                  {product.howToUse}
                </Acc>
                <Acc value="storage" title="Storage">
                  {product.storage}
                </Acc>
                <Acc value="shipping" title="Shipping">
                  {product.shipping_info || "Dispatched within 24 working hours. Metro cities in 2-3 days, rest of India in 4-6 days. Free above ₹499."}
                </Acc>
                <Acc value="returns" title="Returns">
                  {product.returns_info || "Unopened tubes can be returned within 7 days of delivery. Refunds are processed within 5-7 working days."}
                </Acc>
              </>
            )}
          </Accordion>
        </div>
      </Container>



      {/* Reviews */}
      <Container id="reviews" className="py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <SectionTitle eyebrow="Verified reviews" title="What customers say" />
          {productReviews.length > 0 && (
            <div className="flex items-center gap-2 bg-[#faf9f6] px-4 py-2.5 rounded-2xl border border-[#e5e1dc] self-start md:self-auto shadow-sm">
              <Rating value={parseFloat(averageRating)} size={16} />
              <span className="text-sm font-bold text-[#3E332A]">{averageRating} out of 5</span>
              <span className="text-xs text-muted-foreground">({reviewsCount} reviews)</span>
            </div>
          )}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviewsCount > 0 ? (
            productReviews.map((r: any) => (
              <div key={r._id} className="surface-card flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="mb-4 flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-4 w-4 ${i < Math.floor(r.rating) ? "text-[#f59e0b]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-medium text-foreground">"{r.text}"</p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 font-bold text-secondary">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-none text-foreground">{r.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.city}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground surface-card">
              No reviews yet. Be the first to leave a review!
            </div>
          )}
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
