import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Lock, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Container, Crumbs, EmptyState, RouteError } from "@/components/site/Page";
import { BrandButton } from "@/components/site/Primitives";
import { FREE_SHIPPING_THRESHOLD, inr } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sonrup Gummies" },
      { name: "description", content: "Secure checkout for your Sonrup gummies. UPI, cards, net banking and COD." },
      { property: "og:title", content: "Checkout — Sonrup Gummies" },
      { property: "og:description", content: "Complete your order in a few quick steps." },
    ],
  }),
  errorComponent: RouteError,
  component: Checkout,
});

const PAYMENTS = [
  { id: "upi", label: "UPI", note: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", note: "Credit & debit" },
  { id: "netbanking", label: "Net banking", note: "All major banks" },
  { id: "cod", label: "Cash on delivery", note: "Orders under ₹2,000" },
];

function Checkout() {
  const { lines, subtotal, clear } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState<string | null>(null);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 59;

  if (done) {
    return (
      <main>
        <Container className="py-20">
          <div className="surface-card mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[image:var(--gradient-gold)]">
              <CheckCircle2 className="h-9 w-9 text-ink" />
            </div>
            <h1 className="display-xl text-4xl">Order confirmed</h1>
            <p className="text-sm text-muted-foreground">
              Order <span className="font-bold text-foreground">{done}</span> is being packed. You'll get a
              tracking link by SMS and email at dispatch.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link to="/account">
                <BrandButton variant="solid">View orders</BrandButton>
              </Link>
              <Link to="/shop">
                <BrandButton variant="outline">Keep shopping</BrandButton>
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main>
        <Container className="py-16">
          <EmptyState
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Nothing to check out"
            body="Your cart is empty — pick a tube first."
            action={
              <Link to="/shop">
                <BrandButton variant="solid">Shop gummies</BrandButton>
              </Link>
            }
          />
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className="py-10 sm:py-14">
        <Crumbs items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
        <h1 className="display-xl mt-6 text-4xl sm:text-6xl">Checkout</h1>

        <div className="mt-8 flex items-center gap-3">
          {["Contact", "Shipping", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                  step >= i + 1 ? "bg-ink text-cream" : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}. {s}
              </span>
              {i < 2 && <span className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step < 3) {
                setStep(step + 1);
                return;
              }
              const id = `SNR-${Math.floor(100000 + Math.random() * 899999)}`;
              clear();
              setDone(id);
              toast.success("Order placed successfully");
              void navigate;
            }}
            className="surface-card grid gap-6 p-6 sm:p-8"
          >
            {step === 1 && (
              <Section title="Contact details">
                <Grid>
                  <Field label="Full name" placeholder="Janvi Vasani" />
                  <Field label="Phone" placeholder="98200 00000" />
                </Grid>
                <Field label="Email" type="email" placeholder="you@email.com" />
              </Section>
            )}

            {step === 2 && (
              <Section title="Shipping address">
                <Field label="Address line" placeholder="Flat / house, street" />
                <Grid>
                  <Field label="City" placeholder="Mumbai" />
                  <Field label="State" placeholder="Maharashtra" />
                </Grid>
                <Grid>
                  <Field label="Pincode" placeholder="400069" />
                  <Field label="Landmark (optional)" required={false} placeholder="Near the park" />
                </Grid>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-4 w-4 text-secondary" /> Delivered in 2–5 working days across India.
                </p>
              </Section>
            )}

            {step === 3 && (
              <Section title="Payment method">
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENTS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPay(p.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        pay === p.id
                          ? "border-secondary bg-secondary/8 shadow-[var(--shadow-soft)]"
                          : "border-border hover:border-ink/30",
                      )}
                    >
                      <p className="font-display text-lg font-extrabold">{p.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
                    </button>
                  ))}
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 text-leaf" /> Payments are encrypted end to end.
                </p>
              </Section>
            )}

            <div className="flex flex-wrap gap-3">
              {step > 1 && (
                <BrandButton type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </BrandButton>
              )}
              <BrandButton type="submit" variant="solid" size="lg">
                {step < 3 ? "Continue" : `Pay ${inr(subtotal + shipping)}`}
                {step === 3 && <CreditCard className="h-4 w-4" />}
              </BrandButton>
            </div>
          </form>

          <aside className="surface-card h-fit p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-2xl font-extrabold">Order summary</h2>
            <div className="mt-5 grid gap-4">
              {lines.map(({ product, qty }) => (
                <div key={product.slug} className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="h-16 w-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-tight">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {qty}</p>
                  </div>
                  <span className="text-sm font-semibold">{inr(product.price * qty)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold">{shipping === 0 ? "Free" : inr(shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <dt className="font-display text-lg font-extrabold">Total</dt>
                <dd className="font-display text-2xl font-extrabold">{inr(subtotal + shipping)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Container>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input className="field" type={type} placeholder={placeholder} required={required} />
    </label>
  );
}
