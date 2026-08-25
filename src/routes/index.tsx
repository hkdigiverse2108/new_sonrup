import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  Sparkles,
  Truck,
  Heart,
  Clock,
  FlaskConical,
  PackageCheck,
  ChevronDown,
  Quote,
} from "lucide-react";
import {
  BrandButton,
  Eyebrow,
  ProductCard,
  Rating,
  Reveal,
  SectionTitle,
} from "@/components/site/Primitives";
import { faqs, flavours, goals, IMG, inr, products, reviewsList } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sonrup Gummies — Goodness That Tastes This Good" },
      {
        name: "description",
        content:
          "Premium daily gummies from Sonrup: biotin multivitamin, Himalayan shilajit and kids' immunity — real fruit flavours, 60 gummies per tube.",
      },
      { property: "og:title", content: "Sonrup Gummies — Goodness That Tastes This Good" },
      {
        property: "og:description",
        content: "Delicious daily gummies made to make your everyday routine a little sweeter.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <BestSellers />
      <FlavourExperience />
      <WhyOurGummies />
      <IngredientStory />
      <FindYourGummy />
      <BrandStory />
      <Reviews />
      <SocialGrid />
      <FaqTeaser />
      <FinalCta />
    </main>
  );
}

/* ---------------- HERO ---------------- */

const HERO_ROTATE = ["glow", "energy", "immunity", "focus", "calm"];

const HERO_STATS = [
  { k: "5000 mcg", v: "Biotin per serving" },
  { k: "60", v: "Gummies per tube" },
  { k: "4.8/5", v: "From 4,356 reviews" },
];

function Hero() {
  const [word, setWord] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => setWord((i) => (i + 1) % HERO_ROTATE.length), 2400);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative overflow-hidden bg-ink text-cream"
    >
      {/* Ambient light */}
      <div className="aurora pointer-events-none absolute -left-40 -top-52 h-[760px] w-[760px] blob bg-primary/25 blur-[120px]" />
      <div className="aurora pointer-events-none absolute -right-32 top-24 h-[560px] w-[560px] blob bg-secondary/20 blur-[120px] [animation-delay:-7s]" />
      <div className="aurora pointer-events-none absolute bottom-[-14rem] left-1/3 h-[520px] w-[520px] blob bg-leaf/12 blur-[130px] [animation-delay:-13s]" />
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background/95" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 px-5 pb-28 pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:pb-36 lg:pt-24">
        {/* Copy */}
        <div className="relative z-10">
          <div className="mask-rise">
            <Eyebrow className="border-cream/15 bg-cream/[0.06] text-cream/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Est. 2023 · Made in India
            </Eyebrow>
          </div>

          <h1 className="mt-8 font-display text-[clamp(2.9rem,9vw,5.9rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
            <span className="mask-rise block [--d:80ms]">A daily ritual</span>
            <span className="mask-rise block [--d:200ms]">
              worth <span className="italic font-semibold tracking-[-0.02em]">savouring</span>
            </span>
            <span className="mask-rise mt-2 flex flex-wrap items-baseline gap-x-4 [--d:320ms]">
              <span className="text-[0.42em] font-bold uppercase tracking-[0.3em] text-cream/45">for your</span>
              <span className="relative inline-block h-[1.02em] min-w-[7.5em] overflow-hidden align-bottom">
                {HERO_ROTATE.map((w, i) => (
                  <span
                    key={w}
                    aria-hidden={i !== word}
                    className={cn(
                      "text-gradient-gold absolute inset-x-0 bottom-0 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      i === word ? "translate-y-0 opacity-100 blur-0" : "translate-y-[110%] opacity-0 blur-[8px]",
                    )}
                  >
                    {w}.
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="mask-rise mt-8 max-w-md text-base leading-relaxed text-cream/65 sm:text-lg [--d:460ms]">
            Chef-crafted gummies with real fruit flavour and actives listed to the milligram. Nutrition you look
            forward to, not nutrition you endure.
          </p>

          <div className="mask-rise mt-10 flex flex-wrap items-center gap-3 [--d:580ms]">
            <Link to="/shop">
              <BrandButton variant="gold" size="lg" className="group">
                Shop the range
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </BrandButton>
            </Link>
            <a href="#flavours">
              <BrandButton
                variant="ghost"
                size="lg"
                className="border border-cream/20 text-cream hover:bg-cream/10"
              >
                Taste the flavours
              </BrandButton>
            </a>
          </div>

          <dl className="mask-rise mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.04] backdrop-blur [--d:700ms]">
            {HERO_STATS.map((s) => (
              <div key={s.k} className="px-4 py-5">
                <dt className="font-display text-xl font-extrabold text-primary sm:text-2xl">{s.k}</dt>
                <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/50">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual — arch frame */}
        <div className="relative z-10 [animation:rise-in_1.1s_260ms_both]">
          <div
            className="relative mx-auto w-[min(84vw,470px)] transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${tilt.x * 26}px, ${tilt.y * 20}px, 0)` }}
          >
            <div className="spin-slow absolute -inset-6 rounded-full border border-dashed border-primary/25" />
            <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] border border-cream/12 bg-cream/[0.05] p-3 shadow-[var(--shadow-lift)] backdrop-blur">
              <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-70" />
              <img
                src={IMG.multi}
                alt="Sonrup Biotin + Multivitamin gummies tube"
                className="float-slow relative z-10 aspect-4/5 w-full rounded-t-[999px] rounded-b-[2rem] object-cover"
              />
              <div className="sheen pointer-events-none absolute inset-0 rounded-t-[999px] rounded-b-[2.5rem]" />
            </div>

            <div
              className="absolute -left-5 top-24 z-20 rounded-2xl border border-cream/10 bg-ink/85 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur sm:-left-10"
              style={{ transform: `translate3d(${tilt.x * -46}px, ${tilt.y * -36}px, 0)` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Third-party tested</p>
              <p className="font-display text-base font-extrabold text-cream">Every single batch</p>
            </div>

            <div
              className="absolute -right-4 bottom-20 z-20 flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-ink shadow-[var(--shadow-lift)] sm:-right-9"
              style={{ transform: `translate3d(${tilt.x * -62}px, ${tilt.y * -48}px, 0)` }}
            >
              <Leaf className="h-5 w-5 text-leaf" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Pectin based</p>
                <p className="font-display text-base font-extrabold">100% vegetarian</p>
              </div>
            </div>

            <img
              src={IMG.shilajit}
              alt="Sonrup Himalayan Shilajit gummies"
              className="float-fast absolute -left-8 bottom-2 z-20 hidden h-32 w-24 rotate-[-8deg] rounded-2xl object-cover shadow-[var(--shadow-lift)] lg:block"
            />
            <img
              src={IMG.kids}
              alt="Sonrup Kid's Multivitamin gummies"
              className="float-slow absolute -right-6 -top-4 z-20 hidden h-32 w-24 rotate-[9deg] rounded-2xl object-cover shadow-[var(--shadow-lift)] lg:block [animation-delay:-2.5s]"
            />
          </div>
        </div>
      </div>

      {/* Kinetic footer line */}
      <div className="relative overflow-hidden border-y border-cream/10 py-3">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-8">
              {["Biotin + Multivitamin", "Himalayan Shilajit", "Kid's Immunity", "Real fruit flavours", "No proprietary blends"].map(
                (t) => (
                  <span key={t} className="text-[11px] font-bold uppercase tracking-[0.28em] text-cream/45">
                    {t} <span className="ml-8 text-primary">✦</span>
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------------- TRUST ---------------- */

const trust = [
  { icon: Leaf, label: "Premium Ingredients" },
  { icon: Sparkles, label: "Delicious Flavours" },
  { icon: BadgeCheck, label: "Quality Assured" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Heart, label: "Loved by Customers" },
];

function TrustStrip() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-5 py-2 sm:grid-cols-3 lg:grid-cols-5 lg:px-10">
        {trust.map(({ icon: Icon, label }, i) => (
          <Reveal key={label} delay={i * 70}>
            <div className="flex items-center gap-3 px-2 py-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-ink">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- BEST SELLERS ---------------- */

function BestSellers() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <SectionTitle eyebrow="Best sellers" title={<>Our most-loved gummies</>} />
        </Reveal>
        <Reveal delay={120}>
          <Link to="/shop" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={i * 110} className="w-[78vw] shrink-0 snap-start sm:w-[360px] lg:w-auto">
            <ProductCard product={p} className={cn(i === 1 && "lg:-translate-y-6")} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FLAVOURS ---------------- */

const flavourBg: Record<string, string> = {
  berry: "bg-berry/12",
  citrus: "bg-citrus/15",
  grape: "bg-grape/12",
  primary: "bg-primary/20",
  leaf: "bg-leaf/15",
};

function FlavourExperience() {
  const [active, setActive] = useState(1);
  return (
    <section id="flavours" className="relative overflow-hidden bg-ink py-24 text-cream">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 blob bg-primary/20 blur-[100px]" />
      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <Eyebrow className="border-cream/15 bg-cream/5 text-cream/70">Flavour experience</Eyebrow>
          <h2 className="display-xl mt-5 max-w-3xl text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
            Five flavours. <span className="text-gradient-gold">Zero compromise.</span>
          </h2>
        </Reveal>

        <div className="mt-14 flex h-[420px] gap-3 max-lg:flex-col max-lg:h-auto">
          {flavours.map((f, i) => (
            <button
              key={f.name}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-cream/10 text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-lg:h-28",
                flavourBg[f.token],
                active === i ? "lg:flex-[3.2]" : "lg:flex-[1]",
              )}
            >
              <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-40" />
              <div className="relative flex h-full flex-col justify-between p-6">
                <span className="font-display text-5xl font-extrabold text-cream/25">0{i + 1}</span>
                <div>
                  <h3
                    className={cn(
                      "display-xl text-2xl transition-all duration-500 lg:text-3xl",
                      active === i ? "text-cream" : "text-cream/70",
                    )}
                  >
                    {f.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 max-w-xs text-sm text-cream/70 transition-all duration-500",
                      active === i ? "opacity-100" : "lg:opacity-0",
                    )}
                  >
                    {f.note}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY ---------------- */

const whys = [
  { icon: Leaf, title: "Premium Ingredients", text: "Actives at doses that matter, sourced from suppliers we can name." },
  { icon: Sparkles, title: "Delicious Taste", text: "Real fruit concentrates. No chalky aftertaste, ever." },
  { icon: Clock, title: "Easy Daily Routine", text: "One or two gummies. No water, no measuring, no excuses." },
  { icon: FlaskConical, title: "Carefully Crafted", text: "Small-batch formulation with in-house pharmacists." },
  { icon: BadgeCheck, title: "Quality Assured", text: "Every batch third-party tested for purity and potency." },
  { icon: PackageCheck, title: "Convenient Format", text: "A tube that travels, seals tight and looks good on the counter." },
];

function WhyOurGummies() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[image:var(--gradient-gold)] p-8">
            <img
              src={IMG.multi}
              alt="Sonrup multivitamin gummies packaging"
              className="w-full rounded-[1.8rem] object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
          <div className="float-slow absolute -bottom-8 -right-4 max-w-[220px] rounded-3xl bg-card p-5 shadow-[var(--shadow-lift)]">
            <p className="font-display text-4xl font-extrabold">98%</p>
            <p className="mt-1 text-xs text-muted-foreground">of customers say they'd never go back to tablets.</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionTitle
              eyebrow="Why our gummies"
              title={<>Built to be taken, not just bought.</>}
              sub="Most supplements fail on the shelf, not in the lab. We designed ours to be the part of your day you actually look forward to."
            />
          </Reveal>
          <div className="mt-10 grid gap-x-8 sm:grid-cols-2">
            {whys.map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div className="group flex gap-4 border-b border-border/70 py-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/25">
                    <w.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.1em]">{w.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- INGREDIENTS ---------------- */

const ringItems = [
  { name: "Himalayan Shilajit", note: "500 mg purified resin", pos: "left-0 top-6" },
  { name: "Ashwagandha", note: "Traditional adaptogen", pos: "left-0 bottom-24" },
  { name: "Vitamin B12", note: "Energy metabolism", pos: "right-0 top-16" },
  { name: "Tamarind", note: "Real imli flavour", pos: "right-0 bottom-16" },
];

function IngredientStory() {
  return (
    <section className="relative overflow-hidden bg-muted/50 py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow="Ingredient story"
            title={<>What's inside the tube</>}
            sub="Every gummy is a short ingredient list you could read out loud without flinching."
          />
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/15" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/10" />

          <div className="relative mx-auto w-[min(70vw,320px)]">
            <img
              src={IMG.shilajit}
              alt="Sonrup Himalayan Shilajit gummies"
              className="float-slow w-full rounded-[2rem] shadow-[var(--shadow-lift)]"
            />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0 lg:block">
            {ringItems.map((it, i) => (
              <Reveal key={it.name} delay={i * 120} className={cn("lg:absolute lg:w-56", it.pos)}>
                <div className="surface-card p-4">
                  <p className="text-sm font-extrabold">{it.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{it.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINDER ---------------- */

function FindYourGummy() {
  const [picked, setPicked] = useState<string[]>(["Daily Wellness"]);
  const matches = products.filter((p) => p.goals.some((g) => picked.includes(g)));

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10">
      <div className="overflow-hidden rounded-[2.5rem] bg-card shadow-[var(--shadow-soft)]">
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          <div className="p-8 sm:p-12">
            <Eyebrow>Product finder</Eyebrow>
            <h2 className="display-xl mt-5 text-4xl leading-[0.92] lg:text-5xl">Find your perfect gummy</h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Tell us what you're after. We'll point you at the tube that fits.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {goals.map((g) => {
                const on = picked.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-300",
                      on
                        ? "border-transparent bg-ink text-cream shadow-[var(--shadow-soft)]"
                        : "border-border bg-background hover:border-ink/40",
                    )}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-muted/60 p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {matches.length} match{matches.length === 1 ? "" : "es"}
            </p>
            <div className="mt-5 space-y-3">
              {matches.map((p) => (
                <Link
                  key={p.slug}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-center gap-4 rounded-2xl bg-card p-3 transition-all duration-300 hover:shadow-[var(--shadow-soft)]"
                >
                  <img src={p.image} alt={p.name} className="h-16 w-14 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{inr(p.price)}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              {matches.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing matches yet — pick another goal.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- BRAND STORY ---------------- */

function BrandStory() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 lg:grid-cols-2 lg:px-10">
        <Reveal>
          <Eyebrow>Our story</Eyebrow>
          <h2 className="display-xl mt-6 text-4xl leading-[0.9] sm:text-5xl lg:text-[4.2rem]">
            We started with a
            <span className="text-gradient-gold"> half-empty </span>
            bottle of vitamins.
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Every household has one — bought with the best intentions, abandoned by week three. Sonrup began by asking
              a simpler question: what if taking your vitamins was the nicest thirty seconds of your morning?
            </p>
            <p>
              So we formulate backwards. Taste first, then texture, then the actives — never sacrificing the dose to get
              there. Small batches, honest labels, and packaging you don't have to hide in a cupboard.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              ["4.8★", "Average rating"],
              ["120k+", "Tubes shipped"],
              ["100%", "Vegetarian"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-extrabold">{n}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
          <Link to="/about" className="mt-10 inline-block">
            <BrandButton variant="outline" size="lg">
              Read our story
            </BrandButton>
          </Link>
        </Reveal>

        <Reveal delay={140} className="relative">
          <img
            src={IMG.kids}
            alt="Sonrup Kid's Multivitamin gummies"
            className="ml-auto w-[76%] rounded-[2.5rem] object-cover shadow-[var(--shadow-lift)]"
          />
          <img
            src={IMG.multi}
            alt="Sonrup Biotin multivitamin gummies"
            className="float-slow absolute bottom-[-3rem] left-0 w-[46%] rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */

function Reviews() {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <SectionTitle eyebrow="Reviews" title={<>Loved by 120,000+ mornings</>} />
        </Reveal>
        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {reviewsList.map((r, i) => (
            <Reveal key={r.name} delay={i * 70}>
              <div className="surface-card break-inside-avoid p-6">
                <Quote className="h-6 w-6 text-primary" />
                <p className="mt-4 text-sm leading-relaxed">{r.text}</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-sm font-extrabold text-ink">
                    {r.name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.city} · <span className="text-leaf">Verified purchase</span>
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Rating value={r.rating} size={12} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- SOCIAL ---------------- */

function SocialGrid() {
  const tiles = [IMG.multi, IMG.kids, IMG.shilajit, IMG.kids, IMG.multi, IMG.shilajit];
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <SectionTitle eyebrow="@sonrup" title={<>Join the gummy club</>} />
        </Reveal>
        <Reveal delay={100}>
          <BrandButton variant="ink" size="lg">
            Follow us
          </BrandButton>
        </Reveal>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((src, i) => (
          <Reveal key={i} delay={i * 60} className={cn(i === 1 && "md:row-span-2", i === 4 && "lg:col-span-2")}>
            <div className="group h-full overflow-hidden rounded-3xl">
              <img
                src={src}
                alt="Sonrup gummies lifestyle"
                loading="lazy"
                className="h-full min-h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FaqTeaser() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionTitle eyebrow="FAQ" title={<>Good questions, straight answers</>} />
          <Link to="/faq" className="mt-6 inline-block">
            <BrandButton variant="outline">All FAQs</BrandButton>
          </Link>
        </Reveal>
        <div className="divide-y divide-border border-y border-border">
          {faqs.slice(0, 6).map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-base font-bold">{f.q}</span>
                <ChevronDown
                  className={cn("h-5 w-5 shrink-0 transition-transform duration-400", open === i && "rotate-180 text-secondary")}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open === i ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <p className="overflow-hidden pr-10 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */

function FinalCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-ink px-6 py-20 text-center text-cream sm:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 blob bg-primary/25 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 blob bg-secondary/25 blur-[80px]" />
        <img
          src={IMG.multi}
          alt=""
          aria-hidden
          className="float-slow pointer-events-none absolute -left-10 bottom-0 hidden w-48 rotate-[-12deg] rounded-3xl opacity-90 lg:block"
        />
        <img
          src={IMG.kids}
          alt=""
          aria-hidden
          className="float-fast pointer-events-none absolute -right-8 top-4 hidden w-48 rotate-[10deg] rounded-3xl opacity-90 lg:block"
        />
        <div className="relative">
          <h2 className="display-xl mx-auto max-w-3xl text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
            Ready to make your day a little <span className="text-gradient-gold">sweeter?</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/shop">
              <BrandButton variant="gold" size="lg">
                Shop all gummies
              </BrandButton>
            </Link>
            <Link to="/shop" search={{ sort: "bestsellers" }}>
              <BrandButton size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream hover:text-ink">
                Best sellers
              </BrandButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
