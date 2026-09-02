import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { Container, RouteError } from "@/components/site/Page";
import { BrandButton, Eyebrow, Reveal } from "@/components/site/Primitives";
import { postsQueryOptions, journalContentQueryOptions, usePosts, useJournalContent, getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/blog/")({
  loader: async ({ context: { queryClient } }) => {
    const [posts, journalContent] = await Promise.all([
      queryClient.ensureQueryData(postsQueryOptions()),
      queryClient.ensureQueryData(journalContentQueryOptions()),
    ]);
    return { posts, journalContent };
  },
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

function JournalPage() {
  const loaderData = Route.useLoaderData();
  const { data: posts = loaderData?.posts || [] } = usePosts();
  const { data: journalContent = loaderData?.journalContent } = useJournalContent();

  const sortedPosts = [...posts].sort((a, b) => {
    const rA = a.rank ?? 0;
    const rB = b.rank ?? 0;
    const rankA = rA > 0 ? rA : 9999;
    const rankB = rB > 0 ? rB : 9999;
    if (rankA !== rankB) return rankA - rankB;
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const categories = ["All", ...Array.from(new Set(sortedPosts.map((p) => p.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? sortedPosts : sortedPosts.filter((p) => p.category === cat);
  const [lead, ...rest] = list;

  const hero = journalContent?.hero || { eyebrow: "The Journal", title_black: "Straight answers about", title_gold: "what you swallow.", sub: "No mysticism, no miracle claims. Just clear writing on ingredients, doses and the small habits that make a routine stick." };
  const cta = journalContent?.cta || { eyebrow: "Read something you liked?", title: "Put it into practice today.", cta_text: "Shop the range", cta_link: "/shop" };

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
              <BookOpen className="h-3.5 w-3.5 text-primary" /> {hero.eyebrow}
            </Eyebrow>
          </div>
          <h1 className="mask-rise mt-8 max-w-4xl font-display text-[clamp(2.6rem,8vw,5rem)] font-extrabold leading-[0.9] tracking-[-0.05em] [--d:120ms]">
            {hero.title_black} <span className="text-gradient-gold">{hero.title_gold}</span>
          </h1>
          <p className="mask-rise mt-7 max-w-xl text-base leading-relaxed text-cream/60 sm:text-lg [--d:260ms]">
            {hero.sub}
          </p>
        </Container>
      </section>

      <Container className="py-14 lg:py-20">


        {/* Lead story */}
        {lead && (
          <Reveal key={lead.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: lead.slug }}
              className="group mt-10 grid overflow-hidden rounded-[2.5rem] border border-border/70 bg-card shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] lg:grid-cols-[1.1fr_1fr]"
            >
              <div className="relative flex min-h-64 items-end overflow-hidden bg-muted">
                {lead.image && <img src={getImageUrl(lead.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                <div className="float-slow absolute -right-16 -top-16 h-64 w-64 blob bg-card/45" />
                <div className="spin-slow absolute -bottom-24 -left-24 h-56 w-56 blob bg-card/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative p-9">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-9">
                <h2 className="font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.04em] transition-colors group-hover:text-secondary sm:text-4xl">
                  {lead.title}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">{lead.excerpt}</p>
                <div className="mt-7 flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{lead.date}</span>
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
                <div className="relative h-48 overflow-hidden bg-muted">
                  {p.image && <img src={getImageUrl(p.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  <div className="float-slow absolute -right-8 -top-8 h-32 w-32 blob bg-card/45" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-sm text-primary">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">

                  <h3 className="mt-3 font-display text-lg font-extrabold leading-tight tracking-[-0.02em] transition-colors group-hover:text-secondary">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.excerpt}</p>
                  <ArrowUpRight className="mt-auto h-4 w-4 pt-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={120}>
          <div className="mt-16 flex flex-wrap items-center gap-6 rounded-[2.5rem] bg-ink px-8 py-10 text-cream">
            <div className="max-w-md">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">{cta.eyebrow}</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em]">
                {cta.title}
              </h3>
            </div>
            <Link to={cta.cta_link} search={{ q: "", goal: "", sort: "featured", max: 99999 }} className="ml-auto">
              <BrandButton variant="gold" size="lg">
                <Sparkles className="h-4 w-4" /> {cta.cta_text}
              </BrandButton>
            </Link>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
