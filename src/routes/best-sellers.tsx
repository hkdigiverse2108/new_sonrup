import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { ProductCard, Reveal } from "@/components/site/Primitives";
import { products } from "@/lib/products";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers — Sonrup Nutrition" },
      { name: "description", content: "The Sonrup gummies our customers reorder most: biotin multivitamin, Himalayan shilajit and kids' immunity." },
      { property: "og:title", content: "Best Sellers — Sonrup Nutrition" },
      { property: "og:description", content: "The Sonrup gummies our customers reorder most." },
    ],
  }),
  component: BestSellers,
  errorComponent: RouteError,
});

function BestSellers() {
  const list = products
    .filter((p) => p.badges.includes("Best Seller"))
    .concat(products.filter((p) => !p.badges.includes("Best Seller")));

  return (
    <main>
      <PageHero
        eyebrow="Most reordered"
        title={<>Best<br />sellers</>}
        sub="Ranked by how often people come back for a second tube — the only ranking that means anything."
      />
      <Container className="py-12 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProductCard product={p} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </main>
  );
}
