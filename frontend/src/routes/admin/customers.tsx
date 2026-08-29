import { createFileRoute } from "@tanstack/react-router";
import { useAdminCustomers, apiAdminDeleteCustomer } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomersPage,
});

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  const cleanStr = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const d = new Date(cleanStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${day}-${month}-${year}, ${hoursStr}:${minutes} ${ampm}`;
}

function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: customers = [], isLoading } = useAdminCustomers();

  const deleteMutation = useMutation({
    mutationFn: apiAdminDeleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_customers"] });
      toast.success("Customer account deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete customer");
    }
  });

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Delete Customer",
      message: `Are you sure you want to permanently delete customer account for "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (ok) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-12 pb-20 pt-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage registered customer accounts and view their order history.</p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No customers registered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold">Customer Name</th>
                <th className="py-3.5 px-4 font-semibold">Email Address</th>
                <th className="py-3.5 px-4 font-semibold">Phone Number</th>
                <th className="py-3.5 px-4 font-semibold text-center">Orders Placed</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer, idx) => {
                const orderCount = customer.orders?.length || 0;
                return (
                  <tr key={customer._id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                      {customer.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      <a href={`mailto:${customer.email}`} className="text-primary hover:underline font-medium">
                        {customer.email}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {customer.phone || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-xs text-center font-bold text-foreground">
                      {orderCount}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(customer._id, customer.name || customer.email)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
