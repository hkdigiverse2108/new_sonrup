import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent, getImageUrl } from "@/lib/api";
import { Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { IMG } from "@/lib/products";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/story")({
  component: StorySettingsPage,
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
          <img src={getImageUrl(value)} alt="Preview" className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border" />
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

function StorySettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const rawStory = homeContent?.brand_story || {};
      const storyData = {
        eyebrow: rawStory.eyebrow || "Our story",
        title_black1: rawStory.title_black1 || "We started with a",
        title_gold: rawStory.title_gold || " half-empty ",
        title_black2: rawStory.title_black2 || "bottle of vitamins.",
        paragraph1: rawStory.paragraph1 || "Every household has one — bought with the best intentions, abandoned by week three. Sonrup began by asking a simpler question: what if taking your vitamins was the nicest thirty seconds of your morning?",
        paragraph2: rawStory.paragraph2 || "So we formulate backwards. Taste first, then texture, then the actives — never sacrificing the dose to get there. Small batches, honest labels, and packaging you don't have to hide in a cupboard.",
        cta_text: rawStory.cta_text || "Read our story",
        cta_link: rawStory.cta_link || "/about",
        main_image: rawStory.main_image || IMG.kids,
        floating_image: rawStory.floating_image || IMG.multi,
        stats: rawStory.stats?.length ? rawStory.stats.map((s: any) => ({
          value: s.value || s[0] || "",
          label: s.label || s[1] || ""
        })) : [
          { value: "4.8★", label: "Average rating" },
          { value: "120k+", label: "Tubes shipped" },
          { value: "100%", label: "Vegetarian" },
        ]
      };
      setForm({ ...homeContent, brand_story: storyData });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["home_content"] }); toast.success("Our Story section saved"); },
    onError: (err: any) => toast.error(err.message || "Failed to save story section"),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setStory = (updates: any) => setForm({ ...form, brand_story: { ...form.brand_story, ...updates } });
  const story = form.brand_story;

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Our Story Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the "Our Story" section text, stats, and images.</p>
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
                  value={story.eyebrow} 
                  onChange={(e) => setStory({ eyebrow: e.target.value })} 
                />
              </label>
              
              <div className="grid gap-1 p-3 rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">SPLIT TITLE</span>
                <label className="grid gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">PART 1 (BLACK)</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-[12px] outline-none transition focus:border-[#3E332A]/50" 
                    value={story.title_black1} 
                    onChange={(e) => setStory({ title_black1: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1 mt-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">HIGHLIGHT (GOLD)</span>
                  <input 
                    className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] outline-none transition focus:border-amber-400" 
                    value={story.title_gold} 
                    onChange={(e) => setStory({ title_gold: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1 mt-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">PART 2 (BLACK)</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-[12px] outline-none transition focus:border-[#3E332A]/50" 
                    value={story.title_black2} 
                    onChange={(e) => setStory({ title_black2: e.target.value })} 
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">PARAGRAPH 1</span>
                <textarea 
                  className="w-full min-h-[90px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.paragraph1} 
                  onChange={(e) => setStory({ paragraph1: e.target.value })} 
                />
              </label>
              
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">PARAGRAPH 2</span>
                <textarea 
                  className="w-full min-h-[90px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.paragraph2} 
                  onChange={(e) => setStory({ paragraph2: e.target.value })} 
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm space-y-6">
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CALL TO ACTION BUTTON</h2>
            <div className="space-y-3">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON TEXT</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.cta_text} 
                  onChange={(e) => setStory({ cta_text: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON LINK</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.cta_link} 
                  onChange={(e) => setStory({ cta_link: e.target.value })} 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">MEDIA</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUpload
                label="MAIN BACKGROUND IMAGE"
                value={story.main_image}
                onChange={(val) => setStory({ main_image: val })}
              />
              <ImageUpload
                label="FLOATING FOREGROUND IMAGE"
                value={story.floating_image}
                onChange={(val) => setStory({ floating_image: val })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">STATISTICS</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Manage up to 3 statistics shown below the paragraphs.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (story.stats.length < 3) {
                    setStory({ stats: [...story.stats, { value: "New", label: "Stat label" }] });
                  }
                }} 
                className={`text-[10px] font-bold uppercase tracking-widest ${story.stats.length >= 3 ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-[#3E332A] hover:underline"}`}
                disabled={story.stats.length >= 3}
              >
                + ADD STAT
              </button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              {story.stats.map((stat: any, i: number) => (
                <div key={i} className="rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-4 space-y-3 relative group">
                  <button 
                    type="button" 
                    onClick={() => { const s = [...story.stats]; s.splice(i, 1); setStory({ stats: s }); }} 
                    className="absolute right-2 top-2 text-muted-foreground hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <label className="grid gap-1 pt-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">VALUE (e.g. 4.8★)</span>
                    <input 
                      className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs font-bold outline-none transition focus:border-[#3E332A]/50" 
                      value={stat.value} 
                      onChange={(e) => { const s = [...story.stats]; s[i].value = e.target.value; setStory({ stats: s }); }} 
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">LABEL</span>
                    <input 
                      className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-[11px] outline-none transition focus:border-[#3E332A]/50" 
                      value={stat.label} 
                      onChange={(e) => { const s = [...story.stats]; s[i].label = e.target.value; setStory({ stats: s }); }} 
                    />
                  </label>
                </div>
              ))}
              
              {story.stats.length === 0 && (
                <div className="col-span-3 rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8] p-8 text-center text-sm text-muted-foreground">
                  No stats added yet. Add up to 3.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
