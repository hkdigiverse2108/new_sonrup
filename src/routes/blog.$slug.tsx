import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Container, Crumbs, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal } from "@/components/site/Primitives";
import { posts } from "@/lib/products";
import { articleBody } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const accentBg: Record<string, string> = {
  citrus: "bg-citrus/15",
  berry: "bg-berry/12",
  grape: "bg-grape/12",
  primary: "bg-primary/20",
  leaf: "bg-leaf/15",
};

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post, body: articleBody[params.slug] ?? [] };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found — Sonrup Journal" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Sonrup Journal` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "article:published_time", content: post.date },
      ],
    };
  },
  component: ArticlePage,
  errorComponent: RouteError,
  notFoundComponent: ArticleNotFound,
});

function ArticleNotFound() {
  return (
    <Container className="py-28 text-center">
      <h1 className="display-xl text-4xl">We couldn't find that story</h1>
      <p className="mt-4 text-sm text-muted-foreground">It may have been renamed or removed.</p>
      <div className="mt-8 flex justify-center">
        <Link to="/blog">
          <BrandButton variant="solid">Back to the Journal</BrandButton>
        </Link>
      </div>
    </Container>
  );
}

function ArticlePage() {
  const { post, body } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main>
      {/* Reading progress */}
      <div className="sticky top-[92px] z-40 h-1 w-full bg-transparent">
        <div
          className="h-full bg-[image:var(--gradient-gold)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className={cn("relative overflow-hidden", accentBg[post.accent] ?? "bg-muted")}>
        <div className="spin-slow pointer-events-none absolute -right-24 -top-24 h-80 w-80 blob bg-card/40" />
        <div className="float-slow pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 blob bg-card/30" />
        <Container className="relative py-14 lg:py-20">
          <Crumbs items={[{ label: "Journal", to: "/blog" }, { label: post.category }]} />
          <h1 className="mask-rise mt-8 max-w-4xl font-display text-[clamp(2.2rem,6.5vw,4.2rem)] font-extrabold leading-[0.94] tracking-[-0.05em]">
            {post.title}
          </h1>
          <div className="mask-rise mt-8 flex flex-wrap items-center gap-5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55 [--d:180ms]">
            <span>{post.date}</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.read}
            </span>
            <span className="rounded-full bg-card/70 px-3 py-1.5">{post.category}</span>
          </div>
        </Container>
      </section>

      <Container className="py-14 lg:py-20">
        <article className="mx-auto max-w-2xl">
          <p className="font-display text-xl font-extrabold leading-snug tracking-[-0.02em] sm:text-2xl">
            {post.excerpt}
          </p>
          <div className="mt-10 space-y-7">
            {body.map((para, i) => (
              <Reveal key={i} delay={i * 60}>
                <p
                  className={cn(
                    "text-base leading-[1.85] text-foreground/85",
                    i === 0 &&
                      "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-secondary",
                  )}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 flex items-center justify-between border-t border-border pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All stories
            </Link>
            <Link to="/shop" search={{ q: "", goal: "", sort: "featured", max: 1500 }}>
              <BrandButton variant="solid" size="sm">
                Shop gummies
              </BrandButton>
            </Link>
          </div>
        </article>

        {/* More reading */}
        <div className="mt-20">
          <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">Keep reading</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {more.map((p, i) => (
              <Reveal key={p.slug} delay={i * 90}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group surface-card lift flex h-full flex-col overflow-hidden"
                >
                  <div className={cn("h-24", accentBg[p.accent] ?? "bg-muted")} />
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
                      {p.category}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-extrabold leading-tight tracking-[-0.02em] transition-colors group-hover:text-secondary">
                      {p.title}
                    </h3>
                    <ArrowUpRight className="mt-auto h-4 w-4 pt-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
