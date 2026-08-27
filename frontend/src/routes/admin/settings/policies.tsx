import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminDeletePolicy, usePolicies } from "@/lib/api";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/settings/policies")({
  component: PoliciesSettingsPage,
});

function PoliciesSettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: policies = [], isLoading  } = usePolicies();

  const deletePolicyMutation = useMutation({
    mutationFn: (slug: string) => apiAdminDeletePolicy(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Policy deleted");
    },
    onError: () => toast.error("Failed to delete policy"),
  });

  const confirm = useConfirm();

  const handleDelete = async (slug: string) => {
    const ok = await confirm({
      title: "Delete Policy",
      message: "Are you sure you want to delete this policy?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (ok) {
      deletePolicyMutation.mutate(slug);
    }
  };

  return (
    <div className="space-y-12 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Legal Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage footer policies like Privacy Policy and Terms & Conditions.</p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/policy/$slug", params: { slug: "new" } })}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90"
        >
          <Plus className="h-4 w-4" /> CREATE NEW POLICY
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">No policies found. Create your first policy!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <div key={p.slug} className="group relative rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md">
              <div className="absolute right-4 top-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                <button
                  onClick={() => navigate({ to: "/admin/policy/$slug", params: { slug: p.slug } })}
                  className="grid h-8 w-8 place-items-center rounded-full bg-gray-50 text-muted-foreground shadow-sm border hover:text-primary hover:bg-white"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.slug)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 shadow-sm border border-red-100 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-2 font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">/{p.slug}</p>
              {p.updatedAt && (
                <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Last updated: {p.updatedAt}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
