import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { Container, RouteError } from "@/components/site/Page";
import { BrandButton, Eyebrow, Reveal } from "@/components/site/Primitives";
import { posts } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "The Sonrup Journal — Wellness, Ingredients & Honest Science" },
      {
        name: "description",
        content:
          "Plain-language writing on gummies, actives and daily habits: what the research supports, what it doesn't, and how to build a routine that lasts.",
      },
      { property: "og:title", content: "The Sonrup Journal" },
      { property: "og:description", content: "Honest, plain-language writing on supplements, ingredients and daily habits." },
    ],
  }),
  component: JournalPage,
  errorComponent: RouteError,
});

const accentBg: Record<string, string> = {
  citrus: "bg-citrus/15",
  berry: "bg-berry/12",
  grape: "bg-grape/12",
  primary: "bg-primary/20",
  leaf: "bg-leaf/15",
};

const accentText: Record<string, string> = {
  citrus: "text-citrus",
  berry: "text-berry",
  grape: "text-grape",
  primary: "text-ink",
  leaf: "text-leaf",
};

function JournalPage() {
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  const [lead, ...rest] = list;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="aurora pointer-events-none absolute -left-28 -top-44 h-[560px] w-[560px] blob bg-primary/22 blur-[120px]" />
        <div className="aurora pointer-events-none absolute -right-24 bottom-[-10rem] h-[420px] w-[420px] blob bg-grape/25 blur-[120px] [animation-delay:-6s]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.12]" />
        <Container className="relative py-16 lg:py-24">
          <div className="mask-rise">
            <Eyebrow className="border-cream/15 bg-cream/[0.06] text-cream/70">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> The Journal
            </Eyebrow>
          </div>
          <h1 className="mask-rise mt-8 max-w-4xl font-display text-[clamp(2.6rem,8vw,5rem)] font-extrabold leading-[0.9] tracking-[-0.05em] [--d:120ms]">
            Straight answers about <span className="text-gradient-gold">what you swallow.</span>
          </h1>
          <p className="mask-rise mt-7 max-w-xl text-base leading-relaxed text-cream/60 sm:text-lg [--d:260ms]">
            No mysticism, no miracle claims. Just clear writing on ingredients, doses and the small habits that make a
            routine stick.
          </p>
        </Container>
      </section>

      <Container className="py-14 lg:py-20">
        {/* Filters */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] transition-all duration-400",
                cat === c
                  ? "border-ink bg-ink text-cream shadow-[var(--shadow-soft)]"
                  : "border-border text-muted-foreground hover:border-ink/40 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Lead story */}
        {lead && (
          <Reveal key={lead.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: lead.slug }}
              className="group mt-10 grid overflow-hidden rounded-[2.5rem] border border-border/70 bg-card shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] lg:grid-cols-[1.1fr_1fr]"
            >
              <div className={cn("relative flex min-h-64 items-end p-9", accentBg[lead.accent] ?? "bg-muted")}>
                <div className="spin-slow absolute -right-16 -top-16 h-56 w-56 blob bg-card/40" />
                <div className="relative">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-ink/60">
                    Featured · {lead.category}
                  </span>
                  <p className="mt-4 font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-ink/25">
                    {lead.read}
                  </p>
                </div>
              </div>
              <div className="p-9">
                <h2 className="font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] transition-colors group-hover:text-secondary sm:text-4xl">
                  {lead.title}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{lead.excerpt}</p>
                <div className="mt-7 flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{lead.date}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {lead.read}
                  </span>
                  <ArrowUpRight className="ml-auto h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Grid */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 90}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group surface-card lift flex h-full flex-col overflow-hidden"
              >
                <div className={cn("relative h-32 overflow-hidden", accentBg[p.accent] ?? "bg-muted")}>
                  <div className="float-slow absolute -right-8 -top-8 h-32 w-32 blob bg-card/45" />
                  <span
                    className={cn(
                      "absolute bottom-4 left-6 text-[10px] font-extrabold uppercase tracking-[0.22em]",
                      accentText[p.accent] ?? "text-ink",
                    )}
                  >
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-extrabold leading-tight tracking-[-0.03em] transition-colors group-hover:text-secondary">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <div className="mt-auto flex items-center gap-4 pt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    <span>{p.date}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {p.read}
                    </span>
                    <ArrowUpRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={120}>
          <div className="mt-16 flex flex-wrap items-center gap-6 rounded-[2.5rem] bg-ink px-8 py-10 text-cream">
            <div className="max-w-md">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">Read something you liked?</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em]">
                Put it into practice today.
              </h3>
            </div>
            <Link to="/shop" search={{ q: "", goal: "", sort: "featured", max: 1500 }} className="ml-auto">
              <BrandButton variant="gold" size="lg">
                <Sparkles className="h-4 w-4" /> Shop the range
              </BrandButton>
            </Link>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
