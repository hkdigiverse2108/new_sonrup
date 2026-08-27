import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent } from "@/lib/api";

export const Route = createFileRoute("/admin/content/ingredient")({
  component: IngredientPage,
});

function IngredientPage() {
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

  const ing = formData?.ingredient_story ?? { eyebrow: "", title: "", sub: "" };
  const setIng = (v: any) => setFormData({ ...formData, ingredient_story: v });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content CMS</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Ingredient Story</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit the storytelling section about what goes into the gummies.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Eyebrow (small label above title)</span>
          <input className="field" value={ing.eyebrow} onChange={(e) => setIng({ ...ing, eyebrow: e.target.value })} placeholder="e.g. Real Ingredients" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Title</span>
          <input className="field" value={ing.title} onChange={(e) => setIng({ ...ing, title: e.target.value })} placeholder="e.g. Made with nature's best" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Subtitle / Description</span>
          <textarea className="field min-h-[120px]" value={ing.sub} onChange={(e) => setIng({ ...ing, sub: e.target.value })} placeholder="Supporting description text..." />
        </label>
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
