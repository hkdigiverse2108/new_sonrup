import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminGetOrders, apiAdminCreateOfflineOrder, apiAdminUpdateOrderStatus, apiAdminShipOrder, apiAdminPickupOrder, apiAdminCancelShipment, apiAdminDeleteOrder, apiAdminGetOrderLabel, fetchJson } from "@/lib/api";
import { CheckCircle, Clock, Truck, Package, Printer, Trash2, Plus, X, User, MapPin, PlusCircle, CreditCard } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin_orders"],
    queryFn: apiAdminGetOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => apiAdminUpdateOrderStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("Status updated"); },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  });

  const shipMutation = useMutation({
    mutationFn: (id: string) => apiAdminShipOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("Order shipped"); },
    onError: (err: any) => toast.error(err.message || "Failed to ship order"),
  });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => apiAdminPickupOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("Pickup scheduled"); },
    onError: (err: any) => toast.error(err.message || "Failed to schedule pickup"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiAdminCancelShipment(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("Shipment canceled"); },
    onError: (err: any) => toast.error(err.message || "Failed to cancel shipment"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiAdminDeleteOrder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin_orders"] }); toast.success("Order deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete order"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and update shipping status.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Offline Order
        </button>
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
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order, idx) => (
                <tr key={order.id ? `order-${order.id}-${idx}` : `order-row-${idx}`} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>{order.customer_name}</div>
                    {order.customer_email ? <div className="text-xs text-muted-foreground">{order.customer_email}</div> : null}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 font-semibold">₹{order.total}</td>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full w-max ${
                        order.payment_method === 'cod' ? 'bg-amber-100 text-amber-800' :
                        order.payment_method === 'upi' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {order.payment_method === 'cod' ? 'COD' : order.payment_method === 'upi' ? 'UPI' : 'Razorpay'}
                      </span>
                      {order.is_offline && (
                        <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 w-max">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </td>
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
                            disabled={pickupMutation.isPending || order.delhivery_status === 'Pickup Scheduled'}
                            className="inline-flex h-7 items-center rounded-full bg-[#788a6d] px-3.5 text-[11px] font-bold tracking-wide text-white hover:bg-[#687a5d] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {order.delhivery_status === 'Pickup Scheduled' ? 'SCHEDULED' : 'PICKUP'}
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
                                const phone = data.phone || data.mobile || data.cust_phone || data.ph || "";
                                const itemsRows = order.items && order.items.length > 0
                                  ? order.items.map((item: any) => `
                                      <tr>
                                        <td>${item.name || 'Gummy Tube'} (${item.qty || 1})</td>
                                        <td>₹${Number(item.price || 0).toFixed(2)}</td>
                                        <td>₹${Number((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
                                      </tr>
                                    `).join("")
                                  : `
                                      <tr>
                                        <td>${data.prd}</td>
                                        <td>₹${Number(data.rs).toFixed(2)}</td>
                                        <td>₹${Number(data.rs).toFixed(2)}</td>
                                      </tr>
                                    `;
                                const totalDisplayPrice = order.total ? Number(order.total).toFixed(2) : Number(data.rs).toFixed(2);
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
                                        width: 45%;
                                        height: 52px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 14px;
                                        font-weight: bold;
                                        border-right: 1.5px solid #000;
                                        box-sizing: border-box;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                      }
                                      .header-col-right {
                                        width: 55%;
                                        height: 52px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        box-sizing: border-box;
                                      }
                                      .delhivery-logo {
                                        height: 38px;
                                        display: block;
                                        object-fit: contain;
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
                                          ${data.cl || data.snm || ""}
                                        </div>
                                        <div class="header-col-right">
                                          <img loading="lazy" class="delhivery-logo" src="https://track.delhivery.com/static/images/new_logo.png" alt="DELHIVERY" />
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
                                          Shipping Address:<br/>
                                          <span style="font-size: 13px; font-weight: bold; text-transform: uppercase;">${data.name}</span><br/>
                                          <span style="font-size: 11px; display: block; margin-top: 1px; color: #333;">Phone: ${phone}</span>
                                          ${data.address}<br/>
                                          ${data.destination}<br/>
                                          PIN:${data.pin}
                                        </div>
                                        <div class="shipto-right">
                                          <div style="font-weight: bold; font-size: 14px; text-transform: uppercase;">${data.pt}</div>
                                          <div style="font-size: 15px; margin-top: 6px; font-weight: bold; color: #000;">₹${Number(data.cod || data.rs).toFixed(2)}</div>
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
                                          ${itemsRows}
                                          <tr style="border-top: 1.5px solid #000; font-weight: bold;">
                                            <td>Total</td>
                                            <td></td>
                                            <td>₹${totalDisplayPrice}</td>
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

      <AddOfflineOrderModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

function AddOfflineOrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: storeProducts = [] } = useQuery<any[]>({
    queryKey: ["products"],
    queryFn: () => fetchJson<any[]>("/api/products"),
    enabled: isOpen,
  });

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Paid");

  const [items, setItems] = useState<any[]>([
    { slug: "custom", name: "", price: 0, qty: 1, count: "1 Unit", image: "" }
  ]);

  const handlePaymentMethodChange = (method: "upi" | "cod") => {
    setPaymentMethod(method);
    if (method === "upi") {
      setPaymentStatus("Paid");
    } else {
      setPaymentStatus("Pending");
    }
  };

  const handleSelectProduct = (index: number, productSlug: string) => {
    if (productSlug === "custom") {
      const updated = [...items];
      updated[index] = { ...updated[index], slug: "custom", name: "", price: 0 };
      setItems(updated);
      return;
    }
    const found = storeProducts.find((p) => p.slug === productSlug);
    if (found) {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        slug: found.slug,
        name: found.name,
        price: found.price,
        count: found.count || "1 Unit",
        image: found.image || "",
      };
      setItems(updated);
    }
  };

  const updateItemField = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { slug: "custom", name: "", price: 0, qty: 1, count: "1 Unit", image: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);

  const createMutation = useMutation({
    mutationFn: apiAdminCreateOfflineOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
      toast.success("Offline order created successfully!");
      onClose();
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create offline order");
    }
  });

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setLine1("");
    setCity("");
    setState("");
    setPincode("");
    setLandmark("");
    setPaymentMethod("upi");
    setPaymentStatus("Paid");
    setItems([{ slug: "custom", name: "", price: 0, qty: 1, count: "1 Unit", image: "" }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }
    if (!line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error("Please enter complete shipping address (Address, City, State, Pincode)");
      return;
    }

    const validItems = items.filter(i => i.name.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one product item with a name");
      return;
    }

    const payload = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || "",
      line1: line1.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      items: validItems.map(item => ({
        slug: item.slug || "custom",
        name: item.name.trim(),
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 1,
        count: item.count || "1 Unit",
        image: item.image || ""
      })),
      payment_method: paymentMethod, // "upi" or "cod"
      payment_status: paymentStatus,
      status: "Processing",
      shipping_fee: 0,
      notes: ""
    };

    createMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-display font-bold">Add Offline Order</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Create a manual offline order for walking/direct customers.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-4 w-4" /> Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Shipping Address
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="House/Shop No., Street Name, Area"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 380001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Bus Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4" /> Order Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex-1 w-full md:w-auto">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Select Store Product</label>
                    <select
                      value={item.slug}
                      onChange={(e) => handleSelectProduct(idx, e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="custom">-- Custom Item --</option>
                      {storeProducts.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 w-full md:w-auto">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Product Name"
                      value={item.name}
                      onChange={(e) => updateItemField(idx, "name", e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="w-24">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.price}
                      onChange={(e) => updateItemField(idx, "price", parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="w-20">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.qty}
                      onChange={(e) => updateItemField(idx, "qty", parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="w-24 text-right pt-4 md:pt-0">
                    <div className="text-[10px] font-bold text-muted-foreground">Total</div>
                    <div className="text-xs font-bold text-foreground">
                      ₹{((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600 p-1 mt-4 md:mt-0"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Payment Method *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("upi")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-bold transition-all ${
                      paymentMethod === "upi"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    UPI / Online
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("cod")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-bold transition-all ${
                      paymentMethod === "cod"
                        ? "border-amber-600 bg-amber-50 text-amber-800 shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    COD
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Order Total</div>
              <div className="text-xs text-muted-foreground mt-0.5">Status will update automatically via Delhivery</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-primary">₹{grandTotal.toFixed(2)}</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
