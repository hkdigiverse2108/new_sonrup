import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { Container, EmptyState, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, ProductCard, Reveal } from "@/components/site/Primitives";
import { Product } from "@/lib/products";
import { useProducts, useIntegrationsSettings, productsQueryOptions } from "@/lib/api";
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
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(productsQueryOptions());
    return {};
  },
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
    const limit = search.max === 99999 ? Infinity : search.max;
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
  const loaderData = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { data: products = loaderData?.products || [] } = useProducts();
  const { data: settings } = useIntegrationsSettings();
  const maxPriceLimit = settings?.max_filter_price ?? 1500;
  
  const results = useShopFilters(search, products, maxPriceLimit);

  const set = (patch: Partial<ShopSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }), resetScroll: false });

  const [localMax, setLocalMax] = useState(search.max === 99999 ? maxPriceLimit : search.max);

  useEffect(() => {
    setLocalMax(search.max === 99999 ? maxPriceLimit : search.max);
  }, [search.max, maxPriceLimit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localMax !== (search.max === 99999 ? maxPriceLimit : search.max)) {
        set({ max: localMax });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localMax, search.max, maxPriceLimit]);

  const active = Boolean(search.q || search.badge || (search.max !== 99999 && search.max !== maxPriceLimit) || search.sort !== "featured");

  return (
    <main>
      <PageHero
        eyebrow="The full range"
        title={<>Shop every<br />gummy</>}
        sub="Clean actives, real fruit flavours, and doses printed in plain numbers. Filter by what you're actually trying to fix."
      />

      <Container className="py-12 lg:py-16">
        <div className="flex flex-col gap-8">
          {/* Top Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-border pb-6">
            <div className="flex-1 flex flex-wrap items-center gap-6">
              
              {/* Inline Sort By Filter */}
              <CustomSortSelect 
                value={search.sort} 
                onChange={(val) => set({ sort: val })} 
                options={SORTS} 
              />

              {/* Inline Max Price Filter */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/70">
                  Max: ₹{localMax}
                </span>
                <input
                  type="range"
                  min={299}
                  max={maxPriceLimit}
                  step={50}
                  value={localMax}
                  onChange={(e) => setLocalMax(Number(e.target.value))}
                  className="w-32 appearance-none h-1.5 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#da3e3a] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#da3e3a]"
                  style={{
                    background: `linear-gradient(to right, #da3e3a ${
                      (localMax - 299) / (maxPriceLimit - 299) * 100
                    }%, var(--border) ${
                      (localMax - 299) / (maxPriceLimit - 299) * 100
                    }%)`
                  }}
                />
              </div>
              
              {active && (
                <button 
                  onClick={() => navigate({ to: ".", search: { q: "", sort: "featured", max: 99999, badge: "" } })}
                  className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <X className="h-3.5 w-3.5" /> Clear all
                </button>
              )}
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-foreground">{results.length}</span> product{results.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">

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

function CustomSortSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-48" onMouseLeave={() => setIsOpen(false)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between border border-[#d49f3e] bg-card px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#0f2136] transition-all shadow-sm outline-none focus:ring-1 focus:ring-primary",
          isOpen ? "rounded-t-lg border-b-transparent" : "rounded-lg"
        )}
      >
        <span>{selected.label}</span>
        <svg className={cn("h-4 w-4 transition-transform text-[#0f2136]", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full overflow-hidden rounded-b-lg border border-t-0 border-[#d49f3e] bg-card shadow-lg">
          {options.map((s) => {
            const isSelected = value === s.value;
            return (
              <button
                key={s.value}
                onClick={() => {
                  onChange(s.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.1em] transition-colors",
                  isSelected ? "bg-[#d49f3e]/10 text-[#0f2136]" : "text-[#0f2136]/70 hover:bg-[#d49f3e]/10 hover:text-[#0f2136]"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
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
