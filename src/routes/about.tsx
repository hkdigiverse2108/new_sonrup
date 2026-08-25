import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal, SectionTitle } from "@/components/site/Primitives";
import { brandValues, milestones } from "@/lib/site-content";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/about")({
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

function About() {
  return (
    <main>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Supplements you actually
            <span className="text-gradient-gold"> look forward to.</span>
          </>
        }
        sub="Sonrup began with a simple frustration: the best formulas in the world do nothing if the tub stays shut. So we built a brand around the one thing most supplements ignore — the experience of taking them."
      />

      <Container className="py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-6 blob bg-primary/15 blur-2xl" />
              <img
                src={IMG.multi}
                alt="Sonrup gummies range"
                className="relative w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <SectionTitle
              eyebrow="Why we exist"
              title="Flavour first. Science always."
              sub="Every batch has to pass two tests before it ships: does it work at a meaningful dose, and would you happily take it every morning for a year?"
            />
            <div className="mt-8 grid gap-4">
              {[
                { icon: Leaf, t: "Pectin based, 100% vegetarian", d: "No gelatin, ever. Real fruit concentrates for flavour." },
                { icon: ShieldCheck, t: "Tested every batch", d: "Third-party lab checks for potency, purity and heavy metals." },
                { icon: Sparkles, t: "Doses that matter", d: "No fairy dusting — actives at levels backed by research." },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="surface-card flex gap-4 p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-extrabold">{t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>

      <section className="bg-muted/40 py-16 sm:py-24">
        <Container>
          <SectionTitle eyebrow="What we stand for" title="Our values" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandValues.map((v: { title: string; body: string }, i: number) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="surface-card lift h-full p-7">
                  <p className="font-display text-2xl font-extrabold">{v.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        <SectionTitle eyebrow="The journey" title="How we got here" />
        <div className="mt-12 border-l border-border pl-6 sm:pl-10">
          {milestones.map((m: { year: string; text: string }, i: number) => (
            <Reveal key={m.year} delay={i * 70}>
              <div className="relative pb-12">
                <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-[image:var(--gradient-gold)] sm:-left-[47px]" />
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">{m.year}</p>
                <p className="mt-2 max-w-2xl font-display text-xl font-extrabold leading-snug">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="surface-card mt-8 flex flex-col items-center gap-5 px-6 py-14 text-center">
          <h3 className="display-xl text-3xl sm:text-4xl">Ready to make it a habit?</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Start with a best seller — free shipping on orders above ₹499.
          </p>
          <Link to="/shop">
            <BrandButton variant="gold" size="lg">
              Shop the range
            </BrandButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}
