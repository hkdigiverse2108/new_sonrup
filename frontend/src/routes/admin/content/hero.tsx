import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/content/hero")({
  component: HeroPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children }: { children: string }) {
  return <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{children}</span>;
}

function FieldGroup({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h2 className="font-display text-base font-extrabold">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="sticky bottom-4 flex justify-end">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 hover:shadow-primary/30 active:scale-[0.99] disabled:opacity-60"
      >
        {saving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Saving…
          </>
        ) : "💾 Save Changes"}
      </button>
    </div>
  );
}

function Spinner() {
  return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
function HeroPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      // Merge existing data with defaults for new fields
      const h = homeContent?.hero ?? {};
      setForm({
        ...homeContent,
        hero: {
          rotate: h.rotate ?? ["glow", "energy", "immunity", "focus", "calm"],
          stats: h.stats ?? [
            { k: "5000 mcg", v: "Biotin per serving" },
            { k: "60", v: "Gummies per tube" },
            { k: "4.8/5", v: "From 4,356 reviews" },
          ],
          eyebrow: h.eyebrow ?? "Est. 2023 · Made in India",
          headline_line1: h.headline_line1 ?? "A daily ritual",
          headline_line2: h.headline_line2 ?? "worth savouring",
          headline_for_your: h.headline_for_your ?? "for your",
          subtext: h.subtext ?? "Chef-crafted gummies with real fruit flavour and actives listed to the milligram. Nutrition you look forward to, not nutrition you endure.",
          cta1_text: h.cta1_text ?? "Shop the range",
          cta1_href: h.cta1_href ?? "/shop",
          cta2_text: h.cta2_text ?? "Taste the flavours",
          cta2_href: h.cta2_href ?? "#flavours",
          badge1_label: h.badge1_label ?? "Third-party tested",
          badge1_value: h.badge1_value ?? "Every single batch",
          badge2_label: h.badge2_label ?? "Pectin based",
          badge2_value: h.badge2_value ?? "100% vegetarian",
        },
      });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !form) return <Spinner />;

  const hero = form.hero;
  const set = (fields: any) => setForm({ ...form, hero: { ...hero, ...fields } });
  const setRotate = (r: string[]) => set({ rotate: r });
  const setStats = (s: any[]) => set({ stats: s });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content CMS</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Hero Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage all text and content in the main hero banner.</p>
      </div>

      {/* Live preview */}
      <div className="rounded-2xl bg-ink overflow-hidden">
        <div className="px-4 py-2 border-b border-cream/10 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-xs text-cream/30">Live Preview</span>
        </div>
        <div className="px-8 py-8 text-cream">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-xs font-semibold text-cream/70">
            ✨ {hero.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight">
            <span className="block">{hero.headline_line1}</span>
            <span className="block">{hero.headline_line2}</span>
            <span className="mt-1 flex items-baseline gap-3">
              <span className="text-lg font-bold uppercase tracking-widest text-cream/40">{hero.headline_for_your}</span>
              <span className="text-gradient-gold">{hero.rotate?.[0] ?? "immunity"}.</span>
            </span>
          </h2>
          <p className="mt-4 max-w-sm text-sm text-cream/60">{hero.subtext}</p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <span className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground">{hero.cta1_text} →</span>
            <span className="rounded-xl border border-cream/20 px-5 py-2.5 text-xs font-bold text-cream">{hero.cta2_text}</span>
          </div>
          {hero.stats?.length > 0 && (
            <div className="mt-6 flex gap-6 flex-wrap">
              {hero.stats.map((s: any, i: number) => (
                <div key={i}>
                  <p className="font-display text-lg font-extrabold text-primary">{s.k}</p>
                  <p className="text-[10px] uppercase tracking-wider text-cream/40">{s.v}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 1. Eyebrow ── */}
      <FieldGroup title="Eyebrow Badge" desc="Small badge shown above the main headline.">
        <label className="grid gap-1.5">
          <Label>Badge Text</Label>
          <input className="field" value={hero.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} placeholder="Est. 2023 · Made in India" />
        </label>
      </FieldGroup>

      {/* ── 2. Headline ── */}
      <FieldGroup title="Main Headline" desc="The large hero heading — split into 3 parts for styling.">
        <label className="grid gap-1.5">
          <Label>Line 1 (plain text)</Label>
          <input className="field" value={hero.headline_line1} onChange={(e) => set({ headline_line1: e.target.value })} placeholder="A daily ritual" />
        </label>
        <label className="grid gap-1.5">
          <Label>Line 2 (italic highlight)</Label>
          <input className="field" value={hero.headline_line2} onChange={(e) => set({ headline_line2: e.target.value })} placeholder="worth savouring" />
        </label>
        <label className="grid gap-1.5">
          <Label>Prefix before rotating word (e.g. "for your")</Label>
          <input className="field" value={hero.headline_for_your} onChange={(e) => set({ headline_for_your: e.target.value })} placeholder="for your" />
        </label>
      </FieldGroup>

      {/* ── 3. Rotating words ── */}
      <FieldGroup title="Rotating Words" desc="Words that cycle in the gold gradient below the headline.">
        <div className="space-y-2">
          {hero.rotate?.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <input className="field flex-1" value={item} onChange={(e) => { const n = [...hero.rotate]; n[i] = e.target.value; setRotate(n); }} />
              <button type="button" onClick={() => setRotate(hero.rotate.filter((_: any, j: number) => j !== i))} className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setRotate([...hero.rotate, "newword"])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add word
          </button>
        </div>
      </FieldGroup>

      {/* ── 4. Subtext ── */}
      <FieldGroup title="Subtext Paragraph" desc="Supporting description text below the headline.">
        <label className="grid gap-1.5">
          <Label>Text</Label>
          <textarea className="field min-h-[90px]" value={hero.subtext} onChange={(e) => set({ subtext: e.target.value })} />
        </label>
      </FieldGroup>

      {/* ── 5. CTA Buttons ── */}
      <FieldGroup title="CTA Buttons" desc="The two call-to-action buttons below the subtext.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Primary Button (Gold)</p>
            <label className="grid gap-1.5">
              <Label>Text</Label>
              <input className="field" value={hero.cta1_text} onChange={(e) => set({ cta1_text: e.target.value })} />
            </label>
            <label className="grid gap-1.5">
              <Label>Link (href)</Label>
              <input className="field" value={hero.cta1_href} onChange={(e) => set({ cta1_href: e.target.value })} placeholder="/shop" />
            </label>
          </div>
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Secondary Button (Ghost)</p>
            <label className="grid gap-1.5">
              <Label>Text</Label>
              <input className="field" value={hero.cta2_text} onChange={(e) => set({ cta2_text: e.target.value })} />
            </label>
            <label className="grid gap-1.5">
              <Label>Link (href)</Label>
              <input className="field" value={hero.cta2_href} onChange={(e) => set({ cta2_href: e.target.value })} placeholder="#flavours" />
            </label>
          </div>
        </div>
      </FieldGroup>

      {/* ── 6. Stats ── */}
      <FieldGroup title="Stats Bar" desc="Key numbers in the grid below the buttons.">
        <div className="space-y-2">
          {hero.stats?.map((stat: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30" />
              <input className="field flex-1" placeholder="Value (e.g. 10K+)" value={stat.k} onChange={(e) => { const n = [...hero.stats]; n[i] = { ...n[i], k: e.target.value }; setStats(n); }} />
              <input className="field flex-1" placeholder="Label" value={stat.v} onChange={(e) => { const n = [...hero.stats]; n[i] = { ...n[i], v: e.target.value }; setStats(n); }} />
              <button type="button" onClick={() => setStats(hero.stats.filter((_: any, j: number) => j !== i))} className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setStats([...hero.stats, { k: "", v: "" }])} className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">
            <Plus className="h-3.5 w-3.5" /> Add stat
          </button>
        </div>
      </FieldGroup>

      {/* ── 7. Floating Badges ── */}
      <FieldGroup title="Floating Badges" desc="The two small floating labels over the product image.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge 1 (Dark, left side)</p>
            <label className="grid gap-1.5">
              <Label>Label (small text)</Label>
              <input className="field" value={hero.badge1_label} onChange={(e) => set({ badge1_label: e.target.value })} placeholder="Third-party tested" />
            </label>
            <label className="grid gap-1.5">
              <Label>Value (bold text)</Label>
              <input className="field" value={hero.badge1_value} onChange={(e) => set({ badge1_value: e.target.value })} placeholder="Every single batch" />
            </label>
          </div>
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge 2 (Light, right side)</p>
            <label className="grid gap-1.5">
              <Label>Label (small text)</Label>
              <input className="field" value={hero.badge2_label} onChange={(e) => set({ badge2_label: e.target.value })} placeholder="Pectin based" />
            </label>
            <label className="grid gap-1.5">
              <Label>Value (bold text)</Label>
              <input className="field" value={hero.badge2_value} onChange={(e) => set({ badge2_value: e.target.value })} placeholder="100% vegetarian" />
            </label>
          </div>
        </div>
      </FieldGroup>

      <SaveBar onSave={() => saveMutation.mutate(form)} saving={saveMutation.isPending} />
    </div>
  );
}
