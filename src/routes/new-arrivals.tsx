import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, ProductCard, Reveal } from "@/components/site/Primitives";
import { flavours, products } from "@/lib/products";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — Sonrup Nutrition" },
      { name: "description", content: "The newest Sonrup gummies and the flavours rolling out next, from mixed fruit kids' vitamins to watermelon." },
      { property: "og:title", content: "New Arrivals — Sonrup Nutrition" },
      { property: "og:description", content: "The newest Sonrup gummies and the flavours rolling out next." },
    ],
  }),
  component: NewArrivals,
  errorComponent: RouteError,
});

function NewArrivals() {
  const fresh = products.filter((p) => p.badges.includes("New Arrival"));
  const list = fresh.length ? fresh : products;

  return (
    <main>
      <PageHero
        eyebrow="Just landed"
        title={<>New<br />arrivals</>}
        sub="Freshly formulated, freshly tested, freshly on the shelf."
      />
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} className="h-full" />
            </Reveal>
          ))}
        </div>

        <div className="mt-20 surface-card overflow-hidden p-8 sm:p-12">
          <h2 className="display-xl text-3xl sm:text-4xl">Coming soon</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Flavours currently in the tasting room. Join the Gummy Club in the footer to hear first.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {flavours.map((f) => (
              <div key={f.name} className="rounded-2xl border border-border/70 bg-muted/40 p-5">
                <p className="font-display text-lg font-extrabold">{f.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
              </div>
            ))}
          </div>
          <Link to="/shop" className="mt-8 inline-block">
            <BrandButton variant="gold">Shop what's in stock</BrandButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}
