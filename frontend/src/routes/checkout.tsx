import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Lock, ShoppingBag, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Container, Crumbs, EmptyState, RouteError } from "@/components/site/Page";
import { BrandButton } from "@/components/site/Primitives";
import { inr } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useAuth, type Order } from "@/lib/auth";
import { apiAddOrder, useIntegrationsSettings, getImageUrl } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "";
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
  { id: "online", label: "Pay Online", note: "UPI, Cards, Net banking (via Razorpay)" },
  { id: "cod", label: "Cash on delivery", note: "Pay with cash or UPI on delivery" },
];

function Checkout() {
  const { lines, subtotal, clear } = useStore();
  const { user, addresses, addOrderLocal } = useAuth();
  const navigate = useNavigate();
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(defaultAddress?.id || "new");
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState("online");
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: settings } = useIntegrationsSettings();
  const isOnlineActive = settings?.razorpay_active !== false;

  useEffect(() => {
    if (settings && settings.razorpay_active === false && pay === "online") {
      setPay("cod");
    }
  }, [settings, pay]);

  const FREE_SHIPPING_THRESHOLD = settings?.free_shipping_amount ?? 499;
  const SHIPPING_CHARGE = settings?.shipping_charge ?? 59;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };



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
          {["Details", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                  step >= i + 1 ? "bg-ink text-cream" : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}. {s}
              </span>
              {i < 1 && <span className="h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (step < 2) {
                setStep(step + 1);
                return;
              }
              const id = `SNR-${Math.floor(100000 + Math.random() * 899999)}`;
              
              const formData = new FormData(e.currentTarget);
              const customerName = formData.get("customer_name") as string || "Guest";
              const customerEmail = formData.get("customer_email") as string || "guest@example.com";
              const customerPhone = formData.get("customer_phone") as string || "";
              
              const shippingAddress = {
                line1: formData.get("line1") as string || "",
                city: formData.get("city") as string || "",
                state: formData.get("state") as string || "",
                pincode: formData.get("pincode") as string || "",
                landmark: formData.get("landmark") as string || "",
              };

              const newOrder = {
                id,
                date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                status: "Processing",
                total: subtotal + shipping,
                items: lines.map((l) => ({
                  slug: l.product.slug,
                  name: l.product.name,
                  image: l.product.image,
                  price: l.product.price,
                  count: l.product.count,
                  qty: l.qty,
                })),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                shipping_address: shippingAddress,
                payment_method: pay,
              };

              if (pay === "online") {
                setIsProcessing(true);
                const res = await loadRazorpay();
                if (!res) {
                  toast.error("Razorpay SDK failed to load. Are you online?");
                  setIsProcessing(false);
                  return;
                }
                
                try {
                  const orderRes = await fetch(`${API_URL}/api/razorpay/create-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: Number(subtotal + shipping) })
                  }).then(r => r.json());
                  
                  if (!orderRes.order_id) throw new Error("Failed to create Razorpay order");
                  
                  const options = {
                    key: settings?.razorpay_key_id,
                    amount: (subtotal + shipping) * 100,
                    currency: "INR",
                    name: "Sonrup Nutrition",
                    description: "Order Payment",
                    order_id: orderRes.order_id,
                    handler: async function (response: any) {
                      try {
                        const verifyRes = await fetch(`${API_URL}/api/razorpay/verify`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                          })
                        }).then(r => r.json());
                        
                        if (verifyRes.success) {
                             if (user) { addOrderLocal(newOrder as any); }
                             apiAddOrder(newOrder).then((res) => {
                              if (res?.token) {
                                localStorage.setItem("sonrup_token", res.token);
                              }
                              localStorage.setItem("sonrup_last_order_id", id);
                              clear();
                              window.location.href = `/order-success?orderId=${id}`;
                            }).catch((err) => {
                              console.error(err);
                              localStorage.setItem("sonrup_last_order_id", id);
                              clear();
                              window.location.href = `/order-success?orderId=${id}`;
                            });
                            toast.success("Order placed successfully");
                         } else {
                           toast.error("Payment verification failed");
                        }
                      } catch (err) {
                        toast.error("Error verifying payment");
                      }
                      setIsProcessing(false);
                    },
                    prefill: {
                      name: customerName,
                      email: customerEmail,
                      contact: customerPhone
                    },
                    theme: { color: "#cc5f39" },
                    modal: {
                      ondismiss: function() {
                        setIsProcessing(false);
                      }
                    }
                  };
                  const rzp1 = new (window as any).Razorpay(options);
                  rzp1.open();
                } catch (err) {
                  toast.error("Could not initiate Razorpay");
                  setIsProcessing(false);
                }
              } else {
                if (user) {
                  addOrderLocal(newOrder as any);
                }
                apiAddOrder(newOrder).then((res) => {
                  if (res?.token) {
                    localStorage.setItem("sonrup_token", res.token);
                  }
                  localStorage.setItem("sonrup_last_order_id", id);
                  clear();
                  window.location.href = `/order-success?orderId=${id}`;
                }).catch((err) => {
                  console.error(err);
                  localStorage.setItem("sonrup_last_order_id", id);
                  clear();
                  window.location.href = `/order-success?orderId=${id}`;
                });
                toast.success("Order placed successfully");
              }
            }}
            className="surface-card grid gap-6 p-6 sm:p-8"
          >
            <div className={step === 1 ? "grid gap-12" : "hidden"}>
              <div className="grid gap-12">
                <Section title="Contact details">
                  <Grid>
                    <Field label="Full name" name="customer_name" placeholder="John Doe" defaultValue={user?.name} />
                    <Field label="Phone" name="customer_phone" placeholder="9876543210" defaultValue={user?.phone} />
                  </Grid>
                  <Field label="Email" name="customer_email" type="email" placeholder="john.doe@example.com" defaultValue={user?.email} />
                </Section>
                <Section title="Shipping address">
                {addresses.length > 0 && (
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAddressId(a.id)}
                        className={cn(
                          "relative cursor-pointer rounded-2xl border p-4 text-left transition-all",
                          selectedAddressId === a.id
                            ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                            : "border-border hover:border-primary/30",
                        )}
                      >
                        {a.isDefault && (
                          <span className="absolute right-3 top-3 rounded-full bg-secondary/10 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-secondary">
                            Default
                          </span>
                        )}
                        <p className="font-display font-extrabold pr-10">
                          {a.label} <span className="ml-1 text-sm font-medium text-muted-foreground">({a.name})</span>
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {a.line1}, {a.city}, {a.state} {a.pincode}
                        </p>
                      </div>
                    ))}
                    <div
                      onClick={() => setSelectedAddressId("new")}
                      className={cn(
                        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all hover:text-foreground",
                        selectedAddressId === "new"
                          ? "border-primary bg-primary/5 text-primary shadow-[var(--shadow-soft)]"
                          : "border-dashed border-border text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      <span className="text-xs font-extrabold uppercase tracking-widest">Ship to new address</span>
                    </div>
                  </div>
                )}

                <div key={selectedAddressId} className="grid gap-5">
                  <Field label="Address line" name="line1" placeholder="123 Main St" defaultValue={addresses.find(a => a.id === selectedAddressId)?.line1} />
                  <Grid>
                    <Field label="City" name="city" placeholder="City Name" defaultValue={addresses.find(a => a.id === selectedAddressId)?.city} />
                    <Field label="State" name="state" placeholder="State Name" defaultValue={addresses.find(a => a.id === selectedAddressId)?.state} />
                  </Grid>
                  <Grid>
                    <Field label="Pincode" name="pincode" placeholder="123456" defaultValue={addresses.find(a => a.id === selectedAddressId)?.pincode} />
                    <Field label="Landmark (optional)" name="landmark" required={false} placeholder="Near the park" defaultValue={addresses.find(a => a.id === selectedAddressId)?.landmark} />
                  </Grid>
                </div>

                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-4 w-4 text-secondary" /> Delivered in 2–5 working days across India.
                </p>
              </Section>
              </div>
            </div>

            {step === 2 && (
              <Section title="Payment method">
                <div className="grid gap-4 sm:grid-cols-2">
                  {PAYMENTS.map((p) => {
                    const isSelected = pay === p.id;
                    const Icon = p.id === "online" ? CreditCard : Truck;
                    const isDisabled = p.id === "online" && !isOnlineActive;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setPay(p.id)}
                        className={cn(
                          "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                          isSelected
                            ? "border-ink bg-sand/30 shadow-[var(--shadow-soft)] scale-[1.01] ring-1 ring-ink/5"
                            : "border-border bg-card hover:border-ink/40 hover:bg-sand/10 hover:shadow-sm",
                          isDisabled && "opacity-55 cursor-not-allowed hover:border-border hover:bg-card hover:shadow-none"
                        )}
                      >
                        {/* Radio indicator */}
                        <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink/30 transition-colors group-hover:border-ink">
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-ink animate-in fade-in zoom-in duration-200" />
                          )}
                        </div>

                        {/* Text details & Icon */}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-base font-extrabold tracking-tight text-ink">
                              {p.label}
                            </span>
                            <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isSelected ? "text-ink" : "text-muted-foreground")} />
                          </div>
                          {p.note && (
                            <p className="text-xs text-muted-foreground leading-relaxed pr-4">
                              {isDisabled ? "Online payment is currently unavailable" : p.note}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {step > 1 && (
                <BrandButton
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="min-w-[120px] py-3.5"
                >
                  Back
                </BrandButton>
              )}
              <BrandButton
                type="submit"
                variant="solid"
                disabled={isProcessing}
                className={cn(
                  "min-w-[180px] py-3.5 shadow-md hover:shadow-lg transition-all",
                  step === 2 && "bg-secondary hover:bg-secondary/90"
                )}
              >
                {isProcessing ? "Processing..." : step < 2 ? "Continue" : `Pay ${inr(subtotal + shipping)}`}
                {step === 2 && !isProcessing && <CreditCard className="h-4 w-4 shrink-0" />}
              </BrandButton>
            </div>
          </form>

          <aside className="surface-card h-fit p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-2xl font-extrabold">Order summary</h2>
            <div className="mt-5 grid gap-4">
              {lines.map(({ product, qty }) => (
                <div key={product.slug} className="flex items-center gap-3">
                  <img src={getImageUrl(product.image)} alt={product.name} className="h-16 w-14 rounded-xl object-cover" />
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
  defaultValue,
  name,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  name?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input className="field" type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} name={name} />
    </label>
  );
}
