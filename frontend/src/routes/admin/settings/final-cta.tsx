import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent } from "@/lib/api";
import { CheckCircle2, Plus } from "lucide-react";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/final-cta")({
  component: FinalCtaSettingsPage,
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
          <img src={value} alt="Preview" className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-40" />
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
        <input 
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3E332A]/30 border-t-[#3E332A]" />
          </div>
        )}
      </div>
    </label>
  );
}

function FinalCtaSettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const rawSection = homeContent?.final_cta || {};
      const sectionData = {
        title_white: rawSection.title_white || "Ready to make your day a little ",
        title_gold: rawSection.title_gold || "sweeter?",
        button_1_text: rawSection.button_1_text || "Shop all gummies",
        button_1_link: rawSection.button_1_link || "/shop",
        button_2_text: rawSection.button_2_text || "Best sellers",
        button_2_link: rawSection.button_2_link || "/shop?sort=bestsellers",
        image_left: rawSection.image_left || IMG.multi,
        image_right: rawSection.image_right || IMG.kids
      };
      setForm({ ...homeContent, final_cta: sectionData });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setSection = (updates: any) => setForm({ ...form, final_cta: { ...form.final_cta, ...updates } });
  const section = form.final_cta;

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Final CTA</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the bottom "Ready to make your day a little sweeter?" block.</p>
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
        {/* Left Column: Headers and CTA */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION HEADLINE</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE PART 1 (WHITE)</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={section.title_white} 
                  onChange={(e) => setSection({ title_white: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">TITLE PART 2 (GOLD)</span>
                <input 
                  className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-amber-400" 
                  value={section.title_gold} 
                  onChange={(e) => setSection({ title_gold: e.target.value })} 
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm space-y-6">
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CALL TO ACTION BUTTONS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink">Primary Button (Gold)</h3>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON TEXT</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={section.button_1_text} 
                    onChange={(e) => setSection({ button_1_text: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESTINATION LINK</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={section.button_1_link} 
                    onChange={(e) => setSection({ button_1_link: e.target.value })} 
                  />
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink">Secondary Button (Outline)</h3>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON TEXT</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={section.button_2_text} 
                    onChange={(e) => setSection({ button_2_text: e.target.value })} 
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESTINATION LINK</span>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                    value={section.button_2_link} 
                    onChange={(e) => setSection({ button_2_link: e.target.value })} 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Images */}
        <div className="xl:col-span-5">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm h-full">
            <div className="mb-6">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FLOATING IMAGES</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Manage the gummy jars floating on the sides of the block.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 h-full">
                <span className="text-xs font-bold text-ink text-center">Left Image</span>
                <div className="flex-1 min-h-[200px]">
                  <ImageUpload label="Left Gummy Jar" value={section.image_left} onChange={(val) => setSection({ image_left: val })} />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 h-full">
                <span className="text-xs font-bold text-ink text-center">Right Image</span>
                <div className="flex-1 min-h-[200px]">
                  <ImageUpload label="Right Gummy Jar" value={section.image_right} onChange={(val) => setSection({ image_right: val })} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
