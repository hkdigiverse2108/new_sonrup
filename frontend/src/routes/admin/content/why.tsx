import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical } from "lucide-react";

export const Route = createFileRoute("/admin/content/why")({
  component: WhyPage,
});

function WhyPage() {
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

  const why = formData?.why ?? { title: "", sub: "", features: [] };
  const setWhy = (v: any) => setFormData({ ...formData, why: v });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content CMS</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Why Us Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit the headline, subtext and feature cards for the "Why Us" section.</p>
      </div>

      {/* Heading fields */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-display text-base font-extrabold">Section Heading</h2>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Title</span>
          <input className="field" value={why.title} onChange={(e) => setWhy({ ...why, title: e.target.value })} placeholder="e.g. Why Choose Sonrup?" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Subtitle / Tagline</span>
          <input className="field" value={why.sub} onChange={(e) => setWhy({ ...why, sub: e.target.value })} placeholder="Short supporting text below title" />
        </label>
      </div>

      {/* Feature cards */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-extrabold">Feature Cards</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Individual benefit cards displayed in the grid.</p>
          </div>
          <button type="button" onClick={() => setWhy({ ...why, features: [...(why.features ?? []), { title: "", desc: "" }] })} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="divide-y divide-border">
          {(why.features ?? []).length === 0 && <p className="px-6 py-6 text-center text-sm text-muted-foreground">No features. Click Add.</p>}
          {(why.features ?? []).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <div className="flex flex-1 gap-3">
                <input className="field flex-1" placeholder="Title" value={f.title} onChange={(e) => { const n = [...why.features]; n[i] = { ...n[i], title: e.target.value }; setWhy({ ...why, features: n }); }} />
                <input className="field flex-1" placeholder="Description" value={f.desc} onChange={(e) => { const n = [...why.features]; n[i] = { ...n[i], desc: e.target.value }; setWhy({ ...why, features: n }); }} />
              </div>
              <button type="button" onClick={() => setWhy({ ...why, features: why.features.filter((_: any, j: number) => j !== i) })} className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

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
