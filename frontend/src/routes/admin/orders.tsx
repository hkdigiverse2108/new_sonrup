import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminGetOrders, apiAdminUpdateOrderStatus } from "@/lib/api";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin_orders"],
    queryFn: apiAdminGetOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiAdminUpdateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and update shipping status.</p>
      </div>

      {isLoading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 font-semibold">₹{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      order.status === "Processing" ? "bg-amber-100 text-amber-800" :
                      order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {order.status === "Processing" && <Clock className="h-3 w-3" />}
                      {order.status === "Shipped" && <Truck className="h-3 w-3" />}
                      {order.status === "Delivered" && <CheckCircle className="h-3 w-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
