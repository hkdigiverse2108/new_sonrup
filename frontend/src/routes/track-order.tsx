import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle, Clock, Truck, Package, PackageOpen, Search } from "lucide-react";
import { Container } from "@/components/site/Page";
import { BrandButton } from "@/components/site/Primitives";
import { Input } from "@/components/ui/input";
import { apiTrackOrder } from "@/lib/api";
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
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const searchParams = Route.useSearch();
  const [query, setQuery] = useState(searchParams.query || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) {
      toast.error("Please enter your Order ID or AWB number");
      return;
    }
    
    setLoading(true);
    setOrder(null);
    try {
      const data = await apiTrackOrder(query);
      setOrder(data);
    } catch (err: any) {
      toast.error(err.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-background flex flex-col pt-6 md:pt-10 pb-20">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="bg-leaf/15 h-16 w-16 rounded-full flex items-center justify-center mb-6">
              <Truck className="h-7 w-7 text-leaf" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-foreground">Track Your Package</h1>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Enter your Sonrup Order ID or Delhivery Waybill (AWB) number to watch your gummies progress to your doorstep.
            </p>
          </div>
          
          <form onSubmit={handleTrack} className="bg-card p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="query" 
                placeholder="Enter Order ID or Delhivery AWB..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                required 
                className="pl-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 w-full"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-foreground text-background rounded-full font-bold tracking-wide text-sm hover:bg-foreground/90 transition-colors disabled:opacity-70 whitespace-nowrap"
            >
              {loading ? "SEARCHING..." : "TRACK PACKAGE"}
            </button>
          </form>

          {order && (
            <div className="mt-10 surface-card rounded-3xl shadow-sm border border-border p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
                <div>
                  <div className="font-bold text-lg">{order.id}</div>
                  <div className="text-sm text-muted-foreground">{order.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                    order.status === "Processing" ? "bg-amber-100 text-amber-800" :
                    order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                    order.status === "Delivered" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {order.status === "Processing" && <Clock className="h-4 w-4" />}
                    {order.status === "Shipped" && <Truck className="h-4 w-4" />}
                    {order.status === "Delivered" && <CheckCircle className="h-4 w-4" />}
                    {order.status}
                  </span>
                </div>
              </div>

              {order.delhivery_awb && (
                <div className="mb-6 rounded-xl bg-[#E8F2F1]/50 p-4 border border-[#297C82]/20">
                  <h4 className="font-bold text-[#0A548B] text-sm mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" /> Shipping Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Courier</span>
                      <span className="font-semibold text-[#297C82]">Delhivery</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Tracking ID (AWB)</span>
                      <span className="font-semibold">{order.delhivery_awb}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://www.delhivery.com/track/package/${order.delhivery_awb}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-bold text-white bg-[#0A548B] px-3 py-1.5 rounded-lg hover:bg-[#0A548B]/90 transition-colors"
                  >
                    Track on Delhivery &rarr;
                  </a>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <PackageOpen className="h-4 w-4" /> Order Items
                </h4>
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1">
                      <div className="font-semibold line-clamp-1">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity || item.qty}</div>
                    </div>
                    <div className="font-bold">{inr(item.price)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-border flex justify-between items-center text-lg font-bold">
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
