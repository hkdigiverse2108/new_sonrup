import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Container, EmptyState, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, ProductCard, Reveal } from "@/components/site/Primitives";
import { Product } from "@/lib/products";
import { useProducts, useIntegrationsSettings } from "@/lib/api";
import { cn } from "@/lib/utils";

const shopSearchSchema = z.object({
  q: z.string().default(""),
  sort: z.string().default("featured"),
  max: z.preprocess((v) => (Number(v) > 0 ? Number(v) : 99999), z.number()).default(99999),
  badge: z.string().default(""),
});

type ShopSearch = z.infer<typeof shopSearchSchema>;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Best Sellers" },
  { value: "new", label: "New Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export const Route = createFileRoute("/shop")({
  validateSearch: shopSearchSchema,
  head: () => ({
    meta: [
      { title: "Shop All Gummies — Sonrup Nutrition" },
      { name: "description", content: "Browse every Sonrup gummy: multivitamin, shilajit and kids' immunity. Filter by goal, price and rating." },
      { property: "og:title", content: "Shop All Gummies — Sonrup Nutrition" },
      { property: "og:description", content: "Browse every Sonrup gummy. Filter by goal, price and rating." },
    ],
  }),
  component: ShopPage,
  errorComponent: RouteError,
});

export function normalizeBadge(b: string): string {
  if (b === "Best Sellers" || b === "Best Seller") return "Best Seller";
  if (b === "New Arrivals" || b === "New Arrival") return "New Arrival";
  return b;
}

export function useShopFilters(search: ShopSearch, products: Product[], maxPriceLimit: number) {
  return useMemo(() => {
    const limit = search.max === 99999 ? maxPriceLimit : search.max;
    let list = products.filter((p) => p.price <= limit);
    if (search.badge) {
      list = list.filter((p) =>
        (p.badges || []).map(normalizeBadge).includes(normalizeBadge(search.badge))
      );
    }
    if (search.sort === "bestsellers") {
      list = list.filter((p) =>
        (p.badges || []).map(normalizeBadge).includes("Best Seller")
      );
    }
    if (search.sort === "new") {
      list = list.filter((p) =>
        (p.badges || []).map(normalizeBadge).includes("New Arrival")
      );
    }
    if (search.q.trim()) {
      const q = search.q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.tagline, p.description, ...p.categories, ...p.benefits]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    const sorted = [...list];
    if (search.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (search.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (search.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (search.sort === "bestsellers") {
      sorted.sort((a, b) => b.reviews - a.reviews);
    }
    return sorted;
  }, [search, products, maxPriceLimit]);
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: settings } = useIntegrationsSettings();
  const maxPriceLimit = settings?.max_filter_price ?? 1500;
  
  const results = useShopFilters(search, products, maxPriceLimit);

  const set = (patch: Partial<ShopSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });

  const active = Boolean(search.q || search.badge || (search.max !== 99999 && search.max !== maxPriceLimit) || search.sort !== "featured");

  return (
    <main>
      <PageHero
        eyebrow="The full range"
        title={<>Shop every<br />gummy</>}
        sub="Clean actives, real fruit flavours, and doses printed in plain numbers. Filter by what you're actually trying to fix."
      />

      {isLoadingProducts ? (
        <Container className="py-24 text-center">Loading gummies...</Container>
      ) : (
      <Container className="py-12 lg:py-16">
        <div className="flex flex-col gap-8">
          {/* Results */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{results.length}</span> product{results.length === 1 ? "" : "s"}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Max Price Filter moved here */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    Max: ₹{search.max === 99999 ? maxPriceLimit : search.max}
                  </span>
                  <input
                    type="range"
                    min={299}
                    max={maxPriceLimit}
                    step={50}
                    value={search.max === 99999 ? maxPriceLimit : search.max}
                    onChange={(e) => set({ max: Number(e.target.value) })}
                    className="w-32 accent-[var(--secondary)] sm:w-48"
                  />
                </div>

                <select
                  aria-label="Sort products"
                  value={search.sort}
                  onChange={(e) => set({ sort: e.target.value })}
                  className="rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] outline-none focus:border-primary"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {active && (
                  <button 
                    onClick={() => navigate({ to: ".", search: { q: "", sort: "featured", max: 99999, badge: "" } })}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal className="h-8 w-8" />}
                title="No gummies match that"
                body="Try loosening a filter or clearing your search — our range is small and mighty."
                action={
                  <BrandButton onClick={() => navigate({ to: ".", search: { q: "", sort: "featured", max: 99999, badge: "" } })}>
                    Clear filters
                  </BrandButton>
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 70}>
                    <ProductCard product={p} className="h-full" />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
      )}
    </main>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
        active ? "border-transparent bg-ink text-cream" : "border-border bg-card hover:border-ink/40",
      )}
    >
      {children}
    </button>
  );
}
