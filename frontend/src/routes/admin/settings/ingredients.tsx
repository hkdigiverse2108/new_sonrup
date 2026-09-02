import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent, getImageUrl } from "@/lib/api";
import { Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/ingredients")({
  component: IngredientsSettingsPage,
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

function IngredientsSettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const rawStory = homeContent?.ingredient_story || {};
      const ingData = {
        eyebrow: rawStory.eyebrow || "INGREDIENT STORY",
        title: rawStory.title || "WHAT'S INSIDE THE TUBE",
        sub: rawStory.sub || "Every gummy is a short ingredient list you could read out loud without flinching.",
        image: rawStory.image || IMG.shilajit,
        ingredients: rawStory.ingredients ? rawStory.ingredients.map((it: any) => ({
          name: it.name || "",
          note: it.note || ""
        })) : [
          { name: "Himalayan Shilajit", note: "500 mg purified resin" },
          { name: "Ashwagandha", note: "Traditional adaptogen" },
          { name: "Vitamin B12", note: "Energy metabolism" },
          { name: "Tamarind", note: "Real imli flavour" },
        ]
      };
      setForm({ ...homeContent, ingredient_story: ingData });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setStory = (updates: any) => setForm({ ...form, ingredient_story: { ...form.ingredient_story, ...updates } });
  const story = form.ingredient_story;

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Ingredients Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the "What's Inside The Tube" section and the floating ingredients.</p>
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
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">MAIN TITLE</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.title} 
                  onChange={(e) => setStory({ title: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTEXT / DESCRIPTION</span>
                <textarea 
                  className="w-full min-h-[70px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={story.sub} 
                  onChange={(e) => setStory({ sub: e.target.value })} 
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CENTRAL IMAGE</h2>
            <p className="mb-4 text-[11px] text-muted-foreground">This image will appear in the center of the ring layout.</p>
            <ImageUpload
              label="PRODUCT JAR IMAGE"
              value={story.image}
              onChange={(val) => setStory({ image: val })}
            />
          </div>
        </div>

        {/* Right Column - Ingredients Ring List */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">INGREDIENTS LIST</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">Manage the 4 items that float around the central image.</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  if (story.ingredients.length < 4) {
                    setStory({ ingredients: [...story.ingredients, { name: "New Ingredient", note: "Ingredient description." }] });
                  }
                }} 
                className={`text-[10px] font-bold uppercase tracking-widest ${story.ingredients.length >= 4 ? "text-muted-foreground cursor-not-allowed opacity-50" : "text-[#3E332A] hover:underline"}`}
                disabled={story.ingredients.length >= 4}
              >
                + ADD INGREDIENT
              </button>
            </div>
            
            <div className="space-y-3">
              {story.ingredients.map((ingredient: any, i: number) => {
                const positions = ["Top Left", "Bottom Left", "Top Right", "Bottom Right"];
                return (
                  <div key={i} className="rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab" />
                        <span className="text-xs font-bold text-[#3E332A]">Ingredient {i + 1}</span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">{positions[i] || "Hidden"}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { const f = [...story.ingredients]; f.splice(i, 1); setStory({ ingredients: f }); }} 
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">NAME</span>
                        <input 
                          className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                          value={ingredient.name} 
                          onChange={(e) => { const f = [...story.ingredients]; f[i].name = e.target.value; setStory({ ingredients: f }); }} 
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTEXT / NOTE</span>
                        <input 
                          className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                          value={ingredient.note} 
                          onChange={(e) => { const f = [...story.ingredients]; f[i].note = e.target.value; setStory({ ingredients: f }); }} 
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              
              {story.ingredients.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8] p-8 text-center text-sm text-muted-foreground">
                  No ingredients added yet. Add up to 4 ingredients for the ring layout.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
