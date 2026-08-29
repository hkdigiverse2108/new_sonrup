import { createFileRoute } from "@tanstack/react-router";
import { useAdminSubscribers, apiAdminDeleteSubscriber, apiAdminSendBroadcast } from "@/lib/api";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/subscribers")({
  component: AdminSubscribersPage,
});

function AdminSubscribersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: subscribers = [], isLoading } = useAdminSubscribers();
  const [broadcast, setBroadcast] = useState({
    subject: "",
    message: "",
    target: "subscribers",
  });

  const deleteMutation = useMutation({
    mutationFn: apiAdminDeleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_subscribers"] });
      toast.success("Subscriber removed successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove subscriber");
    }
  });

  const broadcastMutation = useMutation({
    mutationFn: apiAdminSendBroadcast,
    onSuccess: (data: any) => {
      toast.success(data.message || "Broadcast email sent successfully!");
      setBroadcast({ subject: "", message: "", target: "subscribers" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send email broadcast");
    }
  });

  const handleDelete = async (email: string) => {
    const ok = await confirm({
      title: "Remove Subscriber",
      message: `Are you sure you want to remove ${email}?`,
      confirmText: "Remove",
      cancelText: "Cancel"
    });
    if (ok) {
      deleteMutation.mutate(email);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcast.subject || !broadcast.message) {
      toast.error("Please fill in both Subject and Message fields.");
      return;
    }
    const ok = await confirm({
      title: "Send Broadcast",
      message: "Are you sure you want to send this broadcast email to all selected recipients?",
      confirmText: "Send",
      cancelText: "Cancel"
    });
    if (ok) {
      broadcastMutation.mutate(broadcast);
    }
  };

  return (
    <div className="space-y-12 pb-20 pt-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Subscribers & Broadcast</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage newsletter subscribers and send broadcast emails to users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-8 items-start">
        {/* Subscribers List Table */}
        <div className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[#3E332A]">Newsletter Subscribers</h2>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center border rounded-xl bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center bg-white">
              <p className="text-muted-foreground text-sm">No subscribers yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm max-h-[500px] overflow-y-auto">
              <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Email Address</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscribers.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-foreground">
                        {sub.email}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.email)}
                          disabled={deleteMutation.isPending}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                          title="Remove Subscriber"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Broadcast Email Form */}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm space-y-6">
          <h2 className="font-display text-xl font-bold text-[#3E332A] flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Send Email Broadcast
          </h2>
          <form onSubmit={handleBroadcastSubmit} className="space-y-3">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">RECIPIENT GROUP</span>
              <select
                className="w-full rounded-md border px-3 py-1.5 text-xs bg-white cursor-pointer"
                value={broadcast.target}
                onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value })}
              >
                <option value="subscribers">All Newsletter Subscribers ({subscribers.length})</option>
                <option value="inquiries">All Unique Contact Inquirers</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EMAIL SUBJECT</span>
              <input
                className="w-full rounded-md border px-3 py-1.5 text-xs"
                type="text"
                value={broadcast.subject}
                onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
                placeholder="e.g. Exciting New Gummy Flavours Are Here!"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">MESSAGE BODY (TEXT)</span>
              <textarea
                className="w-full rounded-md border px-3 py-1.5 text-xs min-h-[220px] leading-relaxed whitespace-pre-wrap"
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                placeholder="Write your email content here. Support linebreaks..."
                required
              />
            </label>

            <button
              type="submit"
              disabled={broadcastMutation.isPending || !broadcast.subject || !broadcast.message}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
            >
              {broadcastMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {broadcastMutation.isPending ? "SENDING BROADCAST..." : "SEND BROADCAST EMAIL"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
