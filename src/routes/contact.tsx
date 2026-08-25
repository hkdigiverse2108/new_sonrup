import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

const CHANNELS = [
  { icon: Mail, label: "Email us", value: "care@sonrup.in", note: "Replies within one working day" },
  { icon: Phone, label: "Call us", value: "+91 98200 00000", note: "Mon–Sat, 10am – 7pm IST" },
  { icon: MessageCircle, label: "WhatsApp", value: "+91 98200 00000", note: "Fastest for order updates" },
  { icon: MapPin, label: "Visit", value: "Andheri East, Mumbai 400069", note: "By appointment only" },
];

const SUBJECTS = ["Order support", "Product question", "Bulk / corporate", "Partnership", "Something else"];

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0]!, message: "" });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to
            <span className="text-gradient-gold"> real humans.</span>
          </>
        }
        sub="No bots, no ticket queues you never hear back from. Our small care team handles every message."
      />

      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {CHANNELS.map(({ icon: Icon, label, value, note }, i) => (
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
            ))}
            <div className="surface-card flex items-center gap-3 p-6">
              <Clock className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Support hours: Monday to Saturday, 10am – 7pm IST.
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
                    Thanks {form.name.split(" ")[0] || "there"} — we'll reply to {form.email} within one working
                    day.
                  </p>
                  <BrandButton variant="outline" onClick={() => setSent(false)}>
                    Send another
                  </BrandButton>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                    toast.success("Message sent — we'll be in touch soon.");
                  }}
                  className="grid gap-5"
                >
                  <h2 className="display-xl text-3xl">Send us a message</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name">
                      <input required value={form.name} onChange={set("name")} className="field" placeholder="Janvi Vasani" />
                    </Field>
                    <Field label="Email address">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        className="field"
                        placeholder="you@email.com"
                      />
                    </Field>
                  </div>
                  <Field label="Subject">
                    <select value={form.subject} onChange={set("subject")} className="field">
                      {SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Message">
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={set("message")}
                      className="field resize-none"
                      placeholder="Tell us what's up…"
                    />
                  </Field>
                  <BrandButton variant="solid" size="lg" type="submit" className="justify-self-start">
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
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
