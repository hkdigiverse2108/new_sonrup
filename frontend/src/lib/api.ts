import { useQuery, queryOptions } from "@tanstack/react-query";
import { Product } from "./products";

// Resolve API URL properly in both client and SSR (Node/Nitro) environments
export const getApiUrl = () => {
  if (typeof window !== "undefined") {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    const host = window.location.hostname;
    if (host.includes("sonrup.com")) {
      return "https://api.sonrup.com";
    }
    return "";
  }
  // Server-side (SSR / Node / Nitro)
  return process.env.VITE_API_URL || process.env.BACKEND_URL || (process.env.NODE_ENV === "production" ? "https://api.sonrup.com" : "http://localhost:8000");
};

export const getImageUrl = (url?: string | null): string => {
  if (!url) return "";
  
  // If it's a localhost / 127.0.0.1 image URL accidentally saved into MongoDB
  if (url.includes("localhost:8000/uploads/") || url.includes("127.0.0.1:8000/uploads/")) {
    const filename = url.split("/uploads/").pop();
    const apiUrl = getApiUrl();
    return `${apiUrl ? apiUrl.replace(/\/$/, "") : "https://api.sonrup.com"}/uploads/${filename}`;
  }

  // If it's already an absolute URL
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  
  // If it's an uploaded file from backend
  if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    const apiUrl = getApiUrl();
    if (apiUrl) {
      return `${apiUrl.replace(/\/$/, "")}${cleanPath}`;
    }
    return `https://api.sonrup.com${cleanPath}`;
  }
  
  return url;
};

export const TOKEN_KEY = "sonrup_token";

export const fetchJson = async <T,>(url: string, options?: RequestInit, isFormData?: boolean): Promise<T> => {
  const headers = new Headers(options?.headers || {});
  
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  // Determine which token to use based on the endpoint
  const isAdminEndpoint = url.startsWith("/api/admin");
  const isServer = typeof window === "undefined";
  const token = !isServer ? localStorage.getItem(isAdminEndpoint ? "sonrup_admin_token" : TOKEN_KEY) : null;
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    if (res.status === 401 && !isServer) {
      if (isAdminEndpoint) {
        localStorage.removeItem("sonrup_admin_token");
        window.location.href = "/admin";
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || `Failed to fetch ${url}`);
  }
  return res.json();
};

// ─── Query Options (for SSR Loaders & Client Hooks) ──────────────────────────

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => fetchJson<Product[]>("/api/products"),
    staleTime: 1000 * 60 * 10,
  });

export const productDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["products", slug],
    queryFn: () => fetchJson<Product>(`/api/products/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });

export const flavoursQueryOptions = () =>
  queryOptions({
    queryKey: ["flavours"],
    queryFn: () => fetchJson<{ name: string; token: string; note: string; image?: string }[]>("/api/flavours"),
    staleTime: 1000 * 60 * 10,
  });

export const goalsQueryOptions = () =>
  queryOptions({
    queryKey: ["goals"],
    queryFn: () => fetchJson<{ name: string }[]>("/api/goals"),
    staleTime: 1000 * 60 * 10,
  });

export const reviewsQueryOptions = () =>
  queryOptions({
    queryKey: ["reviews"],
    queryFn: () => fetchJson<{ name: string; city: string; rating: number; text: string; product: string }[]>("/api/reviews"),
    staleTime: 1000 * 60 * 10,
  });

export const faqsQueryOptions = () =>
  queryOptions({
    queryKey: ["faqs"],
    queryFn: () => fetchJson<{ category: string; q: string; a: string }[]>("/api/faqs"),
    staleTime: 1000 * 60 * 10,
  });

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: ["posts"],
    queryFn: () => fetchJson<{ slug: string; title: string; category: string; date: string; read: string; excerpt: string; accent: string; image?: string; body: {type: string; content: string}[] }[]>("/api/posts"),
    staleTime: 1000 * 60 * 10,
  });

export const postDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["posts", slug],
    queryFn: () => fetchJson<{ slug: string; title: string; category: string; date: string; read: string; excerpt: string; accent: string; image?: string; body: {type: string; content: string}[] }>(`/api/posts/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });

export const policiesQueryOptions = () =>
  queryOptions({
    queryKey: ["policies"],
    queryFn: () => fetchJson<any[]>("/api/policies"),
    staleTime: 1000 * 60 * 10,
  });

export const policyDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["policies", slug],
    queryFn: () => fetchJson<any>(`/api/policies/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });

export const homeContentQueryOptions = () =>
  queryOptions({
    queryKey: ["home_content"],
    queryFn: () => fetchJson<any>("/api/content/home"),
    staleTime: 1000 * 60 * 10,
  });

export const loginContentQueryOptions = () =>
  queryOptions({
    queryKey: ["login_content"],
    queryFn: () => fetchJson<any>("/api/content/login"),
    staleTime: 1000 * 60 * 10,
  });

export const aboutContentQueryOptions = () =>
  queryOptions({
    queryKey: ["about_content"],
    queryFn: () => fetchJson<any>("/api/content/about"),
    staleTime: 1000 * 60 * 10,
  });

export const contactContentQueryOptions = () =>
  queryOptions({
    queryKey: ["contact_content"],
    queryFn: () => fetchJson<any>("/api/content/contact"),
    staleTime: 1000 * 60 * 10,
  });

export const journalContentQueryOptions = () =>
  queryOptions({
    queryKey: ["journal_content"],
    queryFn: () => fetchJson<any>("/api/content/journal"),
    staleTime: 1000 * 60 * 10,
  });

export const brandValuesQueryOptions = () =>
  queryOptions({
    queryKey: ["brand_values"],
    queryFn: () => fetchJson<any[]>("/api/brand-values"),
    staleTime: 1000 * 60 * 10,
  });

export const milestonesQueryOptions = () =>
  queryOptions({
    queryKey: ["milestones"],
    queryFn: () => fetchJson<any[]>("/api/milestones"),
    staleTime: 1000 * 60 * 10,
  });

export const integrationsSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["integrations_settings"],
    queryFn: () => fetchJson<any>("/api/settings/integrations"),
    staleTime: 1000 * 60 * 10,
  });

// ─── React Query Hooks (delegating to Query Options) ─────────────────────────

export const useProducts = () => useQuery(productsQueryOptions());
export const useProduct = (slug: string) => useQuery(productDetailQueryOptions(slug));
export const useFlavours = () => useQuery(flavoursQueryOptions());
export const useGoals = () => useQuery(goalsQueryOptions());
export const useReviews = () => useQuery(reviewsQueryOptions());
export const useFaqs = () => useQuery(faqsQueryOptions());
export const usePosts = () => useQuery(postsQueryOptions());
export const usePost = (slug: string) => useQuery(postDetailQueryOptions(slug));
export const usePolicies = () => useQuery(policiesQueryOptions());
export const usePolicy = (slug: string) => useQuery(policyDetailQueryOptions(slug));
export const useHomeContent = () => useQuery(homeContentQueryOptions());
export const useLoginContent = () => useQuery(loginContentQueryOptions());
export const useAboutContent = () => useQuery(aboutContentQueryOptions());
export const useContactContent = () => useQuery(contactContentQueryOptions());
export const useJournalContent = () => useQuery(journalContentQueryOptions());
export const useBrandValues = () => useQuery(brandValuesQueryOptions());
export const useMilestones = () => useQuery(milestonesQueryOptions());



// --- Auth & User APIs ---
export const apiLogin = (data: any) => fetchJson("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
export const apiRegister = (data: any) => fetchJson("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
export const apiGetMe = () => fetchJson("/api/auth/me");
export const apiUpdateUser = (data: any) => fetchJson(`/api/user/profile`, { method: "PUT", body: JSON.stringify(data) });
export const apiSyncAddresses = (addresses: any[]) => fetchJson(`/api/user/addresses`, { method: "POST", body: JSON.stringify(addresses) });
export const apiAddOrder = (order: any) => fetchJson(`/api/orders`, { method: "POST", body: JSON.stringify(order) });
export const apiTrackOrder = (query: string) => fetchJson(`/api/track-order?query=${encodeURIComponent(query)}`);
export const apiSubscribeNewsletter = (email: string) => fetchJson("/api/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });

// Admin APIs
export const apiUploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetchJson("/api/admin/upload", { method: "POST", body: formData }, true);
};

export const apiAdminGetOrders = () => fetchJson("/api/admin/orders");
export const apiAdminUpdateOrderStatus = (id: string, status: string) => fetchJson(`/api/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const apiAdminShipOrder = (id: string) => fetchJson(`/api/admin/orders/${id}/ship`, { method: "POST" });
export const apiAdminPickupOrder = (id: string) => fetchJson(`/api/admin/orders/${id}/pickup`, { method: "POST" });
export const apiAdminCancelShipment = (orderId: string) => fetchJson(`/api/admin/orders/${orderId}/cancel-shipment`, { method: "POST" });
export const apiAdminGetOrderLabel = (orderId: string) => fetchJson(`/api/admin/orders/${orderId}/label`);
export const apiAdminDeleteOrder = (orderId: string) => fetchJson(`/api/admin/orders/${orderId}`, { method: "DELETE" });

export const apiAdminCreateProduct = (data: any) => fetchJson("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateProduct = (slug: string, data: any) => fetchJson(`/api/admin/products/${slug}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteProduct = (slug: string) => fetchJson(`/api/admin/products/${slug}`, { method: "DELETE" });

export const apiAdminUpdateHomeContent = (data: any) =>
  fetchJson<any>("/api/admin/content/home", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateLoginContent = (data: any) =>
  fetchJson<any>("/api/admin/content/login", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateAboutContent = (data: any) =>
  fetchJson("/api/admin/content/about", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateContactContent = async (data: any) => {
  return await fetchJson("/api/admin/content/contact", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const apiAdminUpdateJournalContent = async (data: any) => {
  return await fetchJson("/api/admin/content/journal", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const apiAdminCreatePost = async (data: any) => {
  return await fetchJson("/api/admin/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const apiAdminUpdatePost = async (slug: string, data: any) => {
  return await fetchJson(`/api/admin/posts/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const apiSubmitContact = async (data: { name: string; email: string; phone: string; message: string }) => {
  return await fetchJson("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useAdminContacts = () => {
  return useQuery({
    queryKey: ["admin_contacts"],
    queryFn: () => fetchJson<any[]>("/api/admin/contacts"),
  });
};

export const apiAdminDeleteContact = async (id: string) => {
  return await fetchJson(`/api/admin/contacts/${id}`, {
    method: "DELETE",
  });
};

export const useAdminSubscribers = () => {
  return useQuery({
    queryKey: ["admin_subscribers"],
    queryFn: () => fetchJson<any[]>("/api/admin/newsletter"),
  });
};

export const useIntegrationsSettings = () => useQuery(integrationsSettingsQueryOptions());

export const useAdminIntegrationsSettings = () => {
  return useQuery({
    queryKey: ["admin_integrations_settings"],
    queryFn: () => fetchJson<any>("/api/admin/settings/integrations"),
  });
};

export const apiAdminUpdateIntegrationsSettings = async (data: any) => {
  return await fetchJson("/api/admin/settings/integrations", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const apiAdminDeleteSubscriber = async (email: string) => {
  return await fetchJson(`/api/admin/newsletter/${email}`, {
    method: "DELETE",
  });
};

export const apiAdminSendBroadcast = async (data: { subject: string; message: string; target: string }) => {
  return await fetchJson("/api/admin/newsletter/broadcast", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useAdminCustomers = () => {
  return useQuery({
    queryKey: ["admin_customers"],
    queryFn: () => fetchJson<any[]>("/api/admin/customers"),
  });
};

export const apiAdminDeleteCustomer = async (id: string) => {
  return await fetchJson(`/api/admin/customers/${id}`, {
    method: "DELETE",
  });
};

export const apiAdminDeletePost = async (slug: string) => {
  return await fetchJson(`/api/admin/posts/${slug}`, {
    method: "DELETE",
  });
};

export const apiAdminCreatePolicy = async (data: any) => {
  return await fetchJson("/api/admin/policies", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const apiAdminUpdatePolicy = async (slug: string, data: any) => {
  return await fetchJson(`/api/admin/policies/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const apiAdminDeletePolicy = async (slug: string) => {
  return await fetchJson(`/api/admin/policies/${slug}`, {
    method: "DELETE",
  });
};

export const apiAdminCreateBrandValue = (data: any) =>
  fetchJson("/api/admin/brand-values", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateBrandValue = (title: string, data: any) =>
  fetchJson(`/api/admin/brand-values/${encodeURIComponent(title)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiAdminDeleteBrandValue = (title: string) =>
  fetchJson(`/api/admin/brand-values/${encodeURIComponent(title)}`, {
    method: "DELETE",
  });

export const apiAdminCreateMilestone = (data: any) =>
  fetchJson("/api/admin/milestones", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateMilestone = (year: string, data: any) =>
  fetchJson(`/api/admin/milestones/${encodeURIComponent(year)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const apiAdminDeleteMilestone = (year: string) =>
  fetchJson(`/api/admin/milestones/${encodeURIComponent(year)}`, {
    method: "DELETE",
  });

export const apiAdminCreateFlavour = (data: any) => fetchJson("/api/admin/flavours", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateFlavour = (token: string, data: any) => fetchJson(`/api/admin/flavours/${token}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteFlavour = (token: string) => fetchJson(`/api/admin/flavours/${token}`, { method: "DELETE" });

export const apiAdminCreateReview = (data: any) => fetchJson("/api/admin/reviews", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateReview = (name: string, data: any) => fetchJson(`/api/admin/reviews/${name}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteReview = (name: string) => fetchJson(`/api/admin/reviews/${name}`, { method: "DELETE" });

export const useProductReviews = () => {
  return useQuery({
    queryKey: ["product_reviews"],
    queryFn: () => fetchJson<any[]>("/api/product-reviews"),
  });
};
export const apiAdminCreateProductReview = (data: any) => fetchJson("/api/admin/product-reviews", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateProductReview = (id: string, data: any) => fetchJson(`/api/admin/product-reviews/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteProductReview = (id: string) => fetchJson(`/api/admin/product-reviews/${id}`, { method: "DELETE" });

export const apiAdminCreateFaq = (data: any) => fetchJson("/api/admin/faqs", { method: "POST", body: JSON.stringify(data) });
export const apiAdminUpdateFaq = (q: string, data: any) => fetchJson(`/api/admin/faqs/${encodeURIComponent(q)}`, { method: "PUT", body: JSON.stringify(data) });
export const apiAdminDeleteFaq = (q: string) => fetchJson(`/api/admin/faqs/${encodeURIComponent(q)}`, { method: "DELETE" });

