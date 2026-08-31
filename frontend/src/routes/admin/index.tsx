import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  IndianRupee, 
  Mail, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MessageSquare, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { 
  apiAdminGetOrders, 
  useProducts, 
  useAdminSubscribers, 
  useAdminContacts,
  useAdminCustomers
} from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  // Fetch real-time data from backend APIs
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ["admin_orders"],
    queryFn: apiAdminGetOrders,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: subscribers = [], isLoading: isLoadingSubscribers } = useAdminSubscribers();
  const { data: contacts = [], isLoading: isLoadingContacts } = useAdminContacts();
  const { data: customers = [], isLoading: isLoadingCustomers } = useAdminCustomers();

  // Loading state
  const isLoadingAny = isLoadingOrders || isLoadingProducts || isLoadingSubscribers || isLoadingContacts || isLoadingCustomers;

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Status breakdown
  const statusCounts = orders.reduce((acc: Record<string, number>, order) => {
    const status = (order.status || "Pending").toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pendingCount = statusCounts["pending"] || 0;
  const processingCount = statusCounts["processing"] || statusCounts["accepted"] || 0;
  const shippedCount = statusCounts["shipped"] || 0;
  const deliveredCount = statusCounts["delivered"] || 0;

  // Format currency helper
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Recent Items
  const recentOrders = orders.slice(0, 5);
  const recentContacts = contacts.slice(0, 4);

  // Stats styled based on website's color tokens (primary=gold, secondary=red, leaf=green, grape=purple)
  const stats = [
    { 
      name: "Total Revenue", 
      value: formatINR(totalRevenue), 
      sub: `Average Order: ${formatINR(aov)}`,
      icon: IndianRupee,
      color: "from-[#B28A30]/10 to-[#B28A30]/5 text-[#B28A30] border-amber-500/20" 
    },
    { 
      name: "Total Orders", 
      value: totalOrders.toString(), 
      sub: `${pendingCount} orders pending`,
      icon: ShoppingCart,
      color: "from-secondary/15 to-secondary/5 text-secondary border-secondary/25" 
    },
    { 
      name: "Active Customers", 
      value: customers.length.toString(), 
      sub: "Registered user accounts",
      icon: Users,
      color: "from-leaf/15 to-leaf/5 text-leaf border-leaf/25" 
    },
    { 
      name: "Newsletter Subscribers", 
      value: subscribers.length.toString(), 
      sub: "Active subscribers",
      icon: Mail,
      color: "from-grape/15 to-grape/5 text-grape border-grape/25" 
    },
  ];

  if (isLoadingAny) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome banner (using --ink and --cream colors) */}
      <div className="relative overflow-hidden rounded-3xl border border-[#e5e1dc] bg-[#3E332A] p-8 text-cream shadow-md">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-cream/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-cream/60">Administrator Portal</span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight mt-1 text-white">Sonrup Management Console</h1>
            <p className="text-sm text-cream/70 mt-2 max-w-xl">
              Track store performance, fulfill orders, manage customers, and update website content in real time.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="self-start md:self-auto flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-xs font-bold text-[#3E332A] transition hover:bg-white"
          >
            Manage Orders <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.name} 
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.name}</span>
              <div className={cn("grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br border", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Main Grid: Orders & Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#3E332A]">Recent Orders</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Quick overview of the latest transactions</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-[#3E332A] hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center border border-dashed rounded-xl p-8">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No orders placed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground font-bold">
                    <th className="pb-3 uppercase tracking-wider">Order ID</th>
                    <th className="pb-3 uppercase tracking-wider">Customer</th>
                    <th className="pb-3 uppercase tracking-wider">Status</th>
                    <th className="pb-3 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="group hover:bg-muted/30">
                      <td className="py-3.5 font-mono font-medium text-[#3E332A] group-hover:underline">
                        <Link to="/admin/orders">{o.id}</Link>
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-foreground">{o.customer_name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{o.date}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          o.status.toLowerCase() === "delivered" && "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
                          o.status.toLowerCase() === "shipped" && "bg-blue-50 text-blue-700 border border-blue-200/50",
                          o.status.toLowerCase() === "pending" && "bg-amber-50 text-amber-700 border border-amber-200/50",
                          o.status.toLowerCase() === "cancelled" && "bg-rose-50 text-rose-700 border border-rose-200/50",
                          o.status.toLowerCase() === "processing" && "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                        )}>
                          {o.status.toLowerCase() === "delivered" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {o.status.toLowerCase() === "shipped" && <Truck className="h-2.5 w-2.5" />}
                          {o.status.toLowerCase() === "pending" && <Clock className="h-2.5 w-2.5" />}
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-foreground">
                        {formatINR(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fulfillment status breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[#3E332A]">Fulfillment Summary</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Order distribution by status</p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Delivered", count: deliveredCount, color: "bg-leaf", icon: CheckCircle2 },
              { label: "Shipped", count: shippedCount, color: "bg-primary", icon: Truck },
              { label: "Processing", count: processingCount, color: "bg-secondary", icon: Clock },
              { label: "Pending", count: pendingCount, color: "bg-amber-500", icon: Clock },
            ].map((item) => {
              const pct = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {item.label}
                    </span>
                    <span className="font-bold text-muted-foreground">{item.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", item.color)} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Product catalog</span>
              <span className="font-bold text-[#3E332A] flex items-center gap-1">
                <Package className="h-3.5 w-3.5" /> {products.length} products
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Open contact queries</span>
              <span className="font-bold text-[#3E332A] flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> {contacts.length} submissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Contacts timeline */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact submissions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-extrabold tracking-tight text-[#3E332A]">Recent Inquiries</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest contact submissions from visitors</p>
            </div>
            <Link to="/admin/contacts" className="text-xs font-bold text-[#3E332A] hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {recentContacts.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center border border-dashed rounded-xl p-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No inquiries received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentContacts.map((c) => (
                <div key={c.id || c.email} className="flex gap-4 p-3 rounded-xl hover:bg-muted/40 transition">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#3E332A]/5 text-[#3E332A] font-bold text-xs uppercase">
                    {c.name?.slice(0, 2) || "CO"}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", {day: "numeric", month: "short"}) : ""}</span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground truncate">{c.email}</div>
                    <p className="text-[11px] text-[#3E332A]/90 leading-relaxed line-clamp-2 mt-1 bg-cream/20 border border-sand rounded-lg p-2 font-serif italic">
                      "{c.message}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links & tips */}
        <div className="rounded-2xl border border-[#e5e1dc] bg-cream/20 p-6 space-y-6">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[#3E332A]">Store Operations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Quick management navigation</p>
          </div>

          <div className="grid gap-2">
            {[
              { label: "Manage Products", to: "/admin/products" },
              { label: "View Customers", to: "/admin/customers" },
              { label: "Manage FAQs", to: "/admin/settings/faqs" },
              { label: "Write Blog Article", to: "/admin/post/new" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                params={link.to.includes("post/new") ? { slug: "new" } : undefined}
                className="flex items-center justify-between rounded-xl bg-white border border-border p-3 text-xs font-bold text-[#3E332A] hover:bg-gray-50 transition shadow-sm"
              >
                {link.label}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-amber-200/50 p-4 shadow-sm flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800">Operational Tip</h4>
              <p className="text-[10px] text-amber-800/80 leading-normal">
                Make sure to double check product MRP and Price values. In Sonrup, if MRP and Price are the same, only the price shows to the user.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
