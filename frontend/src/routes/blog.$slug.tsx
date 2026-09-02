import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Container, Crumbs, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal } from "@/components/site/Primitives";
import { usePosts, fetchJson, getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";



export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const post = await fetchJson<any>(`/api/posts/${params.slug}`);
      return { post, body: post.body ?? [] };
    } catch (e) {
      throw notFound();
    }
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
  const { data: posts = [] } = usePosts();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden bg-muted/20 border-b border-border/40 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex items-center">
        {(post.detail_image || post.image) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={getImageUrl(post.detail_image || post.image)}
              alt={post.title}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:object-[right_center] lg:object-center opacity-90 contrast-[1.03]"
            />
            {/* Soft left overlay for high text contrast without washing out the right side */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 md:via-background/50 to-transparent w-full md:w-[75%]" />
            {/* Soft bottom edge blend into article */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
        )}
        <div className="spin-slow pointer-events-none absolute -right-24 -top-24 h-80 w-80 blob bg-card/40" />
        <div className="float-slow pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 blob bg-card/30" />
        <Container className="relative py-16 lg:py-24 w-full">
          <Crumbs items={[{ label: "Journal", to: "/blog" }, { label: post.title }]} />
          {post.category && (
            <span className="mt-6 inline-block rounded-full bg-secondary/15 border border-secondary/30 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
              {post.category}
            </span>
          )}
          <h1 className="mask-rise mt-4 max-w-2xl lg:max-w-3xl font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-foreground">
            {post.title}
          </h1>
          <div className="mask-rise mt-6 flex flex-wrap items-center gap-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground [--d:180ms]">
            <span>{post.date}</span>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <article className="mx-auto max-w-3xl">
          <p className="font-display text-xl font-extrabold leading-snug tracking-[-0.02em] sm:text-2xl text-foreground">
            {post.excerpt}
          </p>
          <div className="mt-10 space-y-7">
            {(Array.isArray(body) ? body : (body ? [body] : [])).map((block: any, i: number) => {
              if (!block) return null;
              const isText = typeof block === "string" || block.type === "text";
              const content = typeof block === "string" ? block : block.content;

              if (!content) return null;

              return (
                <Reveal key={i} delay={i * 60}>
                  {isText ? (
                    <p
                      className={cn(
                        "text-base leading-[1.85] text-foreground/85 whitespace-pre-wrap",
                        i === 0 &&
                          "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-secondary",
                      )}
                    >
                      {content}
                    </p>
                  ) : (
                    <div className="my-10 overflow-hidden rounded-2xl border bg-muted shadow-sm">
                      <img src={getImageUrl(content)} alt="Blog post visual" className="w-full object-cover" />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <div className="mt-14 flex items-center justify-between border-t border-border pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All stories
            </Link>
            <Link to="/shop" search={{ q: "", goal: "", sort: "featured", max: 99999 }}>
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
                  <div className="relative h-48 overflow-hidden bg-muted">
                    {p.image ? (
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted/60" />
                    )}
                    <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.2em] backdrop-blur-sm text-primary shadow-sm">
                      {p.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-lg font-extrabold leading-tight tracking-[-0.02em] transition-colors group-hover:text-secondary">
                      {p.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                      <span>{p.date}</span>
                      <ArrowUpRight className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
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
