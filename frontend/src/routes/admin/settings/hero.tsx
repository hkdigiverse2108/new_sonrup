import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent } from "@/lib/api";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/hero")({
  component: HeroSettingsPage,
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

function HeroSettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const h = homeContent?.hero ?? {};
      const rawTrust = homeContent?.trust_strip;
      const initialTrust = rawTrust?.length
        ? (typeof rawTrust[0] === 'string' 
            ? rawTrust.map((t: string) => ({ icon: "BadgeCheck", label: t })) 
            : rawTrust)
        : [
          { icon: "Leaf", label: "Premium Ingredients" },
          { icon: "Sparkles", label: "Delicious Flavours" },
          { icon: "BadgeCheck", label: "Quality Assured" },
          { icon: "Truck", label: "Fast Delivery" },
          { icon: "Heart", label: "Loved by Customers" },
        ];

      setForm({
        ...homeContent,
        trust_strip: initialTrust,
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
          main_image: h.main_image || IMG.multi,
          left_image: h.left_image || IMG.shilajit,
          right_image: h.right_image || IMG.kids,
        },
      });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const hero = form.hero;
  const set = (fields: any) => setForm({ ...form, hero: { ...hero, ...fields } });
  const setRotate = (r: string[]) => set({ rotate: r });
  const setStats = (s: any[]) => set({ stats: s });

  return (
    <div className="max-w-6xl space-y-3 pb-20">
      <div>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[#3E332A]">SITE SETTINGS</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Customize storefront content.</p>
      </div>

      <div className="my-4 border-b border-border/60"></div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Left Column */}
        <div className="xl:col-span-7 space-y-3">
          {/* Card 1: Headline & Content */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">HEADLINE & CONTENT</h2>
            
            <div className="space-y-3">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TOP BADGE PILL TEXT</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                  value={hero.eyebrow} 
                  onChange={(e) => set({ eyebrow: e.target.value })} 
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HEADLINE PART 1 (NORMAL)</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                    value={hero.headline_line1} 
                    onChange={(e) => set({ headline_line1: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HEADLINE PART 2 (ITALICIZED HIGHLIGHT)</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                    value={hero.headline_line2} 
                    onChange={(e) => set({ headline_line2: e.target.value })} 
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HEADLINE PREFIX BEFORE ROTATING WORDS</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                  value={hero.headline_for_your} 
                  onChange={(e) => set({ headline_for_your: e.target.value })} 
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HERO DESCRIPTION</span>
                <textarea 
                  className="w-full min-h-[70px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                  value={hero.subtext} 
                  onChange={(e) => set({ subtext: e.target.value })} 
                />
              </label>
            </div>
          </div>

          {/* Card 3: CTA Buttons */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CALL TO ACTION BUTTONS & LINKS</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#3E332A]">PRIMARY BUTTON</p>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">LABEL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.cta1_text} 
                    onChange={(e) => set({ cta1_text: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESTINATION URL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.cta1_href} 
                    onChange={(e) => set({ cta1_href: e.target.value })} 
                  />
                </label>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#3E332A]">SECONDARY BUTTON</p>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">LABEL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.cta2_text} 
                    onChange={(e) => set({ cta2_text: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESTINATION URL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.cta2_href} 
                    onChange={(e) => set({ cta2_href: e.target.value })} 
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 6: Trust Strip */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">TRUST STRIP BADGES (TICKER)</h2>
              <button type="button" onClick={() => setForm({ ...form, trust_strip: [...form.trust_strip, { icon: "Check", label: "New Badge" }] })} className="text-[10px] font-bold uppercase tracking-widest text-[#3E332A] hover:underline">
                + ADD BADGE
              </button>
            </div>
            
            <div className="space-y-3">
              {form.trust_strip?.map((badge: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab" />
                  <select 
                    className="rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50"
                    value={badge.icon}
                    onChange={(e) => { const n = [...form.trust_strip]; n[i].icon = e.target.value; setForm({ ...form, trust_strip: n }); }}
                  >
                    {["Leaf", "Sparkles", "BadgeCheck", "Truck", "Heart", "Clock", "FlaskConical", "PackageCheck", "Star", "Shield", "Check", "ThumbsUp"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <input 
                    className="flex-1 rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    placeholder="Label (e.g. Premium Ingredients)" 
                    value={badge.label} 
                    onChange={(e) => { const n = [...form.trust_strip]; n[i].label = e.target.value; setForm({ ...form, trust_strip: n }); }} 
                  />
                  <button type="button" onClick={() => setForm({ ...form, trust_strip: form.trust_strip.filter((_: any, j: number) => j !== i) })} className="text-muted-foreground hover:text-red-500 transition-colors p-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-5 space-y-3">
          {/* Images Card */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">HERO IMAGES</h2>
            <div className="space-y-3">
              <ImageUpload
                label="MAIN PRODUCT TUBE (CENTER)"
                value={hero.main_image}
                onChange={(val) => set({ main_image: val })}
              />
              <ImageUpload
                label="LEFT FLOATING IMAGE"
                value={hero.left_image}
                onChange={(val) => set({ left_image: val })}
              />
              <ImageUpload
                label="RIGHT FLOATING IMAGE"
                value={hero.right_image}
                onChange={(val) => set({ right_image: val })}
              />
            </div>
          </div>

          {/* Card 2: Rotating Words */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">ROTATING WORDS (GOLD)</h2>
              <button type="button" onClick={() => setRotate([...hero.rotate, "new word"])} className="text-[10px] font-bold uppercase tracking-widest text-[#3E332A] hover:underline">
                + ADD WORD
              </button>
            </div>
            
            <div className="space-y-2">
              {hero.rotate?.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab" />
                  <input 
                    className="flex-1 rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50 focus:ring-1 focus:ring-[#3E332A]/20" 
                    value={item} 
                    onChange={(e) => { const n = [...hero.rotate]; n[i] = e.target.value; setRotate(n); }} 
                  />
                  <button type="button" onClick={() => setRotate(hero.rotate.filter((_: any, j: number) => j !== i))} className="text-muted-foreground hover:text-red-500 transition-colors p-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Stats Bar */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">STATS BAR (BOTTOM)</h2>
              <button type="button" onClick={() => setStats([...hero.stats, { k: "", v: "" }])} className="text-[10px] font-bold uppercase tracking-widest text-[#3E332A] hover:underline">
                + ADD STAT
              </button>
            </div>
            
            <div className="space-y-2">
              {hero.stats?.map((stat: any, i: number) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 sm:flex-row sm:items-center">
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs font-bold text-primary outline-none transition focus:border-[#3E332A]/50 sm:w-1/3" 
                    placeholder="e.g. 5000 mcg" 
                    value={stat.k} 
                    onChange={(e) => { const n = [...hero.stats]; n[i] = { ...n[i], k: e.target.value }; setStats(n); }} 
                  />
                  <input 
                    className="flex-1 rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    placeholder="e.g. Biotin per serving" 
                    value={stat.v} 
                    onChange={(e) => { const n = [...hero.stats]; n[i] = { ...n[i], v: e.target.value }; setStats(n); }} 
                  />
                  <button type="button" onClick={() => setStats(hero.stats.filter((_: any, j: number) => j !== i))} className="self-end text-muted-foreground hover:text-red-500 transition-colors sm:self-auto p-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Floating Badges */}
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">IMAGE FLOATING BADGES</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#3E332A]">LEFT BADGE (DARK)</p>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SMALL LABEL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.badge1_label} 
                    onChange={(e) => set({ badge1_label: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BOLD VALUE</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.badge1_value} 
                    onChange={(e) => set({ badge1_value: e.target.value })} 
                  />
                </label>
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#3E332A]">RIGHT BADGE (LIGHT)</p>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SMALL LABEL</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.badge2_label} 
                    onChange={(e) => set({ badge2_label: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BOLD VALUE</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={hero.badge2_value} 
                    onChange={(e) => set({ badge2_value: e.target.value })} 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-64 right-0 flex items-center justify-end border-t border-border/50 bg-background/80 px-12 py-4 backdrop-blur-md z-10">
        <button
          type="button"
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-[#3E332A] px-10 py-3 text-[13px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saveMutation.isPending ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>
    </div>
  );
}
