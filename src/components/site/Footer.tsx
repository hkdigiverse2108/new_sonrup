import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, Phone } from "lucide-react";
import { BrandButton } from "./Primitives";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 blob bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 blob bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-3xl font-extrabold lowercase tracking-[-0.06em] text-cream">
                sonrup<span className="text-primary">.</span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
              Delicious daily gummies made with real fruit flavours and actives that actually earn their place.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 transition-all hover:border-primary hover:bg-primary hover:text-ink"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "All Gummies", to: "/shop" },
              { label: "Best Sellers", to: "/shop" },
              { label: "Kids", to: "/shop" },
              { label: "Wishlist", to: "/wishlist" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { label: "About Us", to: "/about" },
              { label: "Journal", to: "/blog" },
              { label: "Contact", to: "/contact" },
              { label: "FAQs", to: "/faq" },
            ]}
          />

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Join the Gummy Club</h4>
            <p className="mt-4 text-sm text-cream/65">10% off your first tube, plus early access to new flavours.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-sm outline-none placeholder:text-cream/40 focus:border-primary"
              />
              <BrandButton variant="gold" type="submit">
                Join
              </BrandButton>
            </form>
            <div className="mt-6 space-y-2 text-sm text-cream/65">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> care@sonrup.in
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +91 98200 00000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sonrup Nutrition. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            {[
              { label: "Privacy Policy", slug: "privacy-policy" },
              { label: "Terms & Conditions", slug: "terms-and-conditions" },
              { label: "Shipping Policy", slug: "shipping-policy" },
              { label: "Refund & Cancellation", slug: "refund-and-cancellation" },
            ].map((p) => (
              <Link key={p.slug} to="/policies/$slug" params={{ slug: p.slug }} className="transition-colors hover:text-primary">
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-cream/65">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="transition-colors hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
