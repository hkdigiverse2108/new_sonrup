import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/why")({
  component: WhySettingsPage,
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
    <label className="grid gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-2 pr-4 transition-colors focus-within:border-[#3E332A]/50 focus-within:ring-1 focus-within:ring-[#3E332A]/20">
        {value ? (
          <img src={value} alt="Preview" className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-border flex items-center justify-center bg-white text-muted-foreground/50">
            <Plus className="h-4 w-4" />
          </div>
        )}
        <input 
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="w-full text-[13px] text-foreground file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#3E332A] file:px-4 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#3E332A]/90 focus:outline-none disabled:opacity-50" 
          disabled={loading}
        />
      </div>
    </label>
  );
}

function WhySettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const rawWhy = homeContent?.why || {};
      const whyData = {
        eyebrow: rawWhy.eyebrow || "WHY OUR GUMMIES",
        title: rawWhy.title || "BUILT TO BE TAKEN, NOT JUST BOUGHT.",
        sub: rawWhy.sub || "Most supplements fail on the shelf, not in the lab. We designed ours to be the part of your day you actually look forward to.",
        image: rawWhy.image || IMG.multi,
        stat_value: rawWhy.stat_value || "98%",
        stat_text: rawWhy.stat_text || "of customers say they'd never go back to tablets.",
        features: rawWhy.features ? rawWhy.features.map((f: any, i: number) => {
          const defaultIcons = ["Leaf", "Sparkles", "Clock", "FlaskConical", "BadgeCheck", "PackageCheck"];
          return {
            icon: f.icon || defaultIcons[i] || "BadgeCheck",
            title: f.title || "",
            text: f.text || f.desc || ""
          };
        }) : [
          { icon: "Leaf", title: "Premium Ingredients", text: "Actives at doses that matter, sourced from suppliers we can name." },
          { icon: "Sparkles", title: "Delicious Taste", text: "Real fruit concentrates. No chalky aftertaste, ever." },
          { icon: "Clock", title: "Easy Daily Routine", text: "One or two gummies. No water, no measuring, no excuses." },
          { icon: "FlaskConical", title: "Carefully Crafted", text: "Small-batch formulation with in-house pharmacists." },
          { icon: "BadgeCheck", title: "Quality Assured", text: "Every batch third-party tested for purity and potency." },
          { icon: "PackageCheck", title: "Convenient Format", text: "A tube that travels, seals tight and looks good on the counter." },
        ]
      };
      setForm({ ...homeContent, why: whyData });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setWhy = (updates: any) => setForm({ ...form, why: { ...form.why, ...updates } });
  const why = form.why;

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Why Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the "Why Our Gummies" section headers, stats, and features.</p>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 focus:outline-none focus:ring-4 focus:ring-[#3E332A]/20 disabled:opacity-50"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {saveMutation.isPending ? "SAVING..." : "SAVE ALL CHANGES"}
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        {/* Left Column */}
        <div className="xl:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION HEADLINE</h2>
            <div className="space-y-3">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW TEXT</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={why.eyebrow} 
                  onChange={(e) => setWhy({ eyebrow: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">MAIN TITLE</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={why.title} 
                  onChange={(e) => setWhy({ title: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTEXT / DESCRIPTION</span>
                <textarea 
                  className="w-full min-h-[70px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={why.sub} 
                  onChange={(e) => setWhy({ sub: e.target.value })} 
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm space-y-6">
            <div>
              <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION IMAGE</h2>
              <ImageUpload
                label="MAIN DISPLAY IMAGE"
                value={why.image}
                onChange={(val) => setWhy({ image: val })}
              />
            </div>
            
            <div className="pt-4 border-t border-[#e5e1dc]">
              <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FLOATING STAT CARD</h2>
              <div className="space-y-3">
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">STATISTIC VALUE (e.g. 98%)</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={why.stat_value} 
                    onChange={(e) => setWhy({ stat_value: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">STATISTIC SUBTEXT</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={why.stat_text} 
                    onChange={(e) => setWhy({ stat_text: e.target.value })} 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Features List */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FEATURES LIST</h2>
              <button 
                type="button" 
                onClick={() => setWhy({ features: [...why.features, { icon: "BadgeCheck", title: "New Feature", text: "Feature description." }] })} 
                className="text-[10px] font-bold uppercase tracking-widest text-[#3E332A] hover:underline"
              >
                + ADD FEATURE
              </button>
            </div>
            
            <div className="space-y-3">
              {why.features.map((feature: any, i: number) => (
                <div key={i} className="rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab" />
                      <span className="text-xs font-bold text-[#3E332A]">Feature {i + 1}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { const f = [...why.features]; f.splice(i, 1); setWhy({ features: f }); }} 
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    <label className="grid gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">ICON</span>
                      <select 
                        className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50"
                        value={feature.icon}
                        onChange={(e) => { const f = [...why.features]; f[i].icon = e.target.value; setWhy({ features: f }); }}
                      >
                        <option value="Leaf">Leaf</option>
                        <option value="Sparkles">Sparkles</option>
                        <option value="Clock">Clock</option>
                        <option value="FlaskConical">FlaskConical</option>
                        <option value="BadgeCheck">BadgeCheck</option>
                        <option value="PackageCheck">PackageCheck</option>
                        <option value="Heart">Heart</option>
                        <option value="Truck">Truck</option>
                        <option value="Star">Star</option>
                        <option value="Shield">Shield</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span>
                      <input 
                        className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                        value={feature.title} 
                        onChange={(e) => { const f = [...why.features]; f[i].title = e.target.value; setWhy({ features: f }); }} 
                      />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESCRIPTION</span>
                      <input 
                        className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                        value={feature.text} 
                        onChange={(e) => { const f = [...why.features]; f[i].text = e.target.value; setWhy({ features: f }); }} 
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
