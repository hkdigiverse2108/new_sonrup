import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/content/trust")({
  component: TrustPage,
});

function TrustPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();
  const [formData, setFormData] = useState<any>(null);
  useEffect(() => {
    if (homeContent && !formData) setFormData(JSON.parse(JSON.stringify(homeContent)));
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !formData) return <Spinner />;

  const items: string[] = formData?.trust_strip ?? [];
  const setItems = (v: string[]) => setFormData({ ...formData, trust_strip: v });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content CMS</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Trust Strip</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit the scrolling marquee messages in the announcement bar at the top of the page.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-extrabold">Marquee Messages</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">These scroll continuously across the top of your website.</p>
          </div>
          <button type="button" onClick={() => setItems([...items, "NEW MESSAGE"])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 && <p className="px-6 py-6 text-center text-sm text-muted-foreground">No messages. Click Add.</p>}
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <input className="field flex-1 uppercase" value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value.toUpperCase(); setItems(n); }} />
              <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      {items.length > 0 && (
        <div className="overflow-hidden rounded-2xl bg-ink py-3">
          <div className="flex gap-8 whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-cream/60 px-6">
            {items.map((t, i) => <span key={i}>{t} <span className="mx-3 text-primary">✦</span></span>)}
          </div>
        </div>
      )}

      <SaveBar onSave={() => saveMutation.mutate(formData)} saving={saveMutation.isPending} />
    </div>
  );
}

function Spinner() {
  return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex justify-end">
      <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60">
        {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />Saving…</> : "Save Changes"}
      </button>
    </div>
  );
}
