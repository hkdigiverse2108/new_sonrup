import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminGetOrders, apiAdminUpdateOrderStatus, apiAdminShipOrder, apiAdminPickupOrder, apiAdminCancelShipment, apiAdminDeleteOrder, apiAdminGetOrderLabel } from "@/lib/api";
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
    onError: (err: any) => alert(err.message || "Failed to update status"),
  });

  const shipMutation = useMutation({
    mutationFn: (id: string) => apiAdminShipOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
    onError: (err: any) => alert(err.message || "Failed to ship order"),
  });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => apiAdminPickupOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
    onError: (err: any) => alert(err.message || "Failed to schedule pickup"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiAdminCancelShipment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
    onError: (err: any) => alert(err.message || "Failed to cancel shipment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiAdminDeleteOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_orders"] }),
    onError: (err: any) => alert(err.message || "Failed to delete order"),
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
                          <button 
                            onClick={async () => {
                              // Open window synchronously to prevent browser popup blockers from blocking it
                              const printWindow = window.open("about:blank", "_blank");
                              if (!printWindow) {
                                alert("Please allow popups in your browser to view and print the shipping label.");
                                return;
                              }

                              try {
                                const res = await apiAdminGetOrderLabel(order.id);
                                if (!res.label_data) {
                                  printWindow.close();
                                  throw new Error("No label details returned from Delhivery");
                                }
                                const data = res.label_data;
                                const formatDateOnly = (dateStr: string) => {
                                  if (!dateStr) return "";
                                  const d = new Date(dateStr);
                                  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                                };
                                const formatTimeOnly = (dateStr: string) => {
                                  if (!dateStr) return "";
                                  const d = new Date(dateStr);
                                  const hours = String(d.getHours()).padStart(2, '0');
                                  const minutes = String(d.getMinutes()).padStart(2, '0');
                                  const seconds = String(d.getSeconds()).padStart(2, '0');
                                  return `${hours}:${minutes}:${seconds}`;
                                };

                                printWindow.document.write(`
                                  <!DOCTYPE html>
                                  <html>
                                  <head>
                                    <title>Shipping Label - ${data.wbn}</title>
                                    <style>
                                      body {
                                        font-family: 'Times New Roman', Times, serif;
                                        margin: 0;
                                        padding: 0;
                                        background: #fff;
                                        display: flex;
                                        justify-content: center;
                                        align-items: flex-start;
                                      }
                                      .label-container {
                                        width: 380px;
                                        border: 1.5px solid #000;
                                        padding: 0;
                                        box-sizing: border-box;
                                        margin-top: 10px;
                                      }
                                      .flex-row {
                                        display: flex;
                                        width: 100%;
                                      }
                                      .header-col-left {
                                        width: 25%;
                                        height: 52px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 16px;
                                        font-weight: bold;
                                        border-right: 1.5px solid #000;
                                        box-sizing: border-box;
                                      }
                                      .header-col-right {
                                        width: 75%;
                                        height: 52px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        box-sizing: border-box;
                                      }
                                      .delhivery-logo {
                                        height: 35px;
                                        display: block;
                                      }
                                      .barcode-container {
                                        text-align: center;
                                        padding: 8px 0;
                                        border-bottom: 1.5px solid #000;
                                        box-sizing: border-box;
                                      }
                                      .awb-text {
                                        font-size: 13px;
                                        font-weight: bold;
                                        margin-top: 2px;
                                        letter-spacing: 1.5px;
                                      }
                                      .routing-container {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        border-bottom: 1.5px solid #000;
                                        padding: 4px 8px;
                                        box-sizing: border-box;
                                      }
                                      .routing-pincode {
                                        font-size: 20px;
                                        font-weight: bold;
                                        font-family: Arial, sans-serif;
                                      }
                                      .routing-code {
                                        font-size: 20px;
                                        font-weight: bold;
                                        font-family: Arial, sans-serif;
                                      }
                                      .shipto-container {
                                        display: flex;
                                        border-bottom: 1.5px solid #000;
                                      }
                                      .shipto-left {
                                        width: 68%;
                                        padding: 6px 8px;
                                        font-size: 11px;
                                        border-right: 1.5px solid #000;
                                        box-sizing: border-box;
                                        line-height: 1.35;
                                      }
                                      .shipto-right {
                                        width: 32%;
                                        padding: 6px 8px;
                                        font-size: 11px;
                                        text-align: center;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        box-sizing: border-box;
                                      }
                                      .seller-container {
                                        display: flex;
                                        border-bottom: 1.5px solid #000;
                                      }
                                      .seller-left {
                                        width: 65%;
                                        padding: 6px 8px;
                                        font-size: 10px;
                                        border-right: 1.5px solid #000;
                                        box-sizing: border-box;
                                        line-height: 1.3;
                                      }
                                      .seller-right {
                                        width: 35%;
                                        padding: 6px 8px;
                                        font-size: 10px;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        box-sizing: border-box;
                                        line-height: 1.3;
                                      }
                                      .items-table {
                                        width: 100%;
                                        border-collapse: collapse;
                                        border-bottom: 1.5px solid #000;
                                      }
                                      .items-table th, .items-table td {
                                        border-right: 1.5px solid #000;
                                        padding: 6px 8px;
                                        font-size: 11px;
                                        text-align: left;
                                      }
                                      .items-table th:last-child, .items-table td:last-child {
                                        border-right: none;
                                      }
                                      .items-table th {
                                        border-bottom: 1.5px solid #000;
                                        font-weight: normal;
                                      }
                                      .bottom-barcode-container {
                                        text-align: center;
                                        padding: 8px 0 4px 0;
                                        box-sizing: border-box;
                                      }
                                      .bottom-return-container {
                                        border-top: 1.5px solid #000;
                                        padding: 6px 8px;
                                        font-size: 9px;
                                        line-height: 1.3;
                                        box-sizing: border-box;
                                      }
                                      @media print {
                                        body { margin: 0; }
                                        .label-container { margin: 0; border: 1.5px solid #000; }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="label-container">
                                      <div class="flex-row" style="border-bottom: 1.5px solid #000;">
                                        <div class="header-col-left">
                                          ${data.snm}
                                        </div>
                                        <div class="header-col-right">
                                          <img class="delhivery-logo" src="https://track.delhivery.com/static/images/new_logo.png" alt="DELHIVERY" />
                                        </div>
                                      </div>
                                      
                                      <div class="barcode-container">
                                        <svg id="awb-barcode" style="margin: 0 auto; display: block;"></svg>
                                        <div class="awb-text">${data.wbn}</div>
                                      </div>
                                      
                                      <div class="routing-container">
                                        <div class="routing-pincode">${data.pin}</div>
                                        <div class="routing-code">${data.sort_code}</div>
                                      </div>
                                      
                                      <div class="shipto-container">
                                        <div class="shipto-left">
                                          Ship To:<br/>
                                          <span style="font-size: 13px; font-weight: bold; text-transform: uppercase;">${data.name}</span><br/>
                                          <span style="font-size: 11px; display: block; margin-top: 1px; color: #333;">${data.name}</span>
                                          ${data.address}<br/>
                                          ${data.destination}<br/>
                                          PIN:${data.pin}
                                        </div>
                                        <div class="shipto-right">
                                          <div style="font-weight: bold;">${data.pt}</div>
                                          <div style="font-size: 10px; margin: 1px 0;">Surface</div>
                                          <div style="font-size: 13px; margin-top: 12px; font-weight: bold;">INR ${Math.round(data.cod || data.rs)}</div>
                                        </div>
                                      </div>
                                      
                                      <div class="seller-container">
                                        <div class="seller-left">
                                          Seller: ${data.snm}<br/>
                                          Address: ${data.sadd}<br/>
                                          GST: ${data.client_gst_tin || '24-UR'}
                                        </div>
                                        <div class="seller-right">
                                          Date: ${formatDateOnly(data.cd)}<br/>
                                          ${formatTimeOnly(data.cd)}
                                        </div>
                                      </div>
                                      
                                      <table class="items-table">
                                        <thead>
                                          <tr>
                                            <th style="width: 65%;">Product(Qty)</th>
                                            <th style="width: 17.5%;">Price</th>
                                            <th style="width: 17.5%;">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>${data.prd}</td>
                                            <td>INR ${Math.round(data.rs)}</td>
                                            <td>INR ${Math.round(data.rs)}</td>
                                          </tr>
                                          <tr style="border-top: 1.5px solid #000; font-weight: bold;">
                                            <td>Total</td>
                                            <td>INR ${Math.round(data.rs)}</td>
                                            <td>INR ${Math.round(data.rs)}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      
                                      <div class="bottom-barcode-container">
                                        <svg id="oid-barcode" style="margin: 0 auto; display: block;"></svg>
                                        <span style="font-size: 10px; font-weight: bold; letter-spacing: 1px; margin-top: 2px; display: block;">${data.oid}</span>
                                      </div>

                                      <div class="bottom-return-container">
                                        Return Address: ${data.radd}
                                      </div>
                                    </div>

                                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                                    <script>
                                      window.onload = function() {
                                        try {
                                          JsBarcode("#awb-barcode", "${data.wbn}", {
                                            format: "CODE128",
                                            width: 1.8,
                                            height: 55,
                                            displayValue: false,
                                            margin: 0
                                          });
                                        } catch(e) {
                                          console.error(e);
                                        }
                                        try {
                                          JsBarcode("#oid-barcode", "${data.oid}", {
                                            format: "CODE128",
                                            width: 1.4,
                                            height: 35,
                                            displayValue: false,
                                            margin: 0
                                          });
                                        } catch(e) {
                                          console.error(e);
                                        }
                                        window.print();
                                      }
                                    </script>
                                  </body>
                                  </html>
                                `);
                                printWindow.document.close();
                              } catch (err: any) {
                                printWindow.close();
                                alert(err.message || "Failed to fetch label");
                              }
                            }}
                            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#d1bfae] bg-white px-3.5 text-[11px] font-bold tracking-wide text-[#b36340] hover:bg-stone-50"
                          >
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
