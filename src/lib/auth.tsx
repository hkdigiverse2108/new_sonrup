import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export type User = { name: string; email: string; phone?: string };

type AuthValue = {
  user: User | null;
  ready: boolean;
  addresses: Address[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
};

const AuthContext = createContext<AuthValue | null>(null);
const KEY = "sonrup-auth-v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user ?? null);
        setAddresses(parsed.addresses ?? []);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ user, addresses }));
    } catch {
      /* ignore */
    }
  }, [user, addresses, ready]);

  const login = useCallback((email: string, password: string) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const name = email.split("@")[0]!.replace(/[._-]/g, " ");
    setUser({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
    return { ok: true };
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    if (name.trim().length < 2) return { ok: false, error: "Please enter your name" };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    setUser({ name: name.trim(), email });
    return { ok: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);
  const updateUser = useCallback((patch: Partial<User>) => setUser((u) => (u ? { ...u, ...patch } : u)), []);
  const addAddress = useCallback(
    (a: Omit<Address, "id">) => setAddresses((list) => [...list, { ...a, id: `addr-${Date.now()}` }]),
    [],
  );
  const removeAddress = useCallback((id: string) => setAddresses((list) => list.filter((a) => a.id !== id)), []);

  const value = useMemo(
    () => ({ user, ready, addresses, login, register, logout, updateUser, addAddress, removeAddress }),
    [user, ready, addresses, login, register, logout, updateUser, addAddress, removeAddress],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
