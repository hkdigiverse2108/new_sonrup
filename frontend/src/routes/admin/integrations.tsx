import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAdminIntegrationsSettings, apiAdminUpdateIntegrationsSettings } from "@/lib/api";
import { CheckCircle2, Truck, Package, Eye, EyeOff, Megaphone, CreditCard, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/integrations")({
  component: IntegrationsSettingsPage,
});

function IntegrationsSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useAdminIntegrationsSettings();
  const [form, setForm] = useState<any>(null);
  const [showToken, setShowToken] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  useEffect(() => {
    if (settings && !form) {
      setForm({ ...settings });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateIntegrationsSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_integrations_settings"] });
      queryClient.invalidateQueries({ queryKey: ["integrations_settings"] });
      toast.success("Settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrations & Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global settings like free shipping thresholds.</p>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2 items-start">
        {/* Announcement Bar Settings */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Announcement Bar</h2>
                <p className="text-sm text-muted-foreground">Scrolling text displayed at the very top of the website.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Scrolling Items (One per line)</span>
                <textarea
                  value={form.announcement_bar_items?.join("\n") || ""}
                  onChange={(e) => setForm({ ...form, announcement_bar_items: e.target.value.split("\n") })}
                  placeholder="FREE SHIPPING ON ORDERS ABOVE ₹499&#10;60 GUMMIES PER TUBE"
                  rows={5}
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl resize-y"
                />
                <p className="text-xs text-muted-foreground">Each line represents a distinct announcement in the ticker tape.</p>
              </label>
            </div>
          </div>

        {/* Shipping Settings */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Shipping Settings</h2>
                <p className="text-sm text-muted-foreground">Configure customer shipping options.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Free Shipping Threshold (₹)</span>
                <input
                  type="number"
                  value={form.free_shipping_amount ?? 499}
                  onChange={(e) => setForm({ ...form, free_shipping_amount: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                />
                <p className="text-xs text-muted-foreground">Orders above this amount will automatically qualify for free shipping.</p>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Standard Shipping Charge (₹)</span>
                <input
                  type="number"
                  value={form.shipping_charge ?? 59}
                  onChange={(e) => setForm({ ...form, shipping_charge: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                />
                <p className="text-xs text-muted-foreground">Standard charge applied to orders below the free shipping threshold.</p>
              </label>
            </div>
        </div>

        {/* Shop Filter Settings */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-600/10 text-amber-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Shop Filter Settings</h2>
                <p className="text-sm text-muted-foreground">Configure maximum price filter slider limit.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Max Price Filter (₹)</span>
                <input
                  type="number"
                  value={form.max_filter_price ?? 1500}
                  onChange={(e) => setForm({ ...form, max_filter_price: parseFloat(e.target.value) || 0 })}
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                />
                <p className="text-xs text-muted-foreground">The maximum price limit shown on the shop filter slider (e.g. ₹1500).</p>
              </label>
            </div>
        </div>

        {/* Delhivery Settings */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Delhivery Integration</h2>
                <p className="text-sm text-muted-foreground">API credentials for Delhivery logistics.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">API Token</span>
                <div className="relative w-full max-w-xl">
                  <input
                    type={showToken ? "text" : "password"}
                    value={form.delhivery_api_token || ""}
                    onChange={(e) => setForm({ ...form, delhivery_api_token: e.target.value })}
                    placeholder="Enter Delhivery API Token"
                    className="rounded-xl border border-input bg-transparent px-4 py-3 pr-12 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Your authorization token from the Delhivery dashboard.</p>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Warehouse Name</span>
                <input
                  type="text"
                  value={form.delhivery_warehouse_name || ""}
                  onChange={(e) => setForm({ ...form, delhivery_warehouse_name: e.target.value })}
                  placeholder="e.g. Mumbai Hub"
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                />
                <p className="text-xs text-muted-foreground">The registered pickup location name in Delhivery.</p>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Razorpay Integration</h2>
                <p className="text-sm text-muted-foreground">API credentials for online payments.</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={form.razorpay_active !== false}
                  onChange={(e) => setForm({ ...form, razorpay_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground block">Active Status</span>
                  <span className="text-xs text-muted-foreground block">Enable or disable online payments via Razorpay.</span>
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Environment Mode</span>
                <select
                  value={form.razorpay_mode || "test"}
                  onChange={(e) => setForm({ ...form, razorpay_mode: e.target.value })}
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                >
                  <option value="test">Test Mode</option>
                  <option value="live">Live Mode</option>
                </select>
                <p className="text-xs text-muted-foreground">Switch between test and live transactions.</p>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Key ID</span>
                <input
                  type="text"
                  value={form.razorpay_key_id || ""}
                  onChange={(e) => setForm({ ...form, razorpay_key_id: e.target.value })}
                  placeholder="Enter Razorpay Key ID"
                  className="rounded-xl border border-input bg-transparent px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-xl"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-foreground">Key Secret</span>
                <div className="relative w-full max-w-xl">
                  <input
                    type={showRazorpaySecret ? "text" : "password"}
                    value={form.razorpay_key_secret || ""}
                    onChange={(e) => setForm({ ...form, razorpay_key_secret: e.target.value })}
                    placeholder="Enter Razorpay Key Secret"
                    className="rounded-xl border border-input bg-transparent px-4 py-3 pr-12 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRazorpaySecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>
            </div>
          </div>


      </div>
    </div>
  );
}
