import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Sparkles, CheckCircle } from "lucide-react";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal, SectionTitle } from "@/components/site/Primitives";
import { IMG } from "@/lib/products";
import {
  useBrandValues,
  useMilestones,
  useAboutContent,
  aboutContentQueryOptions,
  brandValuesQueryOptions,
  milestonesQueryOptions,
  getImageUrl
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/about")({
  loader: async ({ context: { queryClient } }) => {
    const aboutContent = await queryClient.ensureQueryData(aboutContentQueryOptions());
    const brandValues = await queryClient.ensureQueryData(brandValuesQueryOptions());
    const milestones = await queryClient.ensureQueryData(milestonesQueryOptions());
    return { aboutContent, brandValues, milestones };
  },
  head: () => ({
    meta: [
      { title: "About Sonrup — Gummies Worth Looking Forward To" },
      {
        name: "description",
        content:
          "Why Sonrup makes daily gummies with real fruit flavours, clean actives and packaging built for your kitchen counter.",
      },
      { property: "og:title", content: "About Sonrup — Gummies Worth Looking Forward To" },
      {
        property: "og:description",
        content: "Our story, our values and the standards behind every Sonrup tube.",
      },
    ],
  }),
  errorComponent: RouteError,
  component: About,
});

function getIcon(name: string) {
  if (name === "Leaf") return Leaf;
  if (name === "ShieldCheck") return ShieldCheck;
  if (name === "Sparkles") return Sparkles;
  return CheckCircle;
}

function About() {
  const loaderData = Route.useLoaderData();
  const { data: brandValues = [] } = useBrandValues(loaderData?.brandValues);
  const { data: milestones = [] } = useMilestones(loaderData?.milestones);
  const { data: aboutContent } = useAboutContent(loaderData?.aboutContent);

  const hero = aboutContent?.hero || {};
  const why = aboutContent?.why || { benefits: [] };
  const valuesHeader = aboutContent?.values_header || {};
  const journeyHeader = aboutContent?.journey_header || {};
  const cta = aboutContent?.cta || {};

  return (
    <main>
      <PageHero
        eyebrow={hero.eyebrow}
        title={
          <>
            {hero.title_black}
            <span className="text-gradient-gold"> {hero.title_gold}</span>
          </>
        }
        sub={hero.sub}
      />

      <Container className="py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-6 blob bg-primary/15 blur-2xl" />
              <img loading="lazy"
                src={getImageUrl(why.image || IMG.multi)}
                alt="Sonrup gummies range"
                className="relative w-full aspect-[4/5] rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <SectionTitle
              eyebrow={why.eyebrow}
              title={why.title}
              sub={why.sub}
            />
            <div className="mt-8 grid gap-4">
              {(why.benefits || []).map(({ icon, t, d }: any) => {
                const Icon = getIcon(icon);
                return (
                  <div key={t} className="surface-card flex gap-4 p-5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-extrabold">{t}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </Container>

      <section className="bg-muted/40 py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow={valuesHeader.eyebrow} title={valuesHeader.title} align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandValues.map((v: { title: string; body: string }, i: number) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="surface-card lift h-full p-7">
                  <p className="font-display text-2xl font-extrabold">{v.title}</p>
                  <div className="mt-3 text-sm leading-relaxed text-muted-foreground rich-text-content" dangerouslySetInnerHTML={{ __html: v.body }} />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        {journeyHeader.show !== false && (
          <div className="mb-16">
            <SectionTitle eyebrow={journeyHeader.eyebrow} title={journeyHeader.title} />
            <div className="mt-12 border-l border-border pl-6 sm:pl-10">
              {milestones.map((m: { year: string; text: string }, i: number) => (
                <Reveal key={m.year} delay={i * 70}>
                  <div className="relative pb-12">
                    <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-[image:var(--gradient-gold)] sm:-left-[47px]" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">{m.year}</p>
                    <div className="mt-2 max-w-2xl font-display text-xl font-extrabold leading-snug rich-text-content" dangerouslySetInnerHTML={{ __html: m.text }} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <div className="surface-card flex flex-col items-center gap-5 px-6 py-14 text-center">
          <h3 className="display-xl text-3xl sm:text-4xl">{cta.title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {cta.sub}
          </p>
          <Link to={cta.button_link}>
            <BrandButton variant="gold" size="lg">
              {cta.button_text}
            </BrandButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}
