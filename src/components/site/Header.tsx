import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

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
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count, setCartOpen, wishlist } = useStore();
  const navigate = useNavigate();

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
            : "bg-background py-4",
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 lg:px-10">
          <Link to="/" className="flex shrink-0 items-center gap-1">
            <span className="font-display text-2xl font-extrabold lowercase tracking-[-0.06em]">
              sonrup<span className="text-gradient-gold">.</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                {...("search" in item ? { search: item.search as never } : {})}
                className="group relative text-[12px] font-bold uppercase tracking-[0.16em] text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 rounded-full bg-[image:var(--gradient-gold)] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to="/login"
              aria-label="Account"
              className="hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted sm:grid"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted sm:grid"
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
            <button
              aria-label="Menu"
              onClick={() => setMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="mx-auto max-w-[1400px] px-5 pb-3 pt-3 lg:px-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                navigate({ to: "/search", search: { q } });
              }}
              className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-[var(--shadow-soft)]"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search gummies, flavours, benefits…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-60 lg:hidden",
          menu ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setMenu(false)}
          className={cn("absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-400", menu ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-background shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menu ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 px-6 py-4">
            <span className="truncate font-display text-xl font-extrabold lowercase tracking-[-0.06em]">
              sonrup<span className="text-gradient-gold">.</span>
            </span>
            <button
              aria-label="Close menu"
              onClick={() => setMenu(false)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/70 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <nav className="flex flex-col">
              {NAV.map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to}
                  {...("search" in item ? { search: item.search as never } : {})}
                  onClick={() => setMenu(false)}
                  className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/50 py-4 transition-colors hover:text-secondary"
                  style={{ animation: menu ? `rise-in 0.5s ${i * 60}ms both` : undefined }}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
                    0{i + 1}
                  </span>
                  <span className="display-xl truncate text-2xl">{item.label}</span>
                  <span className="text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { to: "/account", label: "Account", icon: User },
                { to: "/wishlist", label: "Wishlist", icon: Heart },
                { to: "/blog", label: "Journal", icon: Search },
              ].map(({ to, label, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setMenu(false)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card px-2 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-muted"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-border/60 px-6 py-5">
            <button
              onClick={() => {
                setMenu(false);
                setCartOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-secondary-foreground transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              View cart{count > 0 ? ` (${count})` : ""}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
