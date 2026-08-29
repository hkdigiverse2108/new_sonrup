import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  LogOut, Eye, EyeOff, Lock, User,
  ChevronDown, Home, Star, Layers, CheckCircle, Settings, MessageCircle, Users, Plug,
  Menu, X
} from "lucide-react";

const ADMIN_TOKEN_KEY = "sonrup_admin_token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      return false;
    }
    return !!payload.admin;
  } catch {
    return false;
  }
}



// ─── Admin Layout ─────────────────────────────────────────────────────────────
function AdminLayout() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => 
    location.pathname.includes("/admin/settings")
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsSettingsOpen(location.pathname.includes("/admin/settings"));
  }, [location.pathname]);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isAdminLoggedIn());
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3E332A]/30 border-t-[#3E332A]" />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <AdminLoginPage onLogin={() => setLoggedIn(true)} />;
  }

  const topLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/product-reviews", label: "Product Reviews", icon: Star },
    { to: "/admin/contacts", label: "Contact Inquiry", icon: MessageCircle },
    { to: "/admin/subscribers", label: "Subscribers", icon: Users },
    { to: "/admin/customers", label: "Customers", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-border bg-card p-4 lg:flex flex-col">
        <div className="mb-6 flex flex-col gap-2">
          <div>
            <Link to="/admin" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Sonrup" 
                className="h-15 w-auto object-contain object-left" 
                style={{ marginLeft: "-44px", filter: "drop-shadow(0px 1px 0px rgba(0,0,0,0.55)) drop-shadow(0px 2px 6px rgba(0,0,0,0.35))" }} 
              />
            </Link>
          </div>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-2">
          {topLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.exact }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          ))}

          {/* Collapsible Site Settings */}
          <div>
            <Link
              to="/admin/integrations"
              activeProps={{ className: "bg-primary/10 text-primary font-bold" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-muted hover:text-foreground" }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            >
              <Plug className="h-4 w-4 shrink-0" />
              Integrations
            </Link>

            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 shrink-0" />
                Site Settings
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isSettingsOpen && (
              <div className="mt-1 space-y-1 pl-10">
                <Link
                  to="/admin/settings/hero"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Hero Section
                </Link>
                <Link
                  to="/admin/settings/flavours"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Flavours Section
                </Link>
                <Link
                  to="/admin/settings/why"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Why Section
                </Link>
                <Link
                  to="/admin/settings/ingredients"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Ingredients Section
                </Link>
                <Link
                  to="/admin/settings/story"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Our Story Section
                </Link>
                <Link
                  to="/admin/settings/reviews"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Reviews Section
                </Link>
                <Link
                  to="/admin/settings/social"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Social Section
                </Link>
                <Link
                  to="/admin/settings/faqs"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  FAQs Settings
                </Link>
                <Link
                  to="/admin/settings/about"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  About Page
                </Link>
                <Link
                  to="/admin/settings/contact"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Contact Page
                </Link>
                <Link
                  to="/admin/settings/journal"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Journal Page
                </Link>
                <Link
                  to="/admin/settings/policies"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  Legal Policies
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-xl font-extrabold tracking-tight text-primary">
            sonrup<span className="text-secondary">.</span>
            <span className="ml-1.5 text-xs font-normal text-muted-foreground uppercase tracking-widest">Admin</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden transition-opacity"
          />

          {/* Drawer Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border p-4 flex flex-col shadow-2xl lg:hidden">
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <p className="font-display text-2xl font-extrabold tracking-tight text-primary">
                  sonrup<span className="text-secondary">.</span>
                </p>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin Panel</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {topLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  activeOptions={{ exact: link.exact }}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              ))}

              {/* Collapsible Site Settings */}
              <div className="pt-2 border-t border-border/50">
                <Link
                  to="/admin/integrations"
                  onClick={() => setMobileOpen(false)}
                  activeProps={{ className: "bg-primary/10 text-primary font-bold" }}
                  inactiveProps={{ className: "text-muted-foreground hover:bg-muted hover:text-foreground" }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Plug className="h-4 w-4 shrink-0" />
                  Integrations
                </Link>

                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 shrink-0" />
                    Site Settings
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isSettingsOpen && (
                  <div className="mt-1 space-y-1 pl-10">
                    <Link
                      to="/admin/settings/hero"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Hero Section
                    </Link>
                    <Link
                      to="/admin/settings/flavours"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Flavours Section
                    </Link>
                    <Link
                      to="/admin/settings/why"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Why Section
                    </Link>
                    <Link
                      to="/admin/settings/ingredients"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Ingredients Section
                    </Link>
                    <Link
                      to="/admin/settings/story"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Our Story Section
                    </Link>
                    <Link
                      to="/admin/settings/reviews"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Reviews Section
                    </Link>
                    <Link
                      to="/admin/settings/social"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Social Section
                    </Link>
                    <Link
                      to="/admin/settings/faqs"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      FAQs Settings
                    </Link>
                    <Link
                      to="/admin/settings/about"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      About Page
                    </Link>
                    <Link
                      to="/admin/settings/contact"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Contact Page
                    </Link>
                    <Link
                      to="/admin/settings/journal"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Journal Page
                    </Link>
                    <Link
                      to="/admin/settings/policies"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
                    >
                      Legal Policies
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            <div className="mt-auto pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="pt-16 lg:pt-0">
          <div className="p-6 lg:p-10 xl:p-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Admin Login Page ─────────────────────────────────────────────────────────
function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid credentials");
      }
      const data = await res.json();
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink p-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Sonrup" className="h-28 w-auto object-contain" />
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.35em] text-cream/40">Admin Panel</p>
        </div>

        {/* Glass card */}
        <div className="rounded-3xl border border-cream/10 bg-cream/5 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-extrabold text-cream">Welcome back 👋</h1>
            <p className="mt-1.5 text-sm text-cream/50">Sign in to manage your store.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="grid gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/40">Username</span>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/30" />
                <input
                  id="admin-username"
                  type="text"
                  className="w-full rounded-xl border border-cream/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-cream placeholder:text-cream/25 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/40">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/30" />
                <input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-xl border border-cream/10 bg-white/5 py-3.5 pl-11 pr-12 text-sm text-cream placeholder:text-cream/25 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/30 transition hover:text-cream/70"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-cream/25">
          <Link to="/" className="transition hover:text-cream/60 hover:underline">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
