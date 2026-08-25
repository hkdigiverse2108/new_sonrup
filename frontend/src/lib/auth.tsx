import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRegister, apiLogin, apiGetMe, apiUpdateUser, apiSyncAddresses, TOKEN_KEY } from "./api";

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  phone: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: any[];
};

export type User = { name: string; email: string; phone?: string };

type AuthValue = {
  user: User | null;
  ready: boolean;
  addresses: Address[];
  orders: Order[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, patch: Partial<Omit<Address, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  // Restore session from localStorage and fetch fresh data
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      // Fetch latest profile from DB using the token
      apiGetMe().then((data) => {
        setUser({ name: data.name, email: data.email, phone: data.phone });
        setAddresses(data.addresses || []);
        setOrders(data.orders || []);
        setReady(true);
      }).catch(() => {
        // Token might be expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    try {
      const data = await apiLogin({ email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      // Fetch user data after login
      const profile = await apiGetMe();
      setUser({ name: profile.name, email: profile.email, phone: profile.phone });
      setAddresses(profile.addresses || []);
      setOrders(profile.orders || []);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone: string = "") => {
    if (name.trim().length < 2) return { ok: false, error: "Please enter your name" };
    if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    try {
      const data = await apiRegister({ name: name.trim(), email, password, phone: phone.trim() });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      const profile = await apiGetMe();
      setUser({ name: profile.name, email: profile.email, phone: profile.phone });
      setAddresses(profile.addresses || []);
      setOrders(profile.orders || []);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAddresses([]);
    setOrders([]);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const updateUser = useCallback(async (patch: Partial<User>) => {
    setUser((u) => {
      if (!u) return u;
      const updated = { ...u, ...patch };
      // Fire-and-forget sync to backend using the JWT token
      apiUpdateUser(patch).catch((err) => {
        console.error(err);
      });
      return updated;
    });
  }, []);
  
  // Helper to sync addresses to backend
  const syncAddresses = useCallback((newAddresses: Address[]) => {
    if (user) {
      apiSyncAddresses(newAddresses).catch(console.error);
    }
  }, [user]);

  const addAddress = useCallback(
    (a: Omit<Address, "id">) => setAddresses((list) => {
      const newAddress = { ...a, id: `addr-${Date.now()}` };
      let newList;
      if (a.isDefault || list.length === 0) {
        newAddress.isDefault = true;
        newList = [...list.map(addr => ({ ...addr, isDefault: false })), newAddress];
      } else {
        newList = [...list, newAddress];
      }
      syncAddresses(newList);
      return newList;
    }),
    [syncAddresses],
  );
  
  const updateAddress = useCallback((id: string, patch: Partial<Omit<Address, "id">>) => {
    setAddresses((list) => {
      let isMakingDefault = patch.isDefault === true;
      let newList = list.map((a) => (a.id === id ? { ...a, ...patch } : a));
      
      // If we are setting this one as default, unset others
      if (isMakingDefault) {
        newList = newList.map(a => ({ ...a, isDefault: a.id === id }));
      }
      syncAddresses(newList);
      return newList;
    });
  }, [syncAddresses]);

  const removeAddress = useCallback((id: string) => setAddresses((list) => {
    const newList = list.filter((a) => a.id !== id);
    if (newList.length > 0 && !newList.some(a => a.isDefault)) {
      newList[0].isDefault = true;
    }
    syncAddresses(newList);
    return newList;
  }), [syncAddresses]);

  const setDefaultAddress = useCallback((id: string) => setAddresses((list) => {
    const newList = list.map(a => ({ ...a, isDefault: a.id === id }));
    syncAddresses(newList);
    return newList;
  }), [syncAddresses]);

  const addOrderLocal = useCallback((order: Order) => setOrders(prev => [...prev, order]), []);

  const value = useMemo(
    () => ({ user, ready, addresses, orders, login, register, logout, updateUser, addAddress, updateAddress, removeAddress, setDefaultAddress, addOrderLocal }),
    [user, ready, addresses, orders, login, register, logout, updateUser, addAddress, updateAddress, removeAddress, setDefaultAddress, addOrderLocal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
