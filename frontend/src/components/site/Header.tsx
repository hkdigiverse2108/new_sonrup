import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useProducts } from "@/lib/api";

const NAV = [
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "FAQs", to: "/faq" },
  { label: "Contact", to: "/contact" },
] as const;

export function AnnouncementBar() {
  const items = [
    "FREE SHIPPING ON ORDERS ABOVE ₹499",
    "60 GUMMIES PER TUBE",
    "MADE WITH REAL FRUIT FLAVOURS",
    "VEGETARIAN · PECTIN BASED",
  ];
  return (
    <div className="overflow-hidden bg-ink py-2.5 text-cream">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-10">
            {items.map((t) => (
              <span key={t} className="text-[10px] font-bold uppercase tracking-[0.28em] text-cream/80">
                {t} <span className="ml-10 text-primary">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count, setCartOpen, wishlist } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();

  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.trim().toLowerCase();
    return products
      .filter((p) =>
        [p.name, p.tagline, p.description, p.flavour, ...p.categories, ...p.benefits, ...p.goals]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 4);
  }, [q, products]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBar />
      <div
        className={cn(
          "border-b border-transparent transition-all duration-500",
          scrolled
            ? "border-border/70 bg-background/80 py-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            : "bg-background py-3 lg:py-4",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 lg:px-10">
          <Link to="/" className="flex shrink-0 items-center gap-1">
            <span className="font-display text-2xl font-extrabold lowercase tracking-[-0.06em]">
              sonrup<span className="text-gradient-gold">.</span>
            </span>
          </Link>

          <nav className="order-3 flex w-full items-center justify-center gap-4 sm:gap-7 lg:order-2 lg:w-auto lg:flex-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...("search" in item ? { search: item.search as never } : {})}
                className="group relative text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/80 transition-colors hover:text-foreground sm:text-[12px]"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 rounded-full bg-[image:var(--gradient-gold)] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="order-2 ml-auto flex items-center gap-1 lg:order-3">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to={user ? "/account" : "/login"}
              aria-label="Account"
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-secondary" />
              )}
            </Link>
            <button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="mx-auto max-w-[1400px] px-5 pb-3 pt-3 lg:px-10 relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                navigate({ to: "/search", search: { q } });
              }}
              className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-[var(--shadow-soft)] relative z-50"
            >
              <button type="submit" aria-label="Submit search" className="shrink-0 outline-none">
                <Search className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
              </button>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search gummies, flavours, benefits…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setQ("");
                }}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            
            {/* Live Search Results Dropdown */}
            {q.trim() && searchResults.length > 0 && (
              <div className="absolute left-5 right-5 top-full mt-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-lift)] lg:left-10 lg:right-10">
                <div className="flex flex-col gap-1">
                  {searchResults.map((p) => (
                    <Link
                      key={p.slug}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => {
                        setSearchOpen(false);
                        setQ("");
                      }}
                      className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted"
                    >
                      <img src={p.image} alt={p.name} className="h-12 w-10 shrink-0 rounded-md object-cover" />
                      <div>
                        <p className="font-display text-sm font-extrabold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.tagline}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      navigate({ to: "/search", search: { q } });
                    }}
                    className="mt-2 w-full p-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted hover:text-primary rounded-xl"
                  >
                    View all results for "{q}"
                  </button>
                </div>
              </div>
            )}
            
            {q.trim() && searchResults.length === 0 && (
              <div className="absolute left-5 right-5 top-full mt-2 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] text-center lg:left-10 lg:right-10">
                 <p className="text-sm font-medium text-foreground">No matches found for "{q}"</p>
                 <p className="text-xs text-muted-foreground mt-1">Try searching for a benefit like "immunity" or "energy".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
