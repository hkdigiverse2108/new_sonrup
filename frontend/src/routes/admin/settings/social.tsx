import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiUploadFile, apiAdminUpdateHomeContent, getImageUrl } from "@/lib/api";
import { Plus, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IMG } from "@/lib/products";

export const Route = createFileRoute("/admin/settings/social")({
  component: SocialSettingsPage,
});

function ImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative h-full w-full group">
      <div 
        onClick={handleBoxClick}
        className="flex flex-col h-full items-center justify-center gap-3 rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-2 transition-colors hover:border-[#3E332A]/50 cursor-pointer relative overflow-hidden min-h-[140px]"
      >
        {value ? (
          <img src={getImageUrl(value)} alt="Preview" className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-40" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-border flex items-center justify-center bg-white text-muted-foreground/50">
            <Plus className="h-4 w-4" />
          </div>
        )}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ${value ? 'opacity-0 group-hover:opacity-100 bg-black/10' : 'opacity-100'}`}>
          <span className="bg-white/90 text-[10px] font-bold uppercase tracking-widest text-[#3E332A] px-3 py-1 rounded-full shadow-sm mb-2">{label}</span>
          <span className="bg-[#3E332A] text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full shadow-sm hover:bg-[#3E332A]/90">
            {value ? "Change Image" : "Upload Image"}
          </span>
        </div>
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3E332A]/30 border-t-[#3E332A]" />
          </div>
        )}
      </div>
    </div>
  );
}

function SocialSettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading  } = useHomeContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (homeContent && !form) {
      const rawSection = homeContent?.social_section || {};
      const sectionData = {
        eyebrow: rawSection.eyebrow || "@sonrup",
        title: rawSection.title || "Join the gummy club",
        cta_text: rawSection.cta_text || "Follow us",
        cta_link: rawSection.cta_link || "#",
        images: Array.isArray(rawSection.images) ? rawSection.images : [
          IMG.multi, IMG.kids, IMG.shilajit, IMG.kids, IMG.multi, IMG.shilajit
        ],
        image_links: Array.isArray(rawSection.image_links) ? rawSection.image_links : [
          "#", "#", "#", "#", "#", "#"
        ]
      };
      setForm({ ...homeContent, social_section: sectionData });
    }
  }, [homeContent]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["home_content"] }); toast.success("Social section saved"); },
    onError: (err: any) => toast.error(err.message || "Failed to save social section"),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setSection = (updates: any) => setForm({ ...form, social_section: { ...form.social_section, ...updates } });
  const section = form.social_section;

  const updateImage = (index: number, val: string) => {
    const newImages = [...section.images];
    newImages[index] = val;
    setSection({ images: newImages });
  };

  const updateImageLink = (index: number, val: string) => {
    const newLinks = [...(section.image_links || [])];
    while (newLinks.length <= index) {
      newLinks.push("#");
    }
    newLinks[index] = val;
    setSection({ image_links: newLinks });
  };

  const addTile = () => {
    const newImages = [...section.images, ""];
    const newLinks = [...(section.image_links || []), "#"];
    setSection({ images: newImages, image_links: newLinks });
  };

  const removeTile = (index: number) => {
    const newImages = section.images.filter((_: any, i: number) => i !== index);
    const newLinks = (section.image_links || []).filter((_: any, i: number) => i !== index);
    setSection({ images: newImages, image_links: newLinks });
  };

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Social Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the "Join the Gummy Club" text and grid images dynamically.</p>
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
        <div className="xl:col-span-4 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION HEADLINE</h2>
            <div className="space-y-3">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW TEXT</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={section.eyebrow} 
                  onChange={(e) => setSection({ eyebrow: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">MAIN TITLE</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={section.title} 
                  onChange={(e) => setSection({ title: e.target.value })} 
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
                  value={section.cta_text} 
                  onChange={(e) => setSection({ cta_text: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESTINATION LINK</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={section.cta_link} 
                  onChange={(e) => setSection({ cta_link: e.target.value })} 
                  placeholder="e.g. https://instagram.com/sonrup"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Masonry Grid Images */}
        <div className="xl:col-span-8">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm h-full space-y-6">
            <div>
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">GRID IMAGES</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Manage the images and their links. Grid layout will dynamically adjust on the website.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-max">
              {section.images.map((img: string, i: number) => (
                <div key={i} className="flex flex-col gap-2 rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8]/40 p-2.5 relative col-span-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#3E332A]/60">Tile {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTile(i)}
                      className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex-1 min-h-[140px] aspect-[4/5]">
                    <ImageUpload label={`Tile ${i + 1}`} value={img} onChange={(val) => updateImage(i, val)} />
                  </div>
                  <input 
                    className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-[11px] text-foreground outline-none transition focus:border-[#3E332A]/50 shadow-sm" 
                    value={section.image_links?.[i] || ""} 
                    onChange={(e) => updateImageLink(i, e.target.value)} 
                    placeholder="https://instagram.com/p/..."
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addTile}
                className="col-span-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#3E332A]/30 hover:border-[#3E332A]/60 hover:bg-[#3E332A]/5 py-4 text-xs font-bold text-[#3E332A] uppercase tracking-wider transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add image tile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
