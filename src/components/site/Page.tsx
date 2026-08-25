import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Primitives";

export function Container({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn("mx-auto w-full max-w-[1400px] px-5 lg:px-10", className)}>
      {children}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-muted/40">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 blob bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 blob bg-secondary/15 blur-3xl" />
      <Container className="relative py-14 sm:py-20">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="display-xl mt-5 text-4xl leading-[0.92] sm:text-6xl lg:text-7xl">{title}</h1>
        {sub ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{sub}</p> : null}
        {children}
      </Container>
    </section>
  );
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
      <Link to="/" className="transition-colors hover:text-foreground">
        Home
      </Link>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className="text-border">/</span>
          {i.to ? (
            <Link to={i.to} className="transition-colors hover:text-foreground">
              {i.label}
            </Link>
          ) : (
            <span className="text-foreground">{i.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-4 px-6 py-20 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <h3 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="aspect-4/5 w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RouteError({ error }: { error: Error }) {
  return (
    <Container className="py-24">
      <div className="surface-card mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="display-xl text-4xl">Something went sticky</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error.message || "This page failed to load."}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground"
        >
          Back home
        </Link>
      </div>
    </Container>
  );
}

export function NotFoundBlock({ title = "We couldn't find that", body = "The page you're looking for has moved or never existed." }) {
  return (
    <Container className="py-24">
      <div className="surface-card mx-auto max-w-lg px-6 py-16 text-center">
        <p className="display-xl text-6xl text-gradient-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-secondary-foreground"
          >
            Shop gummies
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-ink/25 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]"
          >
            Go home
          </Link>
        </div>
      </div>
    </Container>
  );
}
