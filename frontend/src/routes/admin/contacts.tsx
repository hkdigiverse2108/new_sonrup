import { createFileRoute } from "@tanstack/react-router";
import { useAdminContacts, apiAdminDeleteContact } from "@/lib/api";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X, Eye } from "lucide-react";
import { toast } from "sonner";

import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContactsPage,
});

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  // Force parsing as UTC if it doesn't have a timezone specifier
  const cleanStr = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const d = new Date(cleanStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');
  return `${day}-${month}-${year}, ${hoursStr}:${minutes} ${ampm}`;
}

function AdminContactsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: contacts = [], isLoading } = useAdminContacts();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const deleteMutation = useMutation({
    mutationFn: apiAdminDeleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_contacts"] });
      toast.success("Inquiry deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete inquiry");
    }
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "Delete Inquiry",
      message: "Are you sure you want to delete this contact inquiry?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (ok) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-12 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Contact Inquiry</h1>
          <p className="text-sm text-muted-foreground mt-1">View contact submissions from the public website.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Name</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold">Message</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contacts.map((contact, idx) => {
                const dateStr = formatDate(contact.createdAt);
                const isLong = contact.message?.length > 80;
                const displayMessage = isLong 
                  ? contact.message.substring(0, 80) + "..."
                  : contact.message;

                return (
                  <tr 
                    key={contact._id || idx} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedMessage(contact)}
                  >
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                      {contact.name}
                    </td>
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <a href={`mailto:${contact.email}`} className="text-primary hover:underline font-medium">
                          {contact.email}
                        </a>
                        <span className="text-muted-foreground">{contact.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-md break-words">
                      <div title="Click to view full message" className="hover:text-primary transition-colors flex items-center gap-1">
                        <span>{displayMessage}</span>
                        {isLong && <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => handleDelete(e, contact._id)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete Inquiry"
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

      {/* Message Modal Overlay */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#3E332A]">Contact Message</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-gray-100 hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From</span>
                  <p className="font-semibold text-foreground mt-0.5">{selectedMessage.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</span>
                  <p className="text-foreground mt-0.5">{selectedMessage.phone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                  <p className="mt-0.5">
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline font-medium">
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</span>
                <div className="rounded-xl border bg-white p-4 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl bg-[#3E332A] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#3E332A]/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
