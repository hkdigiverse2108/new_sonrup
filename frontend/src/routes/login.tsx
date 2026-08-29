import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandButton, Eyebrow, Rating } from "@/components/site/Primitives";
import { RouteError } from "@/components/site/Page";
import { useAuth } from "@/lib/auth";
import { IMG } from "@/lib/products";
import { cn } from "@/lib/utils";
import { useLoginContent, fetchJson } from "@/lib/api";

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
  const { data: content } = useLoginContent();
  const loginContent = content || {
    image: IMG.multi,
    subtitle: "Delicious Nutrition.",
    description: "Formulated with care to make taking your vitamins the best part of your day. Your wellness journey starts here."
  };

  const [mode, setMode] = useState<"login" | "register" | "forgot" | "otp" | "reset">("login");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    
    try {
      if (mode === "login" || mode === "register") {
        const res = await (mode === "login" ? login(email, password) : register(name, email, password, phone));
        if (!res.ok) {
          setBusy(false);
          setError(res.error ?? "Something went wrong");
          return;
        }
        toast.success(mode === "login" ? "Welcome back" : "Account created");
        void navigate({ to: "/account" });
      } else if (mode === "forgot") {
        const res = await fetchJson<{success: boolean, message: string}>(`/api/auth/forgot-password`, {
          method: "POST",
          body: JSON.stringify({ email })
        });
        toast.success(res.message);
        setMode("otp");
        setBusy(false);
      } else if (mode === "otp") {
        const res = await fetchJson<{success: boolean, message: string}>(`/api/auth/verify-otp`, {
          method: "POST",
          body: JSON.stringify({ email, otp })
        });
        toast.success(res.message);
        setMode("reset");
        setBusy(false);
      } else if (mode === "reset") {
        const res = await fetchJson<{success: boolean, message: string}>(`/api/auth/reset-password`, {
          method: "POST",
          body: JSON.stringify({ email, otp, new_password: password })
        });
        toast.success(res.message);
        setMode("login");
        setBusy(false);
      }
    } catch (err: any) {
      setBusy(false);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>
      
      <div className="w-full max-w-[1000px] bg-card rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Side (Brand/Image) */}
        <div className="bg-ink p-8 lg:p-10 flex flex-col justify-between lg:w-[45%]">
          <div>
            <img 
              src="/logo.png" 
              alt="Sonrup" 
              className="h-16 w-auto object-contain object-left" 
              style={{ marginLeft: "-44px" }} 
            />
          </div>
          
          <div className="my-6 flex justify-center">
            <img
              src={loginContent.image}
              alt="Sonrup Gummies"
              className="w-full max-w-[280px] object-cover rounded-3xl shadow-xl shadow-black/20"
            />
          </div>
          
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-primary">{loginContent.subtitle}</p>
            <p className="mt-3 text-[13px] text-cream/70 leading-relaxed whitespace-pre-wrap">
              {loginContent.description}
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="p-8 lg:p-10 flex flex-col justify-center lg:w-[55%]">
          {/* Tabs */}
          {/* Tabs */}
          {["login", "register"].includes(mode) ? (
            <div className="flex border-b border-border/60 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={cn(
                    "flex-1 pb-4 text-[12px] font-bold uppercase tracking-widest transition-colors relative",
                    mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "login" ? "Login" : "Sign Up"}
                  {mode === m && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => { setMode("login"); setError(null); }} className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </button>
          )}

          <h2 className="text-[28px] font-display font-semibold mb-1 tracking-tight">
            {mode === "login" ? "Welcome back" : 
             mode === "register" ? "Create account" : 
             mode === "forgot" ? "Forgot password" :
             mode === "otp" ? "Enter OTP" : "Reset password"}
          </h2>
          <p className="text-[13px] text-muted-foreground mb-6">
            {mode === "login" 
              ? "Enter your email and password to access your account." 
              : mode === "register" ? "Sign up to track orders and save your favourite gummies."
              : mode === "forgot" ? "Enter your email to receive an OTP."
              : mode === "otp" ? "Enter the 6-digit OTP sent to your email."
              : "Enter your new password below."}
          </p>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "register" && (
              <>
                <Field
                  icon={<User className="h-4 w-4" />}
                  label="Full name"
                  value={name}
                  onChange={setName}
                  placeholder="Your Name"
                  autoComplete="name"
                />
                <Field
                  icon={<span className="text-[10px] font-bold">+91</span>}
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="98765 43210"
                  type="tel"
                  autoComplete="tel"
                />
              </>
            )}

            {["login", "register", "forgot"].includes(mode) && (
              <Field
                icon={<Mail className="h-4 w-4" />}
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
            )}

            {mode === "otp" && (
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="OTP"
                type="text"
                value={otp}
                onChange={setOtp}
                placeholder="123456"
              />
            )}
            
            {["login", "register", "reset"].includes(mode) && (
              <div className="relative">
                <Field
                  icon={<Lock className="h-4 w-4" />}
                  label={mode === "reset" ? "New Password" : "Password"}
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  extraLabel={mode === "login" ? <button type="button" onClick={() => { setMode("forgot"); setError(null); }} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors absolute right-0 top-0">Forgot password?</button> : undefined}
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
            )}

            {error && (
              <p className="rounded-xl bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
                {error}
              </p>
            )}

            <button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full py-3.5 text-[12px] font-bold uppercase tracking-widest transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 mt-4" 
              disabled={busy}
            >
              {mode === "login" ? "Sign in" : mode === "register" ? "Sign up" : mode === "forgot" ? "Send OTP" : mode === "otp" ? "Verify OTP" : "Reset Password"}
            </button>
          </form>

          {["login", "register"].includes(mode) && (
            <p className="mt-5 text-center text-[13px] text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                }}
                className="font-semibold text-foreground hover:underline decoration-foreground/30 underline-offset-4"
              >
                {mode === "login" ? "Sign up" : "Login"}
              </button>
            </p>
          )}
        </div>
      </div>
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
  extraLabel
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  extraLabel?: React.ReactNode;
}) {
  return (
    <label className="block relative">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/70">{label}</span>
        {extraLabel}
      </div>
      <span className="flex items-center gap-3 rounded-[16px] border border-border/60 bg-transparent px-4 py-3 transition-all duration-300 focus-within:border-foreground focus-within:shadow-[0_0_0_1px_var(--foreground)]">
        <span className="text-muted-foreground/70">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent pr-8 text-[14px] font-medium outline-none placeholder:text-muted-foreground/40"
        />
      </span>
    </label>
  );
}

