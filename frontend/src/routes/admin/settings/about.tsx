import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAboutContent, apiAdminUpdateAboutContent, useBrandValues, apiAdminCreateBrandValue, apiAdminUpdateBrandValue, apiAdminDeleteBrandValue, useMilestones, apiAdminCreateMilestone, apiAdminUpdateMilestone, apiAdminDeleteMilestone, apiUploadFile, getImageUrl } from "@/lib/api";
import { Plus, Trash2, Edit2, CheckCircle2, ChevronRight, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/about")({
  component: AboutSettingsPage,
});

// ─── Image Upload Component ──────────────────────────────────────────────────────
function ImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [loading, setLoading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await apiUploadFile(file);
      if (data.url) onChange(data.url);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };
  return (
    <label className="grid gap-1 h-full">
      <div className="flex flex-col h-full items-center justify-center gap-3 rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-2 transition-colors focus-within:border-[#3E332A]/50 focus-within:ring-1 focus-within:ring-[#3E332A]/20 relative overflow-hidden min-h-[160px] group">
        {value ? (
          <img src={getImageUrl(value)} alt="Preview" className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-40" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-border flex items-center justify-center bg-white text-muted-foreground/50">
            <Plus className="h-4 w-4" />
          </div>
        )}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ${value ? 'opacity-0 group-hover:opacity-100 bg-black/10' : 'opacity-100'}`}>
          <span className="bg-white/90 text-[10px] font-bold uppercase tracking-widest text-[#3E332A] px-3 py-1 rounded-full shadow-sm mb-2">{label}</span>
          <span className="bg-[#3E332A] text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-[#3E332A]/90">
            {value ? "Change Image" : "Upload Image"}
          </span>
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={loading} />
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3E332A]/30 border-t-[#3E332A]" />
          </div>
        )}
      </div>
    </label>
  );
}

function AboutSettingsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: aboutContent, isLoading: isContentLoading } = useAboutContent();

  const { data: brandValues = [] } = useBrandValues();
  const { data: milestones = [] } = useMilestones();

  const [form, setForm] = useState<any>(null);

  // Modals for CRUD
  const [editingValue, setEditingValue] = useState<any>(null);
  const [isAddingValue, setIsAddingValue] = useState(false);

  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  useEffect(() => {
    if (aboutContent && !form) {
      const heroData = aboutContent.hero || {};
      const whyData = aboutContent.why || {};
      const valuesHeaderData = aboutContent.values_header || {};
      const journeyHeaderData = aboutContent.journey_header || {};
      const ctaData = aboutContent.cta || {};
      setForm({
        ...aboutContent,
        hero: {
          eyebrow: heroData.eyebrow || "Our story",
          title_black: heroData.title_black || "Supplements you actually ",
          title_gold: heroData.title_gold || "look forward to.",
          sub: heroData.sub || ""
        },
        why: {
          eyebrow: whyData.eyebrow || "Why we exist",
          title: whyData.title || "Flavour first. Science always.",
          sub: whyData.sub || "",
          benefits: whyData.benefits || [],
          image: whyData.image || IMG.multi
        },
        values_header: {
          eyebrow: valuesHeaderData.eyebrow || "What we stand for",
          title: valuesHeaderData.title || "Our values"
        },
        journey_header: {
          eyebrow: journeyHeaderData.eyebrow || "The journey",
          title: journeyHeaderData.title || "How we got here"
        },
        cta: {
          title: ctaData.title || "Ready to make it a habit?",
          sub: ctaData.sub || "Start with a best seller — free shipping on orders above ₹499.",
          button_text: ctaData.button_text || "Shop the range",
          button_link: ctaData.button_link || "/shop"
        }
      });
    }
  }, [aboutContent]);

  // Mutations
  const saveContentMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateAboutContent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["about_content"] }); toast.success("Content saved"); },
    onError: (err: any) => toast.error(err.message || "Failed to save content"),
  });

  // Brand Values Mutations
  const createValueMutation = useMutation({
    mutationFn: (data: any) => apiAdminCreateBrandValue(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brandValues"] }); setIsAddingValue(false); setEditingValue(null); toast.success("Value created"); },
    onError: (err: any) => toast.error(err.message || "Failed to create value"),
  });
  const updateValueMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateBrandValue(data.originalTitle, { title: data.title, body: data.body }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brandValues"] }); setEditingValue(null); toast.success("Value updated"); },
    onError: (err: any) => toast.error(err.message || "Failed to update value"),
  });
  const deleteValueMutation = useMutation({
    mutationFn: (title: string) => apiAdminDeleteBrandValue(title),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brandValues"] }); toast.success("Value deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete value"),
  });

  // Milestones Mutations
  const createMilestoneMutation = useMutation({
    mutationFn: (data: any) => apiAdminCreateMilestone(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["milestones"] }); setIsAddingMilestone(false); setEditingMilestone(null); toast.success("Milestone created"); },
    onError: (err: any) => toast.error(err.message || "Failed to create milestone"),
  });
  const updateMilestoneMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateMilestone(data.originalYear, { year: data.year, text: data.text }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["milestones"] }); setEditingMilestone(null); toast.success("Milestone updated"); },
    onError: (err: any) => toast.error(err.message || "Failed to update milestone"),
  });
  const deleteMilestoneMutation = useMutation({
    mutationFn: (year: string) => apiAdminDeleteMilestone(year),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["milestones"] }); toast.success("Milestone deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete milestone"),
  });

  if (isContentLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setHero = (u: any) => setForm({ ...form, hero: { ...form.hero, ...u } });
  const setWhy = (u: any) => setForm({ ...form, why: { ...form.why, ...u } });
  const updateWhyBenefit = (idx: number, field: string, val: string) => {
    const newBenefits = [...form.why.benefits];
    newBenefits[idx] = { ...newBenefits[idx], [field]: val };
    setWhy({ benefits: newBenefits });
  };
  const setValuesHeader = (u: any) => setForm({ ...form, values_header: { ...form.values_header, ...u } });
  const setJourneyHeader = (u: any) => setForm({ ...form, journey_header: { ...form.journey_header, ...u } });
  const setCta = (u: any) => setForm({ ...form, cta: { ...form.cta, ...u } });

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">About Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the entire About page layout and content.</p>
        </div>
        <button
          onClick={() => saveContentMutation.mutate(form)}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
          disabled={saveContentMutation.isPending}
        >
          {saveContentMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          {saveContentMutation.isPending ? "SAVING..." : "SAVE ALL HEADERS"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* HERO */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">PAGE HERO</h2>
          <div className="space-y-3">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">TITLE (BLACK)</span><input className="w-full rounded-md border px-3 py-1.5 text-[12px]" value={form.hero.title_black} onChange={(e) => setHero({ title_black: e.target.value })} /></label>
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">TITLE (GOLD)</span><input className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px]" value={form.hero.title_gold} onChange={(e) => setHero({ title_gold: e.target.value })} /></label>
            </div>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTITLE</span><textarea className="w-full rounded-md border px-3 py-1.5 text-xs min-h-[60px]" value={form.hero.sub} onChange={(e) => setHero({ sub: e.target.value })} /></label>
          </div>
        </div>

        {/* WHY WE EXIST */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">WHY WE EXIST</h2>
          <div className="space-y-3">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.why.eyebrow} onChange={(e) => setWhy({ eyebrow: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.why.title} onChange={(e) => setWhy({ title: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTITLE</span><textarea className="w-full rounded-md border px-3 py-1.5 text-xs min-h-[60px]" value={form.why.sub} onChange={(e) => setWhy({ sub: e.target.value })} /></label>
            
            <div className="mt-4 border-t border-border pt-4 h-48">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 block">IMAGE</span>
              <ImageUpload label="Hero Image" value={form.why.image} onChange={(v) => setWhy({ image: v })} />
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 block">BENEFITS (3 FIXED)</span>
              {form.why.benefits.map((b: any, i: number) => (
                <div key={i} className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input className="w-1/3 rounded-md border px-2 py-1 text-xs" value={b.icon} onChange={(e) => updateWhyBenefit(i, "icon", e.target.value)} placeholder="Icon (Leaf, ShieldCheck...)" />
                    <input className="flex-1 rounded-md border px-2 py-1 text-xs font-bold" value={b.t} onChange={(e) => updateWhyBenefit(i, "t", e.target.value)} placeholder="Title" />
                  </div>
                  <input className="w-full rounded-md border px-2 py-1 text-xs" value={b.d} onChange={(e) => updateWhyBenefit(i, "d", e.target.value)} placeholder="Description" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CRUD LISTS */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* BRAND VALUES */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <div>
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">OUR VALUES</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Manage headers and individual values</p>
            </div>
            <button onClick={() => { setIsAddingValue(true); setEditingValue({ title: "", body: "" }); }} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-primary/20"><Plus className="w-3 h-3" /> ADD VALUE</button>
          </div>
          <div className="grid gap-4 grid-cols-2 mb-6">
            <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.values_header.eyebrow} onChange={(e) => setValuesHeader({ eyebrow: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.values_header.title} onChange={(e) => setValuesHeader({ title: e.target.value })} /></label>
          </div>
          
          {editingValue && (
            <div className="mb-6 bg-primary/5 border border-primary/20 p-4 rounded-xl relative">
              <button onClick={() => setEditingValue(null)} className="absolute right-3 top-3 text-muted-foreground hover:text-ink"><X className="w-4 h-4" /></button>
              <h3 className="text-xs font-bold mb-3">{isAddingValue ? "ADD VALUE" : "EDIT VALUE"}</h3>
              <input className="w-full rounded-md border px-3 py-1.5 text-xs mb-2" placeholder="Title" value={editingValue.title} onChange={(e) => setEditingValue({...editingValue, title: e.target.value})} />
              <textarea className="w-full rounded-md border px-3 py-1.5 text-xs mb-3" placeholder="Body text" value={editingValue.body} onChange={(e) => setEditingValue({...editingValue, body: e.target.value})} />
              <button 
                onClick={() => isAddingValue ? createValueMutation.mutate(editingValue) : updateValueMutation.mutate(editingValue)}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold w-full"
              >SAVE VALUE</button>
            </div>
          )}

          <div className="space-y-3">
            {brandValues.map((v: any) => (
              <div key={v.title} className="flex items-start justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                <div>
                  <p className="text-xs font-bold">{v.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{v.body}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingValue({ originalTitle: v.title, ...v }); setIsAddingValue(false); }} className="p-1.5 text-muted-foreground hover:bg-muted rounded"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={async () => {
                    const ok = await confirm({
                      title: "Delete Brand Value",
                      message: `Are you sure you want to delete the brand value "${v.title}"?`,
                      confirmText: "Delete",
                      cancelText: "Cancel"
                    });
                    if (ok) deleteValueMutation.mutate(v.title);
                  }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MILESTONES */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <div>
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">THE JOURNEY</h2>
              <p className="text-[10px] text-muted-foreground mt-1">Manage headers and timeline milestones</p>
            </div>
            <button onClick={() => { setIsAddingMilestone(true); setEditingMilestone({ year: "", text: "" }); }} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-primary/20"><Plus className="w-3 h-3" /> ADD MILESTONE</button>
          </div>
          <div className="grid gap-4 grid-cols-2 mb-6">
            <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.journey_header.eyebrow} onChange={(e) => setJourneyHeader({ eyebrow: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.journey_header.title} onChange={(e) => setJourneyHeader({ title: e.target.value })} /></label>
          </div>

          {editingMilestone && (
            <div className="mb-6 bg-primary/5 border border-primary/20 p-4 rounded-xl relative">
              <button onClick={() => setEditingMilestone(null)} className="absolute right-3 top-3 text-muted-foreground hover:text-ink"><X className="w-4 h-4" /></button>
              <h3 className="text-xs font-bold mb-3">{isAddingMilestone ? "ADD MILESTONE" : "EDIT MILESTONE"}</h3>
              <input className="w-full rounded-md border px-3 py-1.5 text-xs mb-2" placeholder="Year (e.g., 2021)" value={editingMilestone.year} onChange={(e) => setEditingMilestone({...editingMilestone, year: e.target.value})} />
              <textarea className="w-full rounded-md border px-3 py-1.5 text-xs mb-3" placeholder="Text" value={editingMilestone.text} onChange={(e) => setEditingMilestone({...editingMilestone, text: e.target.value})} />
              <button 
                onClick={() => isAddingMilestone ? createMilestoneMutation.mutate(editingMilestone) : updateMilestoneMutation.mutate(editingMilestone)}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold w-full"
              >SAVE MILESTONE</button>
            </div>
          )}

          <div className="space-y-3">
            {milestones.map((m: any) => (
              <div key={m.year} className="flex items-start justify-between p-3 border rounded-lg hover:border-primary transition-colors">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-secondary">{m.year}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{m.text}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingMilestone({ originalYear: m.year, ...m }); setIsAddingMilestone(false); }} className="p-1.5 text-muted-foreground hover:bg-muted rounded"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={async () => {
                    const ok = await confirm({
                      title: "Delete Milestone",
                      message: `Are you sure you want to delete the milestone for year ${m.year}?`,
                      confirmText: "Delete",
                      cancelText: "Cancel"
                    });
                    if (ok) deleteMilestoneMutation.mutate(m.year);
                  }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">BOTTOM CTA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta.title} onChange={(e) => setCta({ title: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta.sub} onChange={(e) => setCta({ sub: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON TEXT</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta.button_text} onChange={(e) => setCta({ button_text: e.target.value })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON LINK</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta.button_link} onChange={(e) => setCta({ button_link: e.target.value })} /></label>
          </div>
        </div>
      </div>
    </div>
  );
}
