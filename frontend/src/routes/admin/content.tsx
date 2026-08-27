import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical, ChevronDown, Home, Star, Layers, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: (search.section as string) || "hero",
  }),
  component: AdminContent,
});

// ─── Field Label ──────────────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{children}</span>;
}

// ─── Save Bar ────────────────────────────────────────────────────────────────
function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-border pt-5 mt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Saving…
          </>
        ) : "Save Changes"}
      </button>
    </div>
  );
}

// ─── Accordion Section ────────────────────────────────────────────────────────
function AccordionSection({
  icon: Icon,
  title,
  desc,
  index,
  open,
  onToggle,
  children,
}: {
  icon: any;
  title: string;
  desc: string;
  index: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all ${open ? "border-primary/30 shadow-sm" : "border-border"} bg-card`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/30"
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {index}
        </span>
        <Icon className={`h-5 w-5 shrink-0 transition-colors ${open ? "text-primary" : "text-muted-foreground"}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold uppercase tracking-wide ${open ? "text-primary" : "text-foreground"}`}>{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`transition-all duration-300 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
        <div className="border-t border-border px-6 pb-6 pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminContent() {
  const { section } = Route.useSearch();
  const [openSection, setOpenSection] = useState<string>(section || "hero");

  // When URL section param changes (sidebar click), open that section
  useEffect(() => {
    if (section) setOpenSection(section);
  }, [section]);

  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !formData) {
      setFormData(JSON.parse(JSON.stringify(homeContent)));
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const toggle = (id: string) => setOpenSection((prev) => (prev === id ? "" : id));
  const save = () => saveMutation.mutate(formData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Content Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">Edit all sections of your home page. Click a section to expand and edit.</p>
      </div>

      <div className="space-y-3">
        {/* Hero Section */}
        <AccordionSection icon={Home} title="Hero Section" desc="Rotating taglines & stats" index={1} open={openSection === "hero"} onToggle={() => toggle("hero")}>
          <HeroEditor formData={formData} setFormData={setFormData} onSave={save} saving={saveMutation.isPending} />
        </AccordionSection>

        {/* Trust Strip */}
        <AccordionSection icon={Star} title="Trust Strip" desc="Marquee announcement bar" index={2} open={openSection === "trust"} onToggle={() => toggle("trust")}>
          <TrustStripEditor formData={formData} setFormData={setFormData} onSave={save} saving={saveMutation.isPending} />
        </AccordionSection>

        {/* Why Us */}
        <AccordionSection icon={Layers} title="Why Us Section" desc="Features & benefits" index={3} open={openSection === "why"} onToggle={() => toggle("why")}>
          <WhyEditor formData={formData} setFormData={setFormData} onSave={save} saving={saveMutation.isPending} />
        </AccordionSection>

        {/* Ingredient Story */}
        <AccordionSection icon={CheckCircle} title="Ingredient Story" desc="Story section text" index={4} open={openSection === "ingredient"} onToggle={() => toggle("ingredient")}>
          <IngredientEditor formData={formData} setFormData={setFormData} onSave={save} saving={saveMutation.isPending} />
        </AccordionSection>
      </div>
    </div>
  );
}

// ─── Hero Section Editor ──────────────────────────────────────────────────────
function HeroEditor({ formData, setFormData, onSave, saving }: any) {
  const rotate: string[] = formData?.hero?.rotate ?? [];
  const stats: { k: string; v: string }[] = formData?.hero?.stats ?? [];

  const setRotate = (r: string[]) => setFormData({ ...formData, hero: { ...formData.hero, rotate: r } });
  const setStats = (s: { k: string; v: string }[]) => setFormData({ ...formData, hero: { ...formData.hero, stats: s } });

  return (
    <div className="space-y-6">
      {/* Rotating taglines */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Rotating Taglines</p>
            <p className="text-xs text-muted-foreground mt-0.5">These cycle through in the hero headline animation.</p>
          </div>
          <button type="button" onClick={() => setRotate([...rotate, "New tagline"])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {rotate.length === 0 && <p className="rounded-xl border border-dashed border-border py-4 text-center text-sm text-muted-foreground">No taglines. Click Add.</p>}
          {rotate.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <input className="field flex-1" value={item} onChange={(e) => { const n = [...rotate]; n[i] = e.target.value; setRotate(n); }} />
              <button type="button" onClick={() => setRotate(rotate.filter((_, j) => j !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Hero Stats</p>
            <p className="text-xs text-muted-foreground mt-0.5">Numbers shown below the headline (e.g. "10K+ Happy Customers").</p>
          </div>
          <button type="button" onClick={() => setStats([...stats, { k: "10K+", v: "Happy Customers" }])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {stats.length === 0 && <p className="rounded-xl border border-dashed border-border py-4 text-center text-sm text-muted-foreground">No stats. Click Add.</p>}
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <div className="flex flex-1 gap-2">
                <input className="field flex-1" placeholder="Value (e.g. 10K+)" value={stat.k} onChange={(e) => { const n = [...stats]; n[i] = { ...n[i], k: e.target.value }; setStats(n); }} />
                <input className="field flex-1" placeholder="Label (e.g. Happy Customers)" value={stat.v} onChange={(e) => { const n = [...stats]; n[i] = { ...n[i], v: e.target.value }; setStats(n); }} />
              </div>
              <button type="button" onClick={() => setStats(stats.filter((_, j) => j !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      {(rotate.length > 0 || stats.length > 0) && (
        <div className="rounded-xl bg-ink p-6 text-center">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">Preview</p>
          <div className="font-display text-2xl font-extrabold text-cream">
            {rotate.slice(0, 3).map((t, i) => (
              <span key={i} className={i === 0 ? "text-primary" : "text-cream/30"}>
                {t}{i < Math.min(rotate.length - 1, 2) ? " · " : ""}
              </span>
            ))}
          </div>
          {stats.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="font-display text-lg font-extrabold text-primary">{s.k}</p>
                  <p className="text-xs text-cream/50">{s.v}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SaveBar onSave={onSave} saving={saving} />
    </div>
  );
}

// ─── Trust Strip Editor ───────────────────────────────────────────────────────
function TrustStripEditor({ formData, setFormData, onSave, saving }: any) {
  const items: string[] = formData?.trust_strip ?? [];
  const setItems = (v: string[]) => setFormData({ ...formData, trust_strip: v });
  return (
    <div className="space-y-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Scrolling messages shown in the announcement bar at the top.</p>
        <button type="button" onClick={() => setItems([...items, "NEW MESSAGE"])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
            <input className="field flex-1 uppercase" value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value.toUpperCase(); setItems(n); }} />
            <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <SaveBar onSave={onSave} saving={saving} />
    </div>
  );
}

// ─── Why Us Editor ────────────────────────────────────────────────────────────
function WhyEditor({ formData, setFormData, onSave, saving }: any) {
  const why = formData?.why ?? { title: "", sub: "", features: [] };
  const setWhy = (v: any) => setFormData({ ...formData, why: v });
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>Section Title</Label>
          <input className="field" value={why.title} onChange={(e) => setWhy({ ...why, title: e.target.value })} />
        </label>
        <label className="grid gap-1.5 sm:col-span-2">
          <Label>Subtitle / Tagline</Label>
          <input className="field" value={why.sub} onChange={(e) => setWhy({ ...why, sub: e.target.value })} />
        </label>
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Features</p>
          <button type="button" onClick={() => setWhy({ ...why, features: [...(why.features ?? []), { title: "", desc: "" }] })} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {(why.features ?? []).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <div className="flex flex-1 gap-2">
                <input className="field flex-1" placeholder="Title" value={f.title} onChange={(e) => { const n = [...why.features]; n[i] = { ...n[i], title: e.target.value }; setWhy({ ...why, features: n }); }} />
                <input className="field flex-1" placeholder="Description" value={f.desc} onChange={(e) => { const n = [...why.features]; n[i] = { ...n[i], desc: e.target.value }; setWhy({ ...why, features: n }); }} />
              </div>
              <button type="button" onClick={() => setWhy({ ...why, features: why.features.filter((_: any, j: number) => j !== i) })} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <SaveBar onSave={onSave} saving={saving} />
    </div>
  );
}

// ─── Ingredient Story Editor ──────────────────────────────────────────────────
function IngredientEditor({ formData, setFormData, onSave, saving }: any) {
  const ing = formData?.ingredient_story ?? { eyebrow: "", title: "", sub: "" };
  const setIng = (v: any) => setFormData({ ...formData, ingredient_story: v });
  return (
    <div className="space-y-4">
      <label className="grid gap-1.5">
        <Label>Eyebrow (small label above title)</Label>
        <input className="field" value={ing.eyebrow} onChange={(e) => setIng({ ...ing, eyebrow: e.target.value })} />
      </label>
      <label className="grid gap-1.5">
        <Label>Title</Label>
        <input className="field" value={ing.title} onChange={(e) => setIng({ ...ing, title: e.target.value })} />
      </label>
      <label className="grid gap-1.5">
        <Label>Subtitle / Description</Label>
        <textarea className="field min-h-[100px]" value={ing.sub} onChange={(e) => setIng({ ...ing, sub: e.target.value })} />
      </label>
      <SaveBar onSave={onSave} saving={saving} />
    </div>
  );
}
