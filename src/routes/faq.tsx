import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal } from "@/components/site/Primitives";
import { faqs } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Sonrup Gummies" },
      {
        name: "description",
        content:
          "Answers about Sonrup gummy ingredients, dosage, shipping, returns and payments — all in one place.",
      },
      { property: "og:title", content: "FAQs — Sonrup Gummies" },
      { property: "og:description", content: "Everything you wanted to ask about our daily gummies." },
    ],
  }),
  errorComponent: RouteError,
  component: Faq,
});

function Faq() {
  const categories = useMemo(() => ["All", ...Array.from(new Set(faqs.map((f) => f.category)))], []);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);

  const list = faqs.filter(
    (f) =>
      (cat === "All" || f.category === cat) &&
      (q.trim() === "" || (f.q + f.a).toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <main>
      <PageHero
        eyebrow="Help centre"
        title={
          <>
            Questions,
            <span className="text-gradient-gold"> answered.</span>
          </>
        }
        sub="Ingredients, dosage, delivery and returns — if it isn't here, our team replies within one working day."
      />

      <Container className="py-14 sm:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-all",
                  cat === c
                    ? "border-transparent bg-ink text-cream"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex w-full items-center gap-3 rounded-full border border-border bg-card px-5 py-3 lg:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-3">
          {list.map((f, i) => {
            const isOpen = open === f.q;
            return (
              <Reveal key={f.q} delay={i * 40}>
                <div className="surface-card overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : f.q)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  >
                    <span className="font-display text-lg font-extrabold sm:text-xl">{f.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-180 text-secondary",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
          {list.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No questions matched that search.
            </p>
          )}
        </div>

        <div className="surface-card mt-12 flex flex-col items-center gap-4 px-6 py-12 text-center">
          <h3 className="display-xl text-3xl">Still stuck?</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Our care team is on email and WhatsApp, Monday to Saturday.
          </p>
          <Link to="/contact">
            <BrandButton variant="solid">Contact us</BrandButton>
          </Link>
        </div>
      </Container>
    </main>
  );
}
