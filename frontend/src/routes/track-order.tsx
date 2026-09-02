import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  PackageOpen, 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Copy,
  Check
} from "lucide-react";
import { Container } from "@/components/site/Page";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { apiTrackOrder, getImageUrl } from "@/lib/api";
import { inr } from "@/lib/products";
import { toast } from "sonner";

const trackSearchSchema = z.object({
  query: z.string().optional(),
});

export const Route = createFileRoute("/track-order")({
  validateSearch: trackSearchSchema,
  head: () => ({
    meta: [
      { title: "Track Package — Sonrup Nutrition" },
      { name: "description", content: "Track your Sonrup gummies order live with real-time Delhivery shipment updates." },
    ],
  }),
  component: TrackOrderPage,
});

function formatDelhiveryTime(timeStr?: string) {
  if (!timeStr) return "";
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
}

function TrackOrderPage() {
  const searchParams = Route.useSearch();
  const { orders, ready } = useAuth();
  const [query, setQuery] = useState(searchParams.query || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const autoFetchedRef = useRef(false);

  const fetchOrder = async (orderIdToTrack: string, showToast = true) => {
    if (!orderIdToTrack.trim()) return;
    setLoading(true);
    try {
      const data = await apiTrackOrder(orderIdToTrack.trim());
      setOrder(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("sonrup_last_order_id", data.id || orderIdToTrack.trim());
      }
    } catch (err: any) {
      if (showToast) {
        toast.error(err.message || "Order not found. Please check your ID or AWB.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetchedRef.current) return;

    // 1. If explicit query parameter in URL (e.g. ?query=SNR-957429)
    if (searchParams.query) {
      autoFetchedRef.current = true;
      setQuery(searchParams.query);
      fetchOrder(searchParams.query, true);
      return;
    }

    // 2. If recent order ID in localStorage
    const savedLastOrderId = typeof window !== "undefined" ? localStorage.getItem("sonrup_last_order_id") : null;
    if (savedLastOrderId) {
      autoFetchedRef.current = true;
      setQuery(savedLastOrderId);
      fetchOrder(savedLastOrderId, false);
      return;
    }

    // 3. If logged in user has orders in profile
    if (ready && orders && orders.length > 0) {
      const latest = orders[orders.length - 1] || orders[0];
      if (latest?.id) {
        autoFetchedRef.current = true;
        setQuery(latest.id);
        fetchOrder(latest.id, false);
      }
    }
  }, [searchParams.query, ready, orders]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter your Order ID or AWB number");
      return;
    }
    fetchOrder(query.trim(), true);
  };

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopied(true);
    toast.success("Tracking number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const tracking = order?.delhivery_tracking;

  return (
    <main className="min-h-[70vh] bg-background flex flex-col pt-8 md:pt-14 pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          {/* Original Centered Header */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="bg-sand/60 text-foreground h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-xs border border-border">
              <Truck className="h-7 w-7 text-foreground" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-foreground">
              Track Your Package
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              Enter your Sonrup Order ID or Delhivery Waybill (AWB) number to watch your gummies progress to your doorstep.
            </p>
          </div>
          
          {/* Original Search Form */}
          <form 
            onSubmit={handleTrack} 
            className="bg-card p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="query" 
                placeholder="Enter Order ID or Delhivery AWB..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                required 
                className="pl-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 w-full text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-secondary text-secondary-foreground rounded-full font-bold tracking-wide text-sm hover:bg-secondary/90 transition-colors disabled:opacity-70 whitespace-nowrap shadow-xs"
            >
              {loading ? "SEARCHING..." : "TRACK PACKAGE"}
            </button>
          </form>

          {/* Original Card Layout with Sonrup Website Theme Colors */}
          {order && (
            <div className="mt-10 surface-card rounded-3xl shadow-sm border border-border p-6 sm:p-8">
              
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 mb-6">
                <div>
                  <div className="font-display font-extrabold text-xl text-foreground">{order.id}</div>
                  {order.date && <div className="text-sm text-muted-foreground mt-0.5">{order.date}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs sm:text-sm font-semibold ${
                    order.status === "Processing" ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" :
                    order.status === "Shipped" ? "bg-sand text-foreground border border-border" :
                    order.status === "Delivered" ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" :
                    "bg-muted text-foreground"
                  }`}>
                    {order.status === "Processing" && <Clock className="h-3.5 w-3.5" />}
                    {order.status === "Shipped" && <Truck className="h-3.5 w-3.5" />}
                    {order.status === "Delivered" && <CheckCircle className="h-3.5 w-3.5" />}
                    {tracking?.status || order.delhivery_status || order.status}
                  </span>
                </div>
              </div>

              {/* Shipping Details with All Live Delhivery Data */}
              {order.delhivery_awb && (
                <div className="mb-8 rounded-2xl bg-sand/30 p-5 sm:p-6 border border-border space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Package className="h-4 w-4 text-foreground" /> Shipping & Logistics Details
                    </h4>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-foreground" /> Live Delhivery Status
                    </span>
                  </div>

                  {/* Courier & AWB Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Courier Partner</span>
                      <span className="font-semibold text-foreground">Delhivery Express</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Tracking ID (AWB)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{order.delhivery_awb}</span>
                        <button 
                          onClick={() => handleCopyAwb(order.delhivery_awb)}
                          className="p-1 hover:bg-sand rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy AWB Number"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-foreground" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Order Type</span>
                      <span className="font-semibold text-foreground uppercase">
                        {tracking?.order_type || (order.payment_method === "cod" ? "COD" : "Prepaid")}
                      </span>
                    </div>
                  </div>

                  {/* Route & Latest Activity */}
                  <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Activity */}
                    <div className="bg-card p-3.5 rounded-xl border border-border/70 space-y-1">
                      <span className="text-muted-foreground font-semibold uppercase tracking-wider block text-[10px]">
                        Latest Status & Activity
                      </span>
                      <div className="font-bold text-foreground text-sm">
                        {tracking?.instructions || tracking?.status || "Shipment Manifested"}
                      </div>
                      {tracking?.status_location && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-secondary shrink-0" />
                          <span>Current Hub: <strong className="text-foreground">{tracking.status_location}</strong></span>
                        </div>
                      )}
                      {tracking?.status_time && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>Last update: {formatDelhiveryTime(tracking.status_time)}</span>
                        </div>
                      )}
                    </div>

                    {/* Route & Dates */}
                    <div className="bg-card p-3.5 rounded-xl border border-border/70 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-muted-foreground font-semibold uppercase tracking-wider block text-[10px]">
                          Shipment Route
                        </span>
                        <div className="font-semibold text-foreground text-xs flex items-center gap-1.5 mt-0.5">
                          <span className="bg-muted px-2 py-0.5 rounded">{tracking?.origin || "Surat (Gujarat)"}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="bg-muted px-2 py-0.5 rounded">{tracking?.destination || tracking?.consignee_city || order?.shipping_address?.city || "Destination"}</span>
                        </div>
                      </div>

                      {tracking?.pickup_date && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>Manifest Date: {formatDelhiveryTime(tracking.pickup_date)}</span>
                        </div>
                      )}

                      {tracking?.expected_delivery && (
                        <div className="text-foreground font-semibold flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-secondary shrink-0" />
                          <span>Estimated Delivery: {formatDelhiveryTime(tracking.expected_delivery)}</span>
                        </div>
                      )}

                      {tracking?.received_by && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle className="h-3 w-3 shrink-0" />
                          <span>Received by: {tracking.received_by}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Scans History */}
                  {tracking?.scans && tracking.scans.length > 0 && (
                    <div className="pt-3 border-t border-border/60">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2.5">
                        Live Tracking Scan Milestones ({tracking.scans.length})
                      </span>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                        {tracking.scans.map((scan: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
                            <div>
                              <div className="font-semibold text-foreground">{scan.instructions || scan.scan}</div>
                              {scan.location && (
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-2.5 w-2.5 text-secondary" /> {scan.location}
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                              {formatDelhiveryTime(scan.time)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-foreground">
                  <PackageOpen className="h-4 w-4" /> Order Items ({order.items?.length || 0})
                </h4>
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt={item.name} 
                      className="h-16 w-16 rounded-xl object-cover bg-sand/30 border border-border" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground line-clamp-1">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity || item.qty || 1}</div>
                    </div>
                    <div className="font-bold text-foreground">{inr(item.price)}</div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="mt-6 pt-5 border-t border-border flex justify-between items-center text-lg font-bold text-foreground">
                <span>Total Amount</span>
                <span>{inr(order.total)}</span>
              </div>

            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
