import { createFileRoute } from "@tanstack/react-router";
import { Users, Package, ShoppingCart, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { name: "Total Revenue", value: "₹45,231", icon: IndianRupee },
    { name: "Total Orders", value: "152", icon: ShoppingCart },
    { name: "Active Customers", value: "89", icon: Users },
    { name: "Products", value: "6", icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Sonrup admin panel.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-3xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Select an option from the sidebar to manage content.</p>
      </div>
    </div>
  );
}
