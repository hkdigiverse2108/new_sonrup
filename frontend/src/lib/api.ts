import { useQuery } from "@tanstack/react-query";
import { Product } from "./products";

// Use the Vite environment variable if available, otherwise fallback to relative
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const TOKEN_KEY = "sonrup_token";

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const headers = new Headers(options?.headers || {});
  headers.set("Content-Type", "application/json");

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch ${url}`);
  }
  return res.json();
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetchJson<Product[]>("/api/products"),
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => fetchJson<Product>(`/api/products/${slug}`),
    enabled: !!slug,
  });
};

export const useFlavours = () => {
  return useQuery({
    queryKey: ["flavours"],
    queryFn: () => fetchJson<{ name: string; token: string; note: string }[]>("/api/flavours"),
  });
};

export const useGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => fetchJson<{ name: string }[]>("/api/goals"),
  });
};

export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => fetchJson<{ name: string; city: string; rating: number; text: string; product: string }[]>("/api/reviews"),
  });
};

export const useFaqs = () => {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: () => fetchJson<{ category: string; q: string; a: string }[]>("/api/faqs"),
  });
};

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchJson<{ slug: string; title: string; category: string; date: string; read: string; excerpt: string; accent: string; body: string[] }[]>("/api/posts"),
  });
};

export const usePost = (slug: string) => {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => fetchJson<{ slug: string; title: string; category: string; date: string; read: string; excerpt: string; accent: string; body: string[] }>(`/api/posts/${slug}`),
    enabled: !!slug,
  });
};

export const usePolicies = () => {
  return useQuery({
    queryKey: ["policies"],
    queryFn: () => fetchJson<{ slug: string; title: string; updated: string; intro: string; sections: { heading: string; body: string[] }[] }[]>("/api/policies"),
  });
};

export const usePolicy = (slug: string) => {
  return useQuery({
    queryKey: ["policies", slug],
    queryFn: () => fetchJson(`/api/policies/${slug}`),
    enabled: !!slug,
  });
};

export const useBrandValues = () => {
  return useQuery({
    queryKey: ["brand_values"],
    queryFn: () => fetchJson("/api/brand-values"),
  });
};

export const useMilestones = () => {
  return useQuery({
    queryKey: ["milestones"],
    queryFn: () => fetchJson("/api/milestones"),
  });
};



// --- Auth & User APIs ---
export const apiLogin = (data: any) => fetchJson("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
export const apiRegister = (data: any) => fetchJson("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
export const apiGetMe = () => fetchJson("/api/auth/me");
export const apiUpdateUser = (data: any) => fetchJson(`/api/user/profile`, { method: "PUT", body: JSON.stringify(data) });
export const apiSyncAddresses = (addresses: any[]) => fetchJson(`/api/user/addresses`, { method: "POST", body: JSON.stringify(addresses) });
export const apiAddOrder = (order: any) => fetchJson(`/api/orders`, { method: "POST", body: JSON.stringify(order) });
export const apiSubscribeNewsletter = (email: string) => fetchJson("/api/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });
