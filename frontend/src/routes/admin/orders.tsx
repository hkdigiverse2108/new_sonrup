import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminGetOrders, apiAdminUpdateOrderStatus, apiAdminShipOrder, apiAdminPickupOrder, apiAdminCancelShipment, apiAdminDeleteOrder } from "@/lib/api";
import { CheckCircle, Clock, Truck, Package, Printer, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin_orders"],
    queryFn: apiAdminGetOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiAdminUpdateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
  });

  const shipMutation = useMutation({
    mutationFn: (id: string) => apiAdminShipOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
  });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => apiAdminPickupOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiAdminCancelShipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiAdminDeleteOrder(id),
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[800px] text-left text-sm">
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
                    {order.delhivery_awb ? (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-[#E8F2F1] px-2.5 py-1 text-xs font-bold text-[#297C82]">
                            DELHIVERY
                          </span>
                          <span className="text-[13px] font-semibold text-[#0A548B]">{order.delhivery_awb}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mr-1">
                          Status: <span className="font-semibold text-[#0A548B]">{order.delhivery_status || 'Manifested'}</span>
                        </div>
                        <div className="flex items-start gap-2 mt-1.5">
                          <button 
                            onClick={() => pickupMutation.mutate(order.id)}
                            disabled={pickupMutation.isPending}
                            className="inline-flex h-7 items-center rounded-full bg-[#788a6d] px-3.5 text-[11px] font-bold tracking-wide text-white hover:bg-[#687a5d] disabled:opacity-50"
                          >
                            PICKUP
                          </button>
                          <button className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#d1bfae] bg-white px-3.5 text-[11px] font-bold tracking-wide text-[#b36340] hover:bg-stone-50">
                            <Printer className="h-3 w-3" /> LABEL
                          </button>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => cancelMutation.mutate(order.id)}
                              disabled={cancelMutation.isPending}
                              className="inline-flex h-7 items-center rounded-full bg-[#f8ede5] px-3.5 text-[11px] font-bold tracking-wide text-[#cc5f39] hover:bg-[#F0DDCF] disabled:opacity-50"
                            >
                              CANCEL
                            </button>
                            <button 
                              onClick={async () => {
                                if (await confirm({ title: "Cancel Shipment", message: "Are you sure you want to cancel this shipment?" })) {
                                  cancelMutation.mutate(order.id);
                                }
                              }}
                              disabled={cancelMutation.isPending}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => shipMutation.mutate(order.id)}
                          disabled={shipMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-full bg-[#3E332A] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#2C241E] disabled:opacity-50"
                        >
                          {shipMutation.isPending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <Truck className="h-4 w-4" />
                          )}
                          SHIP ORDER
                        </button>
                        <button
                          onClick={async () => {
                            if (await confirm({ title: "Delete Order", message: "Are you sure you want to delete this order? This action cannot be undone." })) {
                              deleteMutation.mutate(order.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
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
