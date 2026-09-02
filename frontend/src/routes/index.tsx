import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Star, Shield, Check, ThumbsUp
} from "lucide-react";
import {
  BrandButton,
  Eyebrow,
  ProductCard,
  Rating,
  Reveal,
  SectionTitle,
} from "@/components/site/Primitives";
import { IMG, inr } from "@/lib/products";
import {
  homeContentQueryOptions,
  productsQueryOptions,
  flavoursQueryOptions,
  reviewsQueryOptions,
  faqsQueryOptions,
  useProducts,
  useFlavours,
  useGoals,
  useReviews,
  useFaqs,
  useHomeContent,
  fetchJson,
  getImageUrl
} from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(homeContentQueryOptions()),
      queryClient.ensureQueryData(productsQueryOptions()),
      queryClient.ensureQueryData(flavoursQueryOptions()),
      queryClient.ensureQueryData(reviewsQueryOptions()),
      queryClient.ensureQueryData(faqsQueryOptions()),
    ]);
  },
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
  const { data: homeContent } = useHomeContent();

  return (
    <main>
      <Hero content={homeContent} />
      <TrustStrip content={homeContent} />
      <BestSellers />
      <FlavourExperience content={homeContent} />
      <WhyOurGummies content={homeContent} />
      <IngredientStory content={homeContent} />

      <BrandStory content={homeContent} />
      <Reviews content={homeContent} />
      <SocialGrid content={homeContent} />
      <FaqTeaser content={homeContent} />
      <FinalCta content={homeContent} />
    </main>
  );
}

/* ---------------- HERO ---------------- */

// Fallback defaults (used while loading or if DB is empty)
const HERO_DEFAULTS = {
  rotate: ["glow", "energy", "immunity", "focus", "calm"],
  stats: [
    { k: "5000 mcg", v: "Biotin per serving" },
    { k: "60", v: "Gummies per tube" },
    { k: "4.8/5", v: "From 4,356 reviews" },
  ],
  eyebrow: "Est. 2023 · Made in India",
  headline_line1: "A daily ritual",
  headline_line2: "worth savouring",
  headline_for_your: "for your",
  subtext: "Chef-crafted gummies with real fruit flavour and actives listed to the milligram. Nutrition you look forward to, not nutrition you endure.",
  cta1_text: "Shop the range",
  cta1_href: "/shop",
  cta2_text: "Taste the flavours",
  cta2_href: "#flavours",
  badge1_label: "Third-party tested",
  badge1_value: "Every single batch",
  badge2_label: "Pectin based",
  badge2_value: "100% vegetarian",
};

function Hero({ content }: { content: any }) {
  const [word, setWord] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const hero = content?.hero ? { ...HERO_DEFAULTS, ...content.hero } : HERO_DEFAULTS;

  const rotate: string[] = hero.rotate?.length ? hero.rotate : HERO_DEFAULTS.rotate;
  const stats: any[] = hero.stats?.length ? hero.stats : HERO_DEFAULTS.stats;

  useEffect(() => {
    const id = setInterval(() => setWord((i) => (i + 1) % rotate.length), 2400);
    return () => clearInterval(id);
  }, [rotate.length]);

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
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {hero.eyebrow}
            </Eyebrow>
          </div>

          <h1 className="mt-8 font-display text-[clamp(2.2rem,9vw,5.9rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
            <span className="mask-rise block [--d:80ms]">{hero.headline_line1}</span>
            <span className="mask-rise block [--d:200ms]">
              {hero.headline_line2.includes(" ") ? (
                <>
                  {hero.headline_line2.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="italic font-semibold tracking-[-0.02em]">{hero.headline_line2.split(" ").at(-1)}</span>
                </>
              ) : <span className="italic font-semibold tracking-[-0.02em]">{hero.headline_line2}</span>}
            </span>
            <span className="mask-rise mt-2 flex flex-wrap items-baseline gap-x-4 [--d:320ms]">
              <span className="text-[0.42em] font-bold uppercase tracking-[0.3em] text-cream/45">{hero.headline_for_your}</span>
              <span className="relative inline-block h-[1.02em] min-w-[7.5em] overflow-hidden align-bottom">
                {rotate.map((w, i) => (
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
            {hero.subtext}
          </p>

          <div className="mask-rise mt-10 flex flex-wrap items-center gap-3 [--d:580ms]">
            <Link to={hero.cta1_href?.startsWith("/") ? hero.cta1_href : "/shop"}>
              <BrandButton variant="gold" size="lg" className="group">
                {hero.cta1_text}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </BrandButton>
            </Link>
            <a href={hero.cta2_href ?? "#flavours"}>
              <BrandButton
                variant="ghost"
                size="lg"
                className="border border-cream/20 text-cream hover:bg-cream/10"
              >
                {hero.cta2_text}
              </BrandButton>
            </a>
          </div>

          <dl className="mask-rise mt-14 grid max-w-lg grid-cols-1 md:grid-cols-3 divide-y divide-cream/10 md:divide-y-0 md:divide-x md:divide-cream/10 overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.04] backdrop-blur [--d:700ms]">
            {stats.map((s) => (
              <div key={s.k} className="px-4 py-4 md:py-5 text-center md:text-left">
                <dt className="font-display text-xl font-extrabold text-primary sm:text-2xl">{s.k}</dt>
                <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream/50 leading-tight">{s.v}</dd>
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
                src={getImageUrl(hero.main_image || IMG.multi)}
                alt="Sonrup Biotin + Multivitamin gummies tube"
                loading="eager"
                fetchPriority="high"
                className="float-slow relative z-10 aspect-4/5 w-full rounded-t-[999px] rounded-b-[2rem] object-cover"
              />
              <div className="sheen pointer-events-none absolute inset-0 rounded-t-[999px] rounded-b-[2.5rem]" />
            </div>

            <div
              className="absolute left-2 md:-left-5 top-24 z-20 rounded-2xl border border-cream/10 bg-ink/85 px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur sm:-left-10"
              style={{ transform: `translate3d(${tilt.x * -46}px, ${tilt.y * -36}px, 0)` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{hero.badge1_label}</p>
              <p className="font-display text-sm md:text-base font-extrabold text-cream">{hero.badge1_value}</p>
            </div>

            <div
              className="absolute right-2 md:-right-4 bottom-20 z-20 flex items-center gap-2 md:gap-3 rounded-2xl bg-cream px-3 py-2 md:px-4 md:py-3 text-ink shadow-[var(--shadow-lift)] sm:-right-9"
              style={{ transform: `translate3d(${tilt.x * -62}px, ${tilt.y * -48}px, 0)` }}
            >
              <Leaf className="h-4 w-4 md:h-5 md:w-5 text-leaf shrink-0" />
              <div>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{hero.badge2_label}</p>
                <p className="font-display text-sm md:text-base font-extrabold">{hero.badge2_value}</p>
              </div>
            </div>

            <img
              src={getImageUrl(hero.left_image || IMG.shilajit)}
              alt="Sonrup Himalayan Shilajit gummies"
              loading="eager"
              className="float-fast absolute -left-8 bottom-2 z-20 hidden h-32 w-24 rotate-[-8deg] rounded-2xl object-cover shadow-[var(--shadow-lift)] lg:block"
            />
            <img
              src={getImageUrl(hero.right_image || IMG.kids)}
              alt="Sonrup Kid's Multivitamin gummies"
              loading="eager"
              className="float-slow absolute -right-6 -top-4 z-20 hidden h-32 w-24 rotate-[9deg] rounded-2xl object-cover shadow-[var(--shadow-lift)] lg:block [animation-delay:-2.5s]"
            />
          </div>
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

const iconMap: Record<string, any> = {
  Leaf, Sparkles, BadgeCheck, Truck, Heart, Clock, FlaskConical, PackageCheck, Star, Shield, Check, ThumbsUp
};

function TrustStrip({ content }: { content: any }) {
  const rawItems = content?.trust_strip?.length ? content.trust_strip : trust;
  // Normalize legacy string arrays from DB to object format
  const displayItems = typeof rawItems[0] === 'string' 
    ? rawItems.map((t: string) => ({ icon: "BadgeCheck", label: t }))
    : rawItems;

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-5 py-2 sm:grid-cols-3 lg:grid-cols-5 lg:px-10">
        {displayItems.map((item: any, i: number) => {
          const Icon = typeof item.icon === "string" ? (iconMap[item.icon] || BadgeCheck) : (item.icon || BadgeCheck);
          return (
            <Reveal key={item.label + i} delay={i * 70}>
              <div className="flex items-center gap-3 px-2 py-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-ink">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{item.label}</span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- BEST SELLERS ---------------- */

function BestSellers() {
  const { data: products = [] } = useProducts();
  const bestSellers = products
    .filter((p) => (p.badges || []).some(b => b.toLowerCase().includes("best seller")))
    .slice(0, 3);
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
        {bestSellers.map((p, i) => (
          <Reveal key={p.slug} delay={i * 110} className="w-[78vw] shrink-0 snap-start sm:w-[360px] lg:w-auto">
            <ProductCard product={p} className={cn(i === 1 && "lg:-translate-y-6")} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FLAVOURS ---------------- */

function FlavourExperience({ content }: { content: any }) {
  const [active, setActive] = useState<number | null>(null);
  const { data: flavours = [] } = useFlavours();

  const section = content?.flavour_section ?? {
    eyebrow: "Flavour experience",
    title_black: "Five flavours.",
    title_gold: "Zero compromise."
  };

  return (
    <section id="flavours" className="relative overflow-hidden bg-ink py-24 text-cream">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 blob bg-primary/20 blur-[100px]" />
      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <Eyebrow className="border-cream/15 bg-cream/5 text-cream/70">{section.eyebrow}</Eyebrow>
          <h2 className="display-xl mt-5 max-w-3xl text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
            {section.title_black} <span className="text-gradient-gold">{section.title_gold}</span>
          </h2>
        </Reveal>

        <div 
          onMouseLeave={() => setActive(null)}
          className="mt-14 flex h-[400px] gap-4 max-lg:flex-col max-lg:h-auto w-full"
        >
          {flavours.map((f, i) => {
            const isActive = active === i;

            return (
              <div
                key={f.name}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(isActive ? null : i)}
                className={cn(
                  "relative overflow-hidden rounded-[2rem] border border-cream/10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] h-full cursor-pointer group shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
                  isActive ? "lg:flex-[3.5] max-lg:h-52" : "lg:flex-[1]",
                  "max-lg:h-28 max-lg:w-full"
                )}
              >
                {/* Background Image with Brightness Effect */}
                <img
                  src={getImageUrl(f.image)}
                  alt={f.name}
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                    isActive ? "scale-105 contrast-100 brightness-[0.7]" : "scale-100 contrast-95 brightness-[0.35] group-hover:brightness-[0.4]"
                  )}
                />
                
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-ink/40" />

                {/* Content */}
                <div className="relative flex h-full w-full flex-col justify-between p-6 z-10 box-border">
                  
                  {/* Top spacing to push middle down */}
                  <div className="h-8"></div>
                  
                  {/* Middle Title and rotated title */}
                  <div className="flex flex-col h-full justify-center">
                    {/* Collapsed State: Vertically rotated text */}
                    {!isActive && (
                      <div className="hidden lg:flex items-center justify-center absolute inset-0 select-none">
                        <span className="font-display text-xl font-extrabold text-cream/70 tracking-[0.15em] uppercase rotate-[-90deg] whitespace-nowrap origin-center">
                          {f.name}
                        </span>
                      </div>
                    )}

                    {/* Expanded State: Normal Title and Description */}
                    <div className={cn(
                      "transition-all duration-500",
                      isActive ? "opacity-100 translate-y-0" : "max-lg:translate-y-2 lg:opacity-0 lg:translate-x-4"
                    )}>
                      <h3 className="font-display text-xl lg:text-3xl font-extrabold text-cream tracking-tight uppercase">
                        {f.name}
                      </h3>
                      {isActive && (
                        <p className="mt-2 max-w-sm text-xs lg:text-sm leading-relaxed text-cream/80 font-medium animate-in fade-in duration-300">
                          {f.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-end justify-between w-full">
                    {/* Expanded Shop Button */}
                    <div className={cn(
                      "transition-all duration-500",
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    )}>
                      <Link to="/shop">
                        <BrandButton variant="gold" size="sm" className="group">
                          Shop Now
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </BrandButton>
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
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


function WhyOurGummies({ content }: { content: any }) {
  const rawWhy = content?.why || {};
  const why = {
    eyebrow: rawWhy.eyebrow || "WHY OUR GUMMIES",
    title: rawWhy.title || "BUILT TO BE TAKEN, NOT JUST BOUGHT.",
    sub: rawWhy.sub || "Most supplements fail on the shelf, not in the lab. We designed ours to be the part of your day you actually look forward to.",
    image: rawWhy.image || IMG.multi,
    stat_value: rawWhy.stat_value || "98%",
    stat_text: rawWhy.stat_text || "of customers say they'd never go back to tablets.",
    features: rawWhy.features || whys
  };

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10">
      <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="relative">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[image:var(--gradient-gold)] p-8">
            <img
              src={getImageUrl(why.image)}
              alt="Sonrup multivitamin gummies packaging"
              className="w-full aspect-[4/5] rounded-[1.8rem] object-cover shadow-[var(--shadow-lift)]"
            />
          </div>
          <div className="float-slow absolute -bottom-8 right-2 md:-right-4 max-w-[200px] md:max-w-[220px] rounded-3xl bg-card p-4 md:p-5 shadow-[var(--shadow-lift)]">
            <p className="font-display text-4xl font-extrabold">{why.stat_value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{why.stat_text}</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <Eyebrow className="border-muted bg-muted/30 text-muted-foreground">{why.eyebrow}</Eyebrow>
            <h2 className="display-xl mt-5 text-4xl leading-[0.9] sm:text-5xl lg:text-[3.5rem]">{why.title}</h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {why.sub}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2">
            {why.features.map((feature: any, i: number) => {
              const Icon = typeof feature.icon === "string" ? (iconMap[feature.icon] || BadgeCheck) : (feature.icon || BadgeCheck);
              const desc = feature.text || feature.desc || "Description missing.";
              return (
                <Reveal key={i} delay={i * 80} className="relative">
                  <div className="absolute -left-3 top-0 h-[42px] w-[42px] rounded-full bg-primary/10" />
                  <div className="relative">
                    <Icon className="h-[22px] w-[22px] text-ink/80" />
                    <h3 className="mt-5 text-[11px] font-bold uppercase tracking-widest">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </Reveal>
              );
            })}
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

function IngredientStory({ content }: { content: any }) {
  const rawStory = content?.ingredient_story || {};
  const story = {
    eyebrow: rawStory.eyebrow || "Ingredient story",
    title: rawStory.title || "What's inside the tube",
    sub: rawStory.sub || "Every gummy is a short ingredient list you could read out loud without flinching.",
    image: rawStory.image || IMG.shilajit,
    ingredients: rawStory.ingredients || ringItems,
  };

  const positions = ["left-0 top-6", "left-0 bottom-24", "right-0 top-16", "right-0 bottom-16"];

  return (
    <section className="relative overflow-hidden bg-muted/50 py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow={story.eyebrow}
            title={<>{story.title}</>}
            sub={story.sub}
          />
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/15" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/10" />

          <div className="relative mx-auto w-[min(70vw,320px)]">
            <img
              src={getImageUrl(story.image)}
              alt="Sonrup gummies ingredients"
              className="float-slow w-full aspect-[3/4] rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
            />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0 lg:block">
            {story.ingredients.map((it: any, i: number) => (
              <Reveal key={i} delay={i * 120} className={cn("lg:absolute lg:w-56", positions[i] || "left-0 top-0")}>
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


/* ---------------- BRAND STORY ---------------- */

function BrandStory({ content }: { content: any }) {
  const rawStory = content?.brand_story || {};
  const story = {
    eyebrow: rawStory.eyebrow || "Our story",
    title_black1: rawStory.title_black1 || "We started with a",
    title_gold: rawStory.title_gold || " half-empty ",
    title_black2: rawStory.title_black2 || "bottle of vitamins.",
    paragraph1: rawStory.paragraph1 || "Every household has one — bought with the best intentions, abandoned by week three. Sonrup began by asking a simpler question: what if taking your vitamins was the nicest thirty seconds of your morning?",
    paragraph2: rawStory.paragraph2 || "So we formulate backwards. Taste first, then texture, then the actives — never sacrificing the dose to get there. Small batches, honest labels, and packaging you don't have to hide in a cupboard.",
    cta_text: rawStory.cta_text || "Read our story",
    cta_link: rawStory.cta_link || "/about",
    main_image: rawStory.main_image || IMG.kids,
    floating_image: rawStory.floating_image || IMG.multi,
    stats: rawStory.stats?.length ? rawStory.stats : [
      { value: "4.8★", label: "Average rating" },
      { value: "120k+", label: "Tubes shipped" },
      { value: "100%", label: "Vegetarian" },
    ]
  };

  return (
    <section className="relative overflow-hidden py-24 pb-32 md:pb-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 lg:grid-cols-2 lg:px-10">
        <Reveal>
          <Eyebrow>{story.eyebrow}</Eyebrow>
          <h2 className="display-xl mt-6 text-4xl leading-[0.9] sm:text-5xl lg:text-[4.2rem]">
            {story.title_black1}
            <span className="text-gradient-gold">{story.title_gold}</span>
            {story.title_black2}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>{story.paragraph1}</p>
            <p>{story.paragraph2}</p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {story.stats.map((s: any, i: number) => (
              <div key={i}>
                <p className="font-display text-3xl font-extrabold">{s.value || s[0]}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{s.label || s[1]}</p>
              </div>
            ))}
          </div>
          <Link to={story.cta_link} className="mt-10 inline-block">
            <BrandButton variant="outline" size="lg">
              {story.cta_text}
            </BrandButton>
          </Link>
        </Reveal>

        <Reveal delay={140} className="relative">
          <img
            src={getImageUrl(story.main_image)}
            alt="Sonrup main story image"
            className="ml-auto w-[76%] aspect-[3/4] rounded-[2.5rem] object-cover shadow-[var(--shadow-lift)]"
          />
          <img
            src={getImageUrl(story.floating_image)}
            alt="Sonrup floating story image"
            className="float-slow absolute bottom-[-3rem] left-0 w-[46%] aspect-square rounded-[2rem] object-cover shadow-[var(--shadow-lift)]"
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- REVIEWS ---------------- */

function Reviews({ content }: { content: any }) {
  const { data: reviewsList = [] } = useReviews();

  const section = content?.reviews_section || {
    eyebrow: "Reviews",
    title: "Loved by 120,000+ mornings"
  };

  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          <SectionTitle eyebrow={section.eyebrow} title={<>{section.title}</>} />
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

function SocialGrid({ content }: { content: any }) {
  const section = content?.social_section || {
    eyebrow: "@sonrup",
    title: "Join the gummy club",
    cta_text: "Follow us",
    cta_link: "#",
    images: []
  };

  const rawTiles = Array.isArray(section.images) && section.images.length > 0 ? section.images : [IMG.multi, IMG.kids, IMG.shilajit, IMG.kids, IMG.multi, IMG.shilajit];
  const tiles = rawTiles.filter(Boolean);

  let displayTiles = [...tiles];
  if (tiles.length > 0) {
    while (displayTiles.length < 12) {
      displayTiles = [...displayTiles, ...tiles];
    }
  }
  const marqueeTiles = [...displayTiles, ...displayTiles];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || marqueeTiles.length === 0) return;
    
    let animationFrameId: number;
    let isHovered = false;

    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => { isHovered = false; };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    const scroll = () => {
      if (!isHovered && el && !isMouseDown) {
        el.scrollLeft += 0.8; // smooth crawl speed
        
        // Loop scrolling seamlessly:
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        } else if (el.scrollLeft < 0) {
          el.scrollLeft += halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [tiles, isMouseDown, marqueeTiles.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setDragged(false);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    
    if (Math.abs(x - startX) > 5) {
      setDragged(true);
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk;

    // Loop check for drag scrolling:
    const el = scrollRef.current;
    const halfWidth = el.scrollWidth / 2;
    if (el.scrollLeft >= halfWidth) {
      el.scrollLeft -= halfWidth;
      setStartX(x);
      setScrollLeft(el.scrollLeft);
    } else if (el.scrollLeft < 0) {
      el.scrollLeft += halfWidth;
      setStartX(x);
      setScrollLeft(el.scrollLeft);
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <SectionTitle eyebrow={section.eyebrow} title={<>{section.title}</>} />
        </Reveal>
        <Reveal delay={100}>
          {section.cta_link && section.cta_link !== "#" ? (
            <a href={section.cta_link} target="_blank" rel="noopener noreferrer">
              <BrandButton variant="ink" size="lg">
                {section.cta_text}
              </BrandButton>
            </a>
          ) : (
            <BrandButton variant="ink" size="lg">
              {section.cta_text}
            </BrandButton>
          )}
        </Reveal>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mt-16 overflow-hidden w-full select-none">
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto pb-12 pt-8 no-scrollbar cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {marqueeTiles.map((src: string, index: number) => {
            const originalIndex = index % tiles.length;
            const link = section.image_links?.[originalIndex] || "#";
            const isLink = link !== "#" && link !== "";
            
            const ImageWrapper = ({ children }: { children: React.ReactNode }) => 
              isLink ? (
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block h-full w-full"
                  onClick={(e) => {
                    if (dragged) {
                      e.preventDefault();
                    }
                  }}
                >
                  {children}
                </a>
              ) : (
                <div className="h-full w-full">{children}</div>
              );

            // Stagger pattern based on the index to make it wave-like!
            const staggerClass = index % 3 === 0 ? "-translate-y-4" : index % 3 === 1 ? "translate-y-4" : "translate-y-0";

            return (
              <div 
                key={index} 
                className={cn("shrink-0 w-[220px] md:w-[280px] transition-transform duration-500", staggerClass)}
              >
                <div className="group overflow-hidden rounded-3xl bg-muted/20 w-full aspect-[4/5] shadow-md hover:shadow-xl transition-all duration-300">
                  <ImageWrapper>
                    <img
                      src={getImageUrl(src)}
                      alt="Sonrup gummies lifestyle"
                      loading="lazy"
                      draggable="false"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 select-none"
                    />
                  </ImageWrapper>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FaqTeaser({ content }: { content: any }) {
  const [open, setOpen] = useState(0);
  const { data: faqs = [] } = useFaqs();

  const section = content?.faq_settings?.home_section || {
    eyebrow: "FAQ",
    title: "Good questions, straight answers",
    cta_text: "All FAQs"
  };

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionTitle eyebrow={section.eyebrow} title={<>{section.title}</>} />
          <Link to="/faq" className="mt-6 inline-block">
            <BrandButton variant="outline">{section.cta_text}</BrandButton>
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

function FinalCta({ content }: { content: any }) {
  const section = content?.final_cta || {
    title_white: "Ready to make your day a little ",
    title_gold: "sweeter?",
    button_1_text: "Shop all gummies",
    button_1_link: "/shop",
    button_2_text: "Best sellers",
    button_2_link: "/shop?sort=bestsellers",
    image_left: "",
    image_right: ""
  };

  const imgLeft = section.image_left || IMG.multi;
  const imgRight = section.image_right || IMG.kids;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-ink px-6 py-20 text-center text-cream sm:px-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 blob bg-primary/25 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 blob bg-secondary/25 blur-[80px]" />
        <img
          src={getImageUrl(imgLeft)}
          alt=""
          aria-hidden
          className="float-slow pointer-events-none absolute -left-10 bottom-0 hidden w-48 rotate-[-12deg] rounded-3xl opacity-90 lg:block object-cover h-64"
        />
        <img
          src={getImageUrl(imgRight)}
          alt=""
          aria-hidden
          className="float-fast pointer-events-none absolute -right-8 top-4 hidden w-48 rotate-[10deg] rounded-3xl opacity-90 lg:block object-cover h-64"
        />
        <div className="relative">
          <h2 className="display-xl mx-auto max-w-3xl text-4xl leading-[0.92] sm:text-5xl lg:text-6xl">
            {section.title_white} <span className="text-gradient-gold">{section.title_gold}</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to={section.button_1_link}>
              <BrandButton variant="gold" size="lg">
                {section.button_1_text}
              </BrandButton>
            </Link>
            <Link to={section.button_2_link}>
              <BrandButton size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream hover:text-ink">
                {section.button_2_text}
              </BrandButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
