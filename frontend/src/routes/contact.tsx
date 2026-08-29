import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiSubmitContact, useContactContent } from "@/lib/api";
import { Container, PageHero, RouteError } from "@/components/site/Page";
import { BrandButton, Reveal } from "@/components/site/Primitives";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Sonrup — We Reply Within a Day" },
      {
        name: "description",
        content:
          "Questions about an order, an ingredient or a bulk enquiry? Reach the Sonrup care team by email, phone or the contact form.",
      },
      { property: "og:title", content: "Contact Sonrup — We Reply Within a Day" },
      { property: "og:description", content: "Email, phone and WhatsApp support for all things gummies." },
    ],
  }),
  errorComponent: RouteError,
  component: Contact,
});

function getIcon(name: string) {
  if (name === "Mail") return Mail;
  if (name === "Phone") return Phone;
  if (name === "MessageCircle") return MessageCircle;
  if (name === "MapPin") return MapPin;
  return Mail;
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [formState, setFormState] = useState({ name: "", email: "", phone: "", message: "" });

  const { data: contactContent, isLoading } = useContactContent();

  const set = (k: keyof typeof formState) => (e: { target: { value: string } }) =>
    setFormState((f) => ({ ...f, [k]: e.target.value }));

  const hero = contactContent?.hero || { eyebrow: "Contact", title_black: "Talk to", title_gold: "real humans.", sub: "No bots, no ticket queues you never hear back from. Our small care team handles every message." };
  const channels = contactContent?.channels || [
    { icon: "Mail", label: "Email us", value: "care@sonrup.in", note: "Replies within one working day" },
    { icon: "Phone", label: "Call us", value: "+91 98200 00000", note: "Mon–Sat, 10am – 7pm IST" },
    { icon: "MessageCircle", label: "WhatsApp", value: "+91 98200 00000", note: "Fastest for order updates" },
    { icon: "MapPin", label: "Visit", value: "Andheri East, Mumbai 400069", note: "By appointment only" },
  ];
  const supportHours = contactContent?.support_hours || { text: "Support hours: Monday to Saturday, 10am – 7pm IST." };
  const formContent = contactContent?.form || { title: "Send us a message" };

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

      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {channels.map(({ icon, label, value, note }: any, i: number) => {
              const Icon = getIcon(icon);
              return (
                <Reveal key={label} delay={i * 70}>
                  <div className="surface-card lift flex gap-4 p-6">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted">
                      <Icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 font-display text-lg font-extrabold">{value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <div className="surface-card flex items-center gap-3 p-6">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                {supportHours.text}
              </p>
            </div>
          </div>

          <Reveal delay={120}>
            <div className="surface-card p-7 sm:p-10">
              {sent ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[image:var(--gradient-gold)]">
                    <Send className="h-6 w-6 text-ink" />
                  </div>
                  <h3 className="display-xl text-3xl">Message sent</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Thanks {formState.name.split(" ")[0] || "there"} — we'll reply to {formState.email} within one working
                    day.
                  </p>
                  <BrandButton variant="outline" onClick={() => setSent(false)}>
                    Send another
                  </BrandButton>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await apiSubmitContact(formState);
                      setSent(true);
                      toast.success("Message sent — we'll be in touch soon.");
                    } catch (err: any) {
                      toast.error(err.message || "Failed to send message. Please try again.");
                    }
                  }}
                  className="grid gap-8"
                >
                  <h2 className="display-xl text-3xl">{formContent.title}</h2>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <Field label="Full Name">
                      <input
                        required
                        value={formState.name}
                        onChange={set("name")}
                        className="field"
                        placeholder="e.g. Jane Doe"
                      />
                    </Field>
                    <Field label="Email Address">
                      <input
                        required
                        type="email"
                        value={formState.email}
                        onChange={set("email")}
                        className="field"
                        placeholder="jane@example.com"
                      />
                    </Field>
                  </div>
                  <Field label="Phone Number">
                    <input
                      required
                      type="tel"
                      value={formState.phone}
                      onChange={set("phone")}
                      className="field"
                      placeholder="+91 98765 43210"
                    />
                  </Field>
                  <Field label="Message">
                    <textarea
                      required
                      rows={5}
                      value={formState.message}
                      onChange={set("message")}
                      className="field resize-none"
                      placeholder="How can we help you?"
                    />
                  </Field>
                  <BrandButton variant="solid" size="lg" type="submit" className="justify-self-start mt-2">
                    Send message <Send className="h-4 w-4" />
                  </BrandButton>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
