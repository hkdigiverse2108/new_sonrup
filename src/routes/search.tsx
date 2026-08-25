import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { Container, EmptyState, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Price, ProductCard, Rating, Reveal } from "@/components/site/Primitives";
import { posts, products } from "@/lib/products";

type S = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Partial<S>): S => ({ q: typeof search.q === "string" ? search.q : "" }),
  head: () => ({
    meta: [
      { title: "Search — Sonrup Nutrition" },
      { name: "description", content: "Search Sonrup gummies by name, flavour, benefit or ingredient." },
      { property: "og:title", content: "Search — Sonrup Nutrition" },
      { property: "og:description", content: "Search Sonrup gummies by name, flavour, benefit or ingredient." },
    ],
  }),
  component: SearchPage,
  errorComponent: RouteError,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = q.trim().toLowerCase();

  const matches = query
    ? products.filter((p) =>
        [p.name, p.tagline, p.description, p.flavour, ...p.categories, ...p.benefits, ...p.goals]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];

  const articles = query ? posts.filter((p) => (p.title + p.excerpt + p.category).toLowerCase().includes(query)) : [];

  return (
    <main>
      <PageHero eyebrow="Search" title="Find your gummy">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex max-w-xl items-center gap-3 rounded-full border border-border bg-card px-5 py-4 shadow-[var(--shadow-soft)]"
        >
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => navigate({ to: ".", search: { q: e.target.value } })}
            placeholder="Try 'biotin', 'energy' or 'kids'"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </PageHero>

      <Container className="py-12 lg:py-16">
        {!query ? (
          <>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">Popular right now</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} className="h-full" />
              ))}
            </div>
          </>
        ) : matches.length === 0 && articles.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-8 w-8" />}
            title={`No results for "${q}"`}
            body="We couldn't match that to a gummy or an article. Try a benefit like 'immunity', or browse the full range."
            action={
              <Link to="/shop">
                <BrandButton variant="gold">Browse all gummies</BrandButton>
              </Link>
            }
          />
        ) : (
          <div className="space-y-16">
            {matches.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
                  {matches.length} product{matches.length === 1 ? "" : "s"}
                </h2>
                <div className="mt-6 space-y-4">
                  {matches.map((p, i) => (
                    <Reveal key={p.slug} delay={i * 60}>
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        className="surface-card lift flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                      >
                        <img src={p.image} alt={p.name} loading="lazy" className="h-40 w-full rounded-xl object-cover sm:h-24 sm:w-20" />
                        <div className="flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            {p.categories.join(" · ")}
                          </p>
                          <p className="mt-1 font-display text-lg font-extrabold">{p.name}</p>
                          <p className="text-sm text-muted-foreground">{p.tagline}</p>
                          <div className="mt-2">
                            <Rating value={p.rating} count={p.reviews} />
                          </div>
                        </div>
                        <Price price={p.price} mrp={p.mrp} />
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">From the journal</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((a) => (
                    <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} className="surface-card lift p-6">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">{a.category}</p>
                      <p className="mt-2 font-display text-lg font-extrabold leading-tight">{a.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{a.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
