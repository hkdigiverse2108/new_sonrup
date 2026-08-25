import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Container, EmptyState, RouteError } from "@/components/site/Page";
import { BrandButton, Eyebrow, Price, Rating, Reveal } from "@/components/site/Primitives";
import { inr, products } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Sonrup Nutrition" },
      { name: "description", content: "Every Sonrup gummy you've saved for later, ready to move into your bag in one tap." },
      { property: "og:title", content: "My Wishlist — Sonrup Nutrition" },
      { property: "og:description", content: "Your saved Sonrup gummies, ready when you are." },
    ],
  }),
  component: WishlistPage,
  errorComponent: RouteError,
});

function WishlistPage() {
  const { wishlist, toggleWish, add } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.slug));
  const total = saved.reduce((s, p) => s + p.price, 0);

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="aurora pointer-events-none absolute -left-24 -top-40 h-[500px] w-[500px] blob bg-secondary/25 blur-[110px]" />
        <div className="aurora pointer-events-none absolute -right-20 bottom-[-8rem] h-[380px] w-[380px] blob bg-primary/25 blur-[110px] [animation-delay:-5s]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.12]" />
        <Container className="relative py-14 lg:py-20">
          <div className="mask-rise">
            <Eyebrow className="border-cream/15 bg-cream/[0.06] text-cream/70">
              <Heart className="h-3.5 w-3.5 text-secondary" /> {saved.length} saved
            </Eyebrow>
          </div>
          <h1 className="mask-rise mt-7 font-display text-[clamp(2.4rem,7vw,4.4rem)] font-extrabold leading-[0.92] tracking-[-0.045em] [--d:120ms]">
            The ones you keep <span className="text-gradient-gold">coming back to.</span>
          </h1>
          {saved.length > 0 && (
            <p className="mask-rise mt-5 text-sm text-cream/60 [--d:240ms]">
              Wishlist value {inr(total)} · free shipping applies over {inr(499)}
            </p>
          )}
        </Container>
      </section>

      <Container className="py-14 lg:py-20">
        {saved.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-8 w-8" />}
            title="Your wishlist is empty"
            body="Tap the heart on any gummy and it will wait for you right here."
            action={
              <Link to="/shop" search={{ q: "", goal: "", sort: "featured", max: 1500 }}>
                <BrandButton variant="solid">
                  <Sparkles className="h-4 w-4" /> Browse gummies
                </BrandButton>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              {saved.map((p, i) => (
                <Reveal key={p.slug} delay={i * 90}>
                  <article className="group surface-card lift relative flex gap-5 overflow-hidden p-5">
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      className="relative shrink-0 overflow-hidden rounded-2xl"
                    >
                      <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-60" />
                      <img
                        src={p.image}
                        alt={p.name}
                        className="relative h-40 w-32 object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        className="font-display text-xl font-extrabold leading-tight tracking-[-0.03em] transition-colors hover:text-secondary"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{p.tagline}</p>
                      <div className="mt-3">
                        <Rating value={p.rating} count={p.reviews} />
                      </div>
                      <div className="mt-3">
                        <Price price={p.price} mrp={p.mrp} />
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                        <BrandButton
                          variant="solid"
                          size="sm"
                          onClick={() => {
                            add(p.slug);
                            toast.success(`${p.name} added to bag`);
                          }}
                        >
                          <ShoppingBag className="h-4 w-4" /> Move to bag
                        </BrandButton>
                        <button
                          onClick={() => {
                            toggleWish(p.slug);
                            toast("Removed from wishlist");
                          }}
                          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-14 flex flex-wrap items-center gap-6 rounded-3xl bg-ink px-7 py-8 text-cream">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">Ready when you are</p>
                  <p className="mt-2 font-display text-2xl font-extrabold tracking-[-0.03em]">
                    Add all {saved.length} to your bag
                  </p>
                </div>
                <BrandButton
                  variant="gold"
                  size="lg"
                  className="ml-auto"
                  onClick={() => {
                    saved.forEach((p) => add(p.slug));
                    toast.success("Wishlist added to bag");
                  }}
                >
                  <ShoppingBag className="h-4 w-4" /> Add everything · {inr(total)}
                </BrandButton>
              </div>
            </Reveal>
          </>
        )}
      </Container>
    </main>
  );
}
