import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Container, EmptyState, RouteError } from "@/components/site/Page";
import { BrandButton, Eyebrow, Reveal } from "@/components/site/Primitives";
import { useAuth } from "@/lib/auth";
import { inr, orders, products } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Profile — Sonrup Nutrition" },
      { name: "description", content: "Manage your Sonrup profile, track orders, save addresses and review your wishlist." },
      { property: "og:title", content: "My Profile — Sonrup Nutrition" },
      { property: "og:description", content: "Your Sonrup profile, orders, addresses and saved gummies in one place." },
    ],
  }),
  component: AccountPage,
  errorComponent: RouteError,
});

const TABS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "saved", label: "Saved", icon: Heart },
] as const;

type TabId = (typeof TABS)[number]["id"];

const statusTone: Record<string, string> = {
  Delivered: "bg-leaf/15 text-leaf",
  Shipped: "bg-sky/15 text-sky",
  Processing: "bg-primary/25 text-ink",
  Cancelled: "bg-secondary/12 text-secondary",
};

function AccountPage() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("profile");

  useEffect(() => {
    if (ready && !user) void navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-border border-t-primary" />
      </main>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main>
      {/* Profile banner */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="aurora pointer-events-none absolute -left-32 -top-40 h-[520px] w-[520px] blob bg-primary/25 blur-[110px]" />
        <div className="aurora pointer-events-none absolute -right-20 bottom-[-10rem] h-[420px] w-[420px] blob bg-secondary/20 blur-[110px] [animation-delay:-6s]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.12]" />
        <Container className="relative py-14 lg:py-20">
          <div className="mask-rise">
            <Eyebrow className="border-cream/15 bg-cream/[0.06] text-cream/70">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Member since 2026
            </Eyebrow>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="spin-slow absolute -inset-2 rounded-full border border-dashed border-primary/30" />
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[image:var(--gradient-gold)] font-display text-2xl font-extrabold text-ink shadow-[var(--shadow-glow)]">
                {initials || "S"}
              </div>
            </div>
            <div className="mask-rise [--d:140ms]">
              <h1 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">
                {user.name}
              </h1>
              <p className="mt-2 text-sm text-cream/60">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                toast("Signed out");
                void navigate({ to: "/" });
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-cream/20 px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cream/80 transition-all hover:bg-cream/10 hover:text-cream"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </Container>
      </section>

      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Tabs */}
          <nav className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 lg:sticky lg:top-32 lg:h-fit lg:flex-col">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "group flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-[0.16em] transition-all duration-400",
                  tab === id
                    ? "bg-ink text-cream shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", tab === id && "text-primary")} />
                {label}
              </button>
            ))}
          </nav>

          <div key={tab} className="[animation:rise-in_0.6s_both]">
            {tab === "profile" && <ProfilePanel />}
            {tab === "orders" && <OrdersPanel />}
            {tab === "addresses" && <AddressPanel />}
            {tab === "saved" && <SavedPanel />}
          </div>
        </div>
      </Container>
    </main>
  );
}

function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="surface-card p-7 md:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.03em]">Personal details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Used for delivery updates and order receipts.</p>
          </div>
          <button
            onClick={() => setEditing((e) => !e)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] transition-colors hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateUser({ name: name.trim() || user!.name, phone });
              setEditing(false);
              toast.success("Profile updated");
            }}
            className="mt-7 grid gap-4 sm:grid-cols-2"
          >
            <Input label="Full name" value={name} onChange={setName} />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
            <div className="sm:col-span-2">
              <BrandButton type="submit" variant="solid">
                Save changes
              </BrandButton>
            </div>
          </form>
        ) : (
          <dl className="mt-7 grid gap-5 sm:grid-cols-3">
            {[
              { k: "Name", v: user?.name },
              { k: "Email", v: user?.email },
              { k: "Phone", v: user?.phone || "Not added yet" },
            ].map((row) => (
              <div key={row.k} className="rounded-2xl bg-muted/60 px-5 py-4">
                <dt className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{row.k}</dt>
                <dd className="mt-1.5 truncate text-sm font-bold">{row.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="surface-card flex items-center gap-4 p-7">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/20 text-ink">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">Account secured</h3>
          <p className="mt-1 text-xs text-muted-foreground">Stored locally in this browser for the demo.</p>
        </div>
      </div>

      <div className="surface-card flex items-center gap-4 p-7">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary/12 text-secondary">
          <Package className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-lg font-extrabold">{orders.length} orders placed</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Lifetime value {inr(orders.reduce((s, o) => s + o.total, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel() {
  return (
    <div className="space-y-5">
      {orders.map((o, i) => (
        <Reveal key={o.id} delay={i * 80}>
          <article className="surface-card lift overflow-hidden">
            <div className="flex flex-wrap items-center gap-4 border-b border-border/70 px-6 py-5">
              <div>
                <p className="font-display text-lg font-extrabold tracking-[-0.02em]">{o.id}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Placed {o.date}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]",
                  statusTone[o.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {o.status}
              </span>
              <p className="ml-auto font-display text-lg font-extrabold">{inr(o.total)}</p>
            </div>
            <div className="flex flex-wrap gap-5 px-6 py-5">
              {o.items.map((p) => (
                <Link
                  key={p.slug}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-center gap-4"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-16 w-14 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div>
                    <p className="text-sm font-bold group-hover:text-secondary">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

function AddressPanel() {
  const { addresses, addAddress, removeAddress } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {addresses.map((a, i) => (
          <Reveal key={a.id} delay={i * 70}>
            <div className="surface-card relative h-full p-6">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink">
                {a.label}
              </span>
              <p className="mt-4 font-display text-lg font-extrabold">{a.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {a.line1}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.phone}
              </p>
              <button
                aria-label="Remove address"
                onClick={() => {
                  removeAddress(a.id);
                  toast("Address removed");
                }}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        ))}

        <button
          onClick={() => setOpen((o) => !o)}
          className="group flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border p-6 text-muted-foreground transition-all hover:border-primary hover:text-foreground"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-muted transition-transform group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">Add new address</span>
        </button>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addAddress(form);
            setForm({ label: "Home", name: "", line1: "", city: "", state: "", pincode: "", phone: "" });
            setOpen(false);
            toast.success("Address saved");
          }}
          className="surface-card grid gap-4 p-7 sm:grid-cols-2 [animation:rise-in_0.5s_both]"
        >
          <Input label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
          <Input label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="sm:col-span-2">
            <Input label="Address" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} />
          </div>
          <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div className="sm:col-span-2">
            <BrandButton type="submit" variant="solid">
              Save address
            </BrandButton>
          </div>
        </form>
      )}
    </div>
  );
}

function SavedPanel() {
  const { wishlist } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.slug));

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-8 w-8" />}
        title="Nothing saved yet"
        body="Tap the heart on any gummy to keep it here for later."
        action={
          <Link to="/wishlist">
            <BrandButton variant="solid">Open wishlist</BrandButton>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {saved.map((p, i) => (
        <Reveal key={p.slug} delay={i * 70}>
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="surface-card lift flex items-center gap-5 p-5"
          >
            <img src={p.image} alt={p.name} className="h-20 w-16 rounded-xl object-cover" />
            <div>
              <p className="font-display text-lg font-extrabold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.tagline}</p>
            </div>
            <p className="ml-auto font-display text-lg font-extrabold">{inr(p.price)}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-primary focus:shadow-[var(--shadow-glow)]"
      />
    </label>
  );
}
