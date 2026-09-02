import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useHomeContent, apiAdminUpdateHomeContent, apiAdminCreateFlavour, apiAdminUpdateFlavour, apiAdminDeleteFlavour, useFlavours, apiUploadFile, getImageUrl } from "@/lib/api";
import { Plus, Trash2, GripVertical, CheckCircle2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/settings/flavours")({
  component: FlavoursSettingsPage,
});

function FlavoursSettingsPage() {
  const queryClient = useQueryClient();
  const { data: homeContent, isLoading: isHomeLoading } = useHomeContent();
  
  const { data: flavours, isLoading: isFlavoursLoading } = useFlavours();

  const [headerForm, setHeaderForm] = useState<any>(null);
  const [flavoursList, setFlavoursList] = useState<any[]>([]);

  useEffect(() => {
    if (homeContent && !headerForm) {
      const defSection = homeContent?.flavour_section ?? {
        eyebrow: "Flavour experience",
        title_black: "Five flavours.",
        title_gold: "Zero compromise."
      };
      setHeaderForm(defSection);
    }
  }, [homeContent]);

  useEffect(() => {
    if (flavours && flavoursList.length === 0) {
      setFlavoursList(flavours);
    }
  }, [flavours]);

  const saveHeaderMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent({ ...homeContent, flavour_section: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  const saveFlavourMutation = useMutation({
    mutationFn: async (list: any[]) => {
      // For simplicity, we just delete all and recreate them one by one since it's a small list,
      // or we can just iterate and update. Let's iterate and update if they have a token, else create.
      // But we can't easily sync deletions unless we diff.
      // Easiest is to send the whole list to a sync endpoint, but we only have POST/PUT/DELETE.
      
      // Get current from DB
      const current = flavours || [];
      const currentTokens = current.map((c: any) => c.token);
      const newTokens = list.map(c => c.token);
      
      // Delete ones that are missing
      const toDelete = currentTokens.filter((t: string) => !newTokens.includes(t));
      for (const t of toDelete) {
        await apiAdminDeleteFlavour(t);
      }
      
      // Create or update
      for (const item of list) {
        if (!item.token) continue; // safety
        if (currentTokens.includes(item.token)) {
          await apiAdminUpdateFlavour(item.token, item);
        } else {
          await apiAdminCreateFlavour(item);
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flavours"] }),
  });

  if (isHomeLoading || isFlavoursLoading || !headerForm) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setHeader = (updates: any) => setHeaderForm({ ...headerForm, ...updates });

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Flavours Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the flavour experience section and your available flavours.</p>
        </div>
        <button
          onClick={() => {
            saveHeaderMutation.mutate(headerForm);
            saveFlavourMutation.mutate(flavoursList);
          }}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 focus:outline-none focus:ring-4 focus:ring-[#3E332A]/20 disabled:opacity-50"
          disabled={saveHeaderMutation.isPending || saveFlavourMutation.isPending}
        >
          {(saveHeaderMutation.isPending || saveFlavourMutation.isPending) ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {saveHeaderMutation.isPending || saveFlavourMutation.isPending ? "SAVING..." : "SAVE ALL CHANGES"}
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        {/* Section Headers */}
        <div className="xl:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION HEADLINE</h2>
            
            <div className="space-y-3">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW TEXT</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={headerForm.eyebrow} 
                  onChange={(e) => setHeader({ eyebrow: e.target.value })} 
                />
              </label>
              
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HEADLINE (BLACK PART)</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={headerForm.title_black} 
                  onChange={(e) => setHeader({ title_black: e.target.value })} 
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">HEADLINE (GOLD PART)</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                  value={headerForm.title_gold} 
                  onChange={(e) => setHeader({ title_gold: e.target.value })} 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Flavours List */}
        <div className="xl:col-span-7 space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FLAVOURS LIST</h2>
              <button 
                type="button" 
                onClick={() => setFlavoursList([...flavoursList, { name: "New Flavour", token: "#eab308", note: "Flavor description" }])} 
                className="text-[10px] font-bold uppercase tracking-widest text-[#3E332A] hover:underline"
              >
                + ADD FLAVOUR
              </button>
            </div>
            
            <div className="space-y-3">
              {flavoursList.map((flavour, i) => (
                <div key={i} className="rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/30 cursor-grab" />
                      <span className="text-xs font-bold text-[#3E332A]">Flavour {i + 1}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFlavoursList(flavoursList.filter((_, j) => j !== i))} 
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
                        value={flavour.name} 
                        onChange={(e) => { const n = [...flavoursList]; n[i].name = e.target.value; setFlavoursList(n); }} 
                      />
                    </label>

                    <label className="grid gap-1 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">DESCRIPTION</span>
                      <input 
                        className="w-full rounded-lg border border-[#e5e1dc] bg-white px-3 py-1.5 text-xs text-foreground outline-none transition focus:border-[#3E332A]/50" 
                        value={flavour.note} 
                        onChange={(e) => { const n = [...flavoursList]; n[i].note = e.target.value; setFlavoursList(n); }} 
                      />
                    </label>
                    <div className="grid gap-1 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">FLAVOUR IMAGE</span>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="h-16 w-16 shrink-0 rounded-xl border border-[#e5e1dc] bg-white overflow-hidden flex items-center justify-center shadow-sm">
                          {flavour.image ? (
                            <img src={getImageUrl(flavour.image)} alt={flavour.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium">No Image</span>
                          )}
                        </div>
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#3E332A] border border-[#e5e1dc] transition shadow-sm hover:bg-[#faf9f8] hover:border-[#3E332A]/30">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Select Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const res = await apiUploadFile(file);
                                    const n = [...flavoursList];
                                    n[i].image = res.url;
                                    setFlavoursList(n);
                                  } catch (err) {
                                    alert("Failed to upload image: " + err);
                                  }
                                }
                              }}
                            />
                          </label>
                          <p className="mt-2 text-[10px] font-medium text-muted-foreground/70">Upload a beautiful, high-quality image.</p>
                        </div>
                      </div>
                    </div>
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
