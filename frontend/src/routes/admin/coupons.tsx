import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket, Plus, Search, Trash2, Edit3, CheckCircle2, XCircle,
  Power, Sparkles, Megaphone, Save, Check
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminCoupons, apiAdminCreateCoupon, apiAdminUpdateCoupon,
  apiAdminDeleteCoupon, apiAdminToggleCouponStatus, type Coupon,
  useAdminIntegrationsSettings, apiAdminUpdateIntegrationsSettings
} from "@/lib/api";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/coupons")({
  component: AdminCouponsPage,
});

function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  // Coupons Data
  const { data: coupons = [], isLoading, isFetching, refetch } = useAdminCoupons();

  // Integrations / Banner Settings Data
  const { data: integrationsSettings, isLoading: isSettingsLoading } = useAdminIntegrationsSettings();
  const [bannerForm, setBannerForm] = useState<any>(null);

  useEffect(() => {
    if (integrationsSettings && !bannerForm) {
      setBannerForm({
        offer_banner_enabled: integrationsSettings.offer_banner_enabled !== false,
        offer_banner_code: integrationsSettings.offer_banner_code || "WELCOME100",
        offer_banner_title: integrationsSettings.offer_banner_title || "Flat ₹100 OFF on Your Order",
        offer_banner_subtitle: integrationsSettings.offer_banner_subtitle || "Use code WELCOME100 at checkout",
        offer_banner_button_text: integrationsSettings.offer_banner_button_text || "Copy Code",
      });
    }
  }, [integrationsSettings, bannerForm]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State for Coupons CRUD
  const [formData, setFormData] = useState<{
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: string;
    min_order_amount: string;
    max_discount_amount: string;
    is_active: boolean;
    description: string;
  }>({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_discount_amount: "",
    is_active: true,
    description: "",
  });

  // Offer Banner Settings Mutation
  const saveBannerMutation = useMutation({
    mutationFn: (payload: any) => apiAdminUpdateIntegrationsSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_integrations_settings"] });
      queryClient.invalidateQueries({ queryKey: ["integrations_settings"] });
      toast.success("Header Offer Banner updated successfully! 🎉");
    },
    onError: () => {
      toast.error("Failed to update banner settings.");
    },
  });

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm) return;
    saveBannerMutation.mutate({
      ...integrationsSettings,
      ...bannerForm,
    });
  };

  const setCouponAsTopOffer = (couponCode: string, description?: string) => {
    const updatedForm = {
      ...bannerForm,
      offer_banner_enabled: true,
      offer_banner_code: couponCode,
      offer_banner_subtitle: description || `Use code ${couponCode} at checkout`,
    };
    setBannerForm(updatedForm);
    saveBannerMutation.mutate({
      ...integrationsSettings,
      ...updatedForm,
    });
  };

  // Mutations for Coupons
  const createMutation = useMutation({
    mutationFn: apiAdminCreateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
      toast.success("Coupon created successfully! 🎉");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create coupon");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, data }: { code: string; data: Partial<Coupon> }) =>
      apiAdminUpdateCoupon(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
      toast.success("Coupon updated successfully!");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiAdminDeleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
      toast.success("Coupon deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete coupon");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: apiAdminToggleCouponStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin_coupons"] });
      toast.success(`Coupon is now ${data.is_active ? "Active" : "Inactive"}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "10",
      min_order_amount: "499",
      max_discount_amount: "",
      is_active: true,
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: coupon.min_order_amount !== undefined ? String(coupon.min_order_amount) : "0",
      max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : "",
      is_active: coupon.is_active !== false,
      description: coupon.description || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const val = parseFloat(formData.discount_value);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid discount value greater than 0");
      return;
    }

    const payload: Partial<Coupon> = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: val,
      min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
      is_active: formData.is_active,
      description: formData.description.trim(),
    };

    if (editingCoupon) {
      updateMutation.mutate({ code: editingCoupon.code, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const ok = await confirm({
      title: "Delete Coupon",
      message: `Are you sure you want to delete coupon code "${coupon.code}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (ok) {
      deleteMutation.mutate(coupon.code);
    }
  };

  // Filtered List
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus === "active") return matchesSearch && c.is_active !== false;
    if (filterStatus === "inactive") return matchesSearch && c.is_active === false;
    return matchesSearch;
  });

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.is_active !== false).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Coupons & Offer Banner</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Manage promotional coupon codes & configure top header offer banner for your website.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Top Header Offer Banner Settings Section with Checkbox */}
      {bannerForm && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSaveBanner} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Header Offer Banner (Top Line Offer)</h2>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable the gold offer line displayed right under the website navigation header.
                  </p>
                </div>
              </div>

              {/* Checkbox / Toggle for showing offer banner on website */}
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="offer-banner-enable-toggle"
                    checked={bannerForm.offer_banner_enabled}
                    onChange={(e) => setBannerForm({ ...bannerForm, offer_banner_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <label htmlFor="offer-banner-enable-toggle" className="text-xs font-extrabold text-foreground cursor-pointer select-none">
                  {bannerForm.offer_banner_enabled ? "✅ Show Banner on Website" : "❌ Hidden from Website"}
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME100"
                  value={bannerForm.offer_banner_code}
                  onChange={(e) => setBannerForm({ ...bannerForm, offer_banner_code: e.target.value.toUpperCase() })}
                  className="w-full font-mono uppercase font-bold tracking-wider rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Banner Title */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Banner Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat ₹100 OFF on Your Order"
                  value={bannerForm.offer_banner_title}
                  onChange={(e) => setBannerForm({ ...bannerForm, offer_banner_title: e.target.value })}
                  className="w-full font-bold rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Banner Subtitle / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Use code WELCOME100 at checkout"
                  value={bannerForm.offer_banner_subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, offer_banner_subtitle: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Copy Button Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Copy Code"
                  value={bannerForm.offer_banner_button_text}
                  onChange={(e) => setBannerForm({ ...bannerForm, offer_banner_button_text: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                {bannerForm.offer_banner_enabled
                  ? "Status: Banner is active and visible on live site."
                  : "Status: Banner is hidden from live site."}
              </p>

              <button
                type="submit"
                disabled={saveBannerMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saveBannerMutation.isPending ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saveBannerMutation.isPending ? "Saving..." : "Save Offer Banner Settings"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Coupons</span>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-foreground">{totalCoupons}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Coupons</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activeCoupons}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Usage Count</span>
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-extrabold text-foreground">{totalUses} <span className="text-xs font-medium text-muted-foreground">times used</span></p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-1">
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                filterStatus === st
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table / Cards */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="mt-4 text-xs font-semibold text-muted-foreground">Loading coupons...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Ticket className="h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-bold text-foreground">No coupons found</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {search
              ? "No coupons match your search query."
              : "Get started by creating your first promotional discount coupon."}
          </p>
          {!search && (
            <button
              onClick={openCreateModal}
              className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Code & Details</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min. Order</th>
                  <th className="px-6 py-4">Times Used</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCoupons.map((coupon) => {
                  const isActive = coupon.is_active !== false;
                  const isCurrentBanner = bannerForm?.offer_banner_code === coupon.code && bannerForm?.offer_banner_enabled;

                  return (
                    <tr key={coupon.code} className="transition hover:bg-muted/30">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-black tracking-wider text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                          {coupon.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {coupon.description}
                            </span>
                          )}
                          {isCurrentBanner && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                              ✦ Active Header Banner
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-bold text-foreground">
                        <div className="flex items-center gap-1">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <span className="text-sm font-extrabold text-secondary">{coupon.discount_value}% OFF</span>
                              {coupon.max_discount_amount && (
                                <span className="text-[10px] font-normal text-muted-foreground">
                                  (Max ₹{coupon.max_discount_amount})
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              ₹{coupon.discount_value} OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-6 py-4 text-muted-foreground font-semibold">
                        {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : "No min limit"}
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4 font-bold text-foreground">
                        {coupon.used_count || 0} times
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {coupon.is_active === false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active */}
                          <button
                            onClick={() => toggleStatusMutation.mutate(coupon.code)}
                            title={coupon.is_active !== false ? "Deactivate Coupon" : "Activate Coupon"}
                            className={`rounded-lg p-1.5 transition ${
                              coupon.is_active !== false
                                ? "text-emerald-600 hover:bg-emerald-500/10"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Power className="h-4 w-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(coupon)}
                            title="Edit Coupon"
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(coupon)}
                            title="Delete Coupon"
                            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ticket className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME10, SONRUP50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full font-mono uppercase font-bold tracking-wider rounded-xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })
                    }
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs font-bold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Amount Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    placeholder={formData.discount_type === "percentage" ? "10 (for 10%)" : "100 (for ₹100 off)"}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-3 font-bold text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount Cap */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Min. Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (No minimum limit)"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {formData.discount_type === "percentage" && (
                  <div>
                    <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional cap (e.g. 200)"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Description / Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Festival sale offer 10% off on orders above ₹499"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="coupon-active" className="font-bold text-foreground cursor-pointer">
                  Activate this coupon code immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-border px-4 py-2.5 font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingCoupon
                    ? "Save Changes"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
