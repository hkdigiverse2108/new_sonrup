import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiSubscribeNewsletter, useContactContent, usePolicies } from "@/lib/api";
import { BrandButton } from "./Primitives";

export function Footer() {
  const { data: contactContent } = useContactContent();
  const { data: policies = [] } = usePolicies();

  const email = contactContent?.channels?.find((c: any) => c.icon?.toLowerCase() === "mail" || c.label?.toLowerCase()?.includes("email"))?.value || "care@sonrup.in";
  const phone = contactContent?.channels?.find((c: any) => c.icon?.toLowerCase() === "phone" || c.label?.toLowerCase()?.includes("phone") || c.label?.toLowerCase()?.includes("call"))?.value || "+91 98200 00000";

  const waChannel = contactContent?.channels?.find((c: any) => c.icon?.toLowerCase() === "messagecircle" || c.label?.toLowerCase()?.includes("whatsapp"));
  const waChannelNumber = waChannel?.value?.replace(/\D/g, "");

  let socials = contactContent?.socials ? [...contactContent.socials] : [
    { platform: "Instagram", url: "" },
    { platform: "Facebook", url: "" },
    { platform: "YouTube", url: "" },
  ];

  // If WhatsApp is present in socials, make sure its URL is in sync with waChannelNumber if available
  const waSocialIdx = socials.findIndex((s: any) => s.platform?.toLowerCase() === "whatsapp");
  if (waSocialIdx > -1 && waChannelNumber) {
    socials[waSocialIdx] = { ...socials[waSocialIdx], url: `https://wa.me/${waChannelNumber}` };
  } else if (waSocialIdx === -1 && waChannelNumber) {
    socials.push({ platform: "WhatsApp", url: `https://wa.me/${waChannelNumber}` });
  }

  // Filter out any socials that don't have a valid URL
  socials = socials.filter((s: any) => s.url && s.url.trim() !== "" && s.url.trim() !== "#");

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return (props: any) => <Instagram {...props} />;
      case "facebook": return (props: any) => <Facebook {...props} />;
      case "youtube": return (props: any) => <Youtube {...props} />;
      case "whatsapp": return (props: any) => (
        <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
      );
      default: return (props: any) => <Instagram {...props} />;
    }
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 blob bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 blob bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Sonrup" 
                className="h-15 w-auto object-contain object-left" 
                style={{ marginLeft: "-44px" }} 
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
              Delicious daily gummies made with real fruit flavours and actives that actually earn their place.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((soc: any, i: number) => {
                const Icon = getSocialIcon(soc.platform);
                return (
                  <a
                    key={i}
                    href={soc.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 transition-all hover:border-primary hover:bg-primary hover:text-ink"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "All Gummies", to: "/shop" },
              { label: "Best Sellers", to: "/shop", search: { sort: "bestsellers" } },
              { label: "New Releases", to: "/shop", search: { sort: "new" } },
              { label: "Track Order", to: "/track-order" },
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
            <p className="mt-4 text-sm text-cream/65">Subscribe for early access to new flavours, club updates, and more.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements[0] as HTMLInputElement;
              const btn = form.elements[1] as HTMLButtonElement;
              const email = input.value;
              
              btn.disabled = true;
              btn.innerText = "Wait...";
              try {
                await apiSubscribeNewsletter(email);
                toast.success("Welcome to the club! Check your email.");
                input.value = "";
              } catch (err: any) {
                toast.error(err.message || "Something went wrong.");
              } finally {
                btn.disabled = false;
                btn.innerText = "Join";
              }
            }} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-sm outline-none placeholder:text-cream/40 focus:border-primary disabled:opacity-50"
              />
              <BrandButton variant="gold" type="submit">
                Join
              </BrandButton>
            </form>
            <div className="mt-6 space-y-2 text-sm text-cream/65">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> {email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> {phone}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sonrup. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            {policies.map((p) => (
              <Link key={p.slug} to="/policies/$slug" params={{ slug: p.slug }} className="transition-colors hover:text-primary">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string; search?: any }[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm text-cream/65">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to as any} search={l.search} className="transition-colors hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
