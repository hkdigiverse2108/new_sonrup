import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal } from "@/components/site/Primitives";
import { getPolicy, policies } from "@/lib/site-content";

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const doc = getPolicy(params.slug);
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Policy not found — Sonrup" }, { name: "robots", content: "noindex" }] };
    }
    const { doc } = loaderData;
    return {
      meta: [
        { title: `${doc.title} — Sonrup Nutrition` },
        { name: "description", content: doc.intro.slice(0, 155) },
        { property: "og:title", content: `${doc.title} — Sonrup Nutrition` },
        { property: "og:description", content: doc.intro.slice(0, 155) },
      ],
    };
  },
  component: PolicyPage,
  errorComponent: RouteError,
  notFoundComponent: PolicyNotFound,
});

function PolicyNotFound() {
  return (
    <Container className="py-28 text-center">
      <h1 className="display-xl text-4xl">Policy not found</h1>
      <div className="mt-8 flex justify-center">
        <Link to="/">
          <BrandButton variant="solid">Go home</BrandButton>
        </Link>
      </div>
    </Container>
  );
}

function PolicyPage() {
  const { doc } = Route.useLoaderData();
  const others = policies.filter((p) => p.slug !== doc.slug);

  return (
    <main>
      <PageHero eyebrow={doc.updated} title={doc.title} sub={doc.intro} />
      <Container className="grid gap-14 py-14 lg:grid-cols-[1fr_260px] lg:py-20">
        <div className="max-w-2xl space-y-10">
          {doc.sections.map((s, i) => (
            <Reveal key={s.heading} delay={i * 70}>
              <section>
                <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">{s.heading}</h2>
                <div className="mt-4 space-y-4">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-sm leading-[1.85] text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        <aside className="lg:sticky lg:top-32 lg:h-fit">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Other policies</p>
          <nav className="mt-4 flex flex-col gap-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/policies/$slug"
                params={{ slug: p.slug }}
                className="rounded-2xl bg-muted/60 px-4 py-3 text-sm font-bold transition-colors hover:bg-muted"
              >
                {p.title}
              </Link>
            ))}
          </nav>
        </aside>
      </Container>
    </main>
  );
}
