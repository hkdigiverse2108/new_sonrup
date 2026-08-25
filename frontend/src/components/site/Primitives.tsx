import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { inr, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="display-xl mt-5 text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">{title}</h2>
      {sub ? <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{sub}</p> : null}
    </div>
  );
}

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              "shrink-0",
              i <= Math.round(value) ? "fill-primary text-primary" : "fill-transparent text-border",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-foreground">{value.toFixed(1)}</span>
      {count !== undefined ? <span className="text-xs text-muted-foreground">({count.toLocaleString("en-IN")})</span> : null}
    </div>
  );
}

export function Price({ price, mrp, size = "md" }: { price: number; mrp: number; size?: "md" | "lg" }) {
  const off = Math.round(((mrp - price) / mrp) * 100);
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn("font-display font-extrabold tracking-tight", size === "lg" ? "text-3xl" : "text-lg")}>
        {inr(price)}
      </span>
      <span className="text-sm text-muted-foreground line-through">{inr(mrp)}</span>
      <span className="rounded-full bg-secondary/12 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-secondary">
        {off}% off
      </span>
    </div>
  );
}

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.12em] transition-all duration-300 active:scale-[0.97] disabled:opacity-50";

export function BrandButton({
  variant = "solid",
  size = "md",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "gold" | "outline" | "ghost" | "ink";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        btnBase,
        size === "sm" && "px-4 py-2 text-[11px]",
        size === "md" && "px-6 py-3 text-xs",
        size === "lg" && "px-8 py-4 text-sm",
        variant === "solid" && "bg-secondary text-secondary-foreground shadow-[var(--shadow-soft)] hover:brightness-110 hover:shadow-[var(--shadow-lift)]",
        variant === "gold" && "bg-[image:var(--gradient-gold)] text-ink shadow-[var(--shadow-glow)] hover:brightness-105",
        variant === "ink" && "bg-ink text-cream hover:brightness-125",
        variant === "outline" && "border border-ink/25 bg-transparent text-foreground hover:border-ink hover:bg-ink hover:text-cream",
        variant === "ghost" && "text-foreground hover:bg-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function QtyStepper({
  qty,
  onChange,
  className,
}: {
  qty: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-card", className)}>
      <button
        aria-label="Decrease quantity"
        className="grid h-10 w-10 place-items-center rounded-full text-lg transition-colors hover:bg-muted"
        onClick={() => onChange(qty - 1)}
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-bold tabular-nums">{qty}</span>
      <button
        aria-label="Increase quantity"
        className="grid h-10 w-10 place-items-center rounded-full text-lg transition-colors hover:bg-muted"
        onClick={() => onChange(qty + 1)}
      >
        +
      </button>
    </div>
  );
}

const tone: Record<string, string> = {
  citrus: "bg-citrus/15 text-citrus",
  berry: "bg-berry/15 text-berry",
  grape: "bg-grape/12 text-grape",
  leaf: "bg-leaf/15 text-leaf",
  primary: "bg-primary/20 text-ink",
  ink: "bg-ink/10 text-ink",
};

export function Badge({ children, token = "primary" }: { children: ReactNode; token?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]",
        tone[token] ?? tone["primary"],
      )}
    >
      {children}
    </span>
  );
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.slug);

  return (
    <div className={cn("group surface-card lift relative flex flex-col overflow-hidden", className)}>
      <button
        aria-label="Add to wishlist"
        onClick={() => {
          toggleWish(product.slug);
          toast(wished ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-card/85 backdrop-blur transition-transform hover:scale-110"
      >
        <Heart className={cn("h-4 w-4", wished ? "fill-secondary text-secondary" : "text-muted-foreground")} />
      </button>

      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-60" />
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5">
          {product.badges.map((b) => (
            <Badge key={b} token={product.flavourToken}>
              {b}
            </Badge>
          ))}
        </div>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="relative aspect-4/5 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="font-display text-lg font-extrabold leading-tight tracking-tight hover:text-secondary"
          >
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
        </div>
        <Rating value={product.rating} count={product.reviews} />
        <Price price={product.price} mrp={product.mrp} />
        <BrandButton
          className="mt-auto w-full"
          onClick={() => {
            add(product.slug);
            toast.success(`${product.name} added to bag`);
          }}
        >
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </BrandButton>
      </div>
    </div>
  );
}

export function FreeShipBar({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div className="rounded-2xl bg-muted/70 p-4">
      <p className="text-xs font-semibold">
        {remaining > 0 ? (
          <>
            <span className="text-secondary">{inr(remaining)}</span> more for FREE SHIPPING
          </>
        ) : (
          <span className="text-leaf">You've unlocked free shipping</span>
        )}
      </p>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-gold)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
