import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandButton, Eyebrow, Rating } from "@/components/site/Primitives";
import { RouteError } from "@/components/site/Page";
import { useAuth } from "@/lib/auth";
import { IMG } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Sonrup Nutrition" },
      { name: "description", content: "Sign in to your Sonrup account to track orders, manage addresses and save your favourite gummies." },
      { property: "og:title", content: "Sign In — Sonrup Nutrition" },
      { property: "og:description", content: "Access your Sonrup account, orders and wishlist." },
    ],
  }),
  component: LoginPage,
  errorComponent: RouteError,
});

const PERKS = [
  "Track every order live, from kitchen to doorstep",
  "Save favourite flavours to your wishlist",
  "Faster checkout with saved addresses",
];

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = mode === "login" ? login(email, password) : register(name, email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Something went wrong");
      return;
    }
    toast.success(mode === "login" ? "Welcome back" : "Account created");
    void navigate({ to: "/account" });
  };

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative overflow-hidden bg-ink px-6 py-14 text-cream lg:px-14 lg:py-20">
        <div className="aurora pointer-events-none absolute -left-32 -top-40 h-[560px] w-[560px] blob bg-primary/25 blur-[120px]" />
        <div className="aurora pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] blob bg-secondary/20 blur-[110px] [animation-delay:-8s]" />
        <div className="pointer-events-none absolute inset-0 hero-grid opacity-[0.12]" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl font-extrabold lowercase tracking-[-0.06em]">
              sonrup<span className="text-gradient-gold">.</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cream/60 transition-colors hover:text-cream"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to store
            </Link>
          </div>

          <div className="mt-16 max-w-md lg:mt-auto">
            <div className="mask-rise">
              <Eyebrow className="border-cream/15 bg-cream/[0.06] text-cream/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Members get more
              </Eyebrow>
            </div>
            <h1 className="mask-rise mt-7 font-display text-[clamp(2.3rem,6vw,3.6rem)] font-extrabold leading-[0.92] tracking-[-0.045em] [--d:120ms]">
              Your gummy routine, <span className="text-gradient-gold">remembered.</span>
            </h1>
            <ul className="mt-9 space-y-3.5">
              {PERKS.map((p, i) => (
                <li
                  key={p}
                  className="mask-rise flex items-start gap-3 text-sm text-cream/70"
                  style={{ ["--d" as string]: `${240 + i * 110}ms` }}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-14 flex items-center gap-5 lg:mt-16">
            <img
              src={IMG.multi}
              alt="Sonrup gummies"
              className="float-slow h-24 w-20 rotate-[-7deg] rounded-2xl object-cover shadow-[var(--shadow-lift)]"
            />
            <img
              src={IMG.kids}
              alt="Sonrup kids gummies"
              className="float-fast h-24 w-20 rotate-[6deg] rounded-2xl object-cover shadow-[var(--shadow-lift)] [animation-delay:-2s]"
            />
            <div className="pl-2">
              <Rating value={4.8} count={4356} />
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cream/45">
                120,000+ tubes shipped
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex items-center justify-center px-5 py-16 lg:px-14">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 blob bg-primary/15 blur-[90px]" />
        <div className="relative w-full max-w-md">
          <div className="flex rounded-full border border-border bg-muted/60 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "relative flex-1 rounded-full px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all duration-500",
                  mode === m
                    ? "bg-card text-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 key={mode} className="mt-10 font-display text-3xl font-extrabold tracking-[-0.04em] [animation:rise-in_0.6s_both]">
            {mode === "login" ? "Welcome back." : "Let's get you started."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to see your orders, addresses and saved gummies."
              : "One account for orders, wishlist and faster checkout."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <Field
                icon={<User className="h-4 w-4" />}
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Janvi Sharma"
                autoComplete="name"
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <div className="relative">
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Password"
                type={show ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-9 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="rounded-2xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary [animation:rise-in_0.4s_both]">
                {error}
              </p>
            )}

            <BrandButton type="submit" variant="solid" size="lg" className="group w-full" disabled={busy}>
              {mode === "login" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </BrandButton>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "login" ? "New to Sonrup?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4"
            >
              {mode === "login" ? "Create one" : "Sign in instead"}
            </button>
          </p>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
            This is a demo account experience — details are stored only in this browser.
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-all duration-300 focus-within:border-primary focus-within:shadow-[var(--shadow-glow)]">
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent pr-8 text-sm font-medium outline-none placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}
