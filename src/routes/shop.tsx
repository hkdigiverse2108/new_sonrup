import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Container, EmptyState, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, ProductCard, Reveal } from "@/components/site/Primitives";
import { goals, products } from "@/lib/products";
import { cn } from "@/lib/utils";

type ShopSearch = { q: string; goal: string; sort: string; max: number };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "bestsellers", label: "Best Sellers" },
  { value: "new", label: "New Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Partial<ShopSearch>): ShopSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    goal: typeof search.goal === "string" ? search.goal : "",
    sort: typeof search.sort === "string" ? search.sort : "featured",
    max: Number(search.max) > 0 ? Number(search.max) : 1500,
  }),
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

export function useShopFilters(search: ShopSearch) {
  return useMemo(() => {
    let list = products.filter((p) => p.price <= search.max);
    if (search.goal) list = list.filter((p) => p.goals.includes(search.goal));
    if (search.q.trim()) {
      const q = search.q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.tagline, p.description, p.flavour, ...p.categories, ...p.benefits]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    const sorted = [...list];
    if (search.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (search.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (search.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (search.sort === "bestsellers")
      sorted.sort((a, b) => Number(b.badges.includes("Best Seller")) - Number(a.badges.includes("Best Seller")) || b.reviews - a.reviews);
    if (search.sort === "new")
      sorted.sort((a, b) => Number(b.badges.includes("New Arrival")) - Number(a.badges.includes("New Arrival")));
    return sorted;
  }, [search]);
}

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const results = useShopFilters(search);

  const set = (patch: Partial<ShopSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });

  const active = Boolean(search.q || search.goal || search.max !== 1500 || search.sort !== "featured");

  return (
    <main>
      <PageHero
        eyebrow="The full range"
        title={<>Shop every<br />gummy</>}
        sub="Clean actives, real fruit flavours, and doses printed in plain numbers. Filter by what you're actually trying to fix."
      />

      <Container className="py-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters */}
          <aside
            className={cn(
              "lg:w-72 lg:shrink-0",
              filtersOpen
                ? "fixed inset-0 z-70 overflow-y-auto bg-background p-6 lg:static lg:z-auto lg:overflow-visible lg:bg-transparent lg:p-0"
                : "hidden lg:block",
            )}
          >
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <h2 className="font-display text-xl font-extrabold">Filters</h2>
              <button aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8">
              <FilterBlock title="Search">
                <input
                  value={search.q}
                  onChange={(e) => set({ q: e.target.value })}
                  placeholder="Search gummies…"
                  className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </FilterBlock>

              <FilterBlock title="Goal">
                <div className="flex flex-wrap gap-2">
                  <Chip active={!search.goal} onClick={() => set({ goal: "" })}>
                    All
                  </Chip>
                  {goals.map((g) => (
                    <Chip key={g} active={search.goal === g} onClick={() => set({ goal: search.goal === g ? "" : g })}>
                      {g}
                    </Chip>
                  ))}
                </div>
              </FilterBlock>

              <FilterBlock title={`Max price: ₹${search.max}`}>
                <input
                  type="range"
                  min={299}
                  max={1500}
                  step={50}
                  value={search.max}
                  onChange={(e) => set({ max: Number(e.target.value) })}
                  className="w-full accent-[var(--secondary)]"
                />
              </FilterBlock>

              {active && (
                <BrandButton variant="outline" size="sm" onClick={() => navigate({ to: ".", search: { q: "", goal: "", sort: "featured", max: 1500 } })}>
                  Clear all filters
                </BrandButton>
              )}
            </div>

            {filtersOpen && (
              <BrandButton className="mt-8 w-full lg:hidden" onClick={() => setFiltersOpen(false)}>
                Show {results.length} products
              </BrandButton>
            )}
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{results.length}</span> product{results.length === 1 ? "" : "s"}
              </p>
              <div className="flex items-center gap-2">
                <BrandButton variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </BrandButton>
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
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal className="h-8 w-8" />}
                title="No gummies match that"
                body="Try loosening a filter or clearing your search — our range is small and mighty."
                action={
                  <BrandButton onClick={() => navigate({ to: ".", search: { q: "", goal: "", sort: "featured", max: 1500 } })}>
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
