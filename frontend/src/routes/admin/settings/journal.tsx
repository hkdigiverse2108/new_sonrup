import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useJournalContent, usePosts, apiAdminUpdateJournalContent, apiAdminDeletePost, apiUploadFile, getImageUrl } from "@/lib/api";
import { CheckCircle2, Plus, Edit2, Trash2, UploadCloud, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/settings/journal")({
  component: JournalSettingsPage,
});

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
      toast.error("Failed to upload image");
    }
    setLoading(false);
  };
  return (
    <label className="grid gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-2.5 pr-4 transition-colors focus-within:border-[#3E332A]/50 focus-within:ring-1 focus-within:ring-[#3E332A]/20">
        {value ? (
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <img src={getImageUrl(value)} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-12 w-16 shrink-0 rounded-lg border border-dashed border-border flex items-center justify-center bg-white text-muted-foreground/50">
            <Plus className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
          <input 
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="w-full text-xs text-foreground file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#3E332A] file:px-3 file:py-1 file:text-[11px] file:font-bold file:text-white hover:file:bg-[#3E332A]/90 focus:outline-none disabled:opacity-50" 
            disabled={loading}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-500 font-semibold hover:underline shrink-0"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </label>
  );
}

function JournalSettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: journalContent, isLoading: isLoadingContent } = useJournalContent();
  const { data: posts = [], isLoading: isLoadingPosts } = usePosts();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (journalContent && !form) {
      const hero = journalContent.hero || {
        eyebrow: "The Journal",
        title_black: "Straight answers about",
        title_gold: "what you swallow.",
        sub: "No mysticism, no miracle claims. Just clear writing on ingredients, doses and the small habits that make a routine stick.",
        image: ""
      };
      const cta = journalContent.cta || {
        eyebrow: "Read something you liked?",
        title: "Put it into practice today.",
        cta_text: "Shop the range",
        cta_link: "/shop"
      };
      setForm({ ...journalContent, hero, cta });
    }
  }, [journalContent]);

  const saveContentMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateJournalContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_content"] });
      toast.success("Journal header settings saved successfully!");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const deletePostMutation = useMutation({
    mutationFn: (slug: string) => apiAdminDeletePost(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const confirm = useConfirm();

  const handleDelete = async (slug: string) => {
    const ok = await confirm({
      title: "Delete Post",
      message: "Are you sure you want to delete this post?",
      confirmText: "Delete",
      cancelText: "Cancel"
    });
    if (ok) {
      deletePostMutation.mutate(slug);
    }
  };

  if (isLoadingContent || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setHero = (u: any) => setForm({ ...form, hero: { ...form.hero, ...u } });

  return (
    <div className="space-y-12 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Journal Page & Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the Journal header section and your individual blog articles.</p>
        </div>
        <button
          onClick={() => saveContentMutation.mutate(form)}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
          disabled={saveContentMutation.isPending}
        >
          {saveContentMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          {saveContentMutation.isPending ? "SAVING..." : "SAVE HEADER SETTINGS"}
        </button>
      </div>

      <div className="w-full">
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">JOURNAL MAIN PAGE HERO (HEADER)</h2>
          <div className="space-y-4">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">TITLE (BLACK)</span><input className="w-full rounded-md border px-3 py-1.5 text-[12px]" value={form.hero.title_black} onChange={(e) => setHero({ title_black: e.target.value })} /></label>
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">TITLE (GOLD)</span><input className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px]" value={form.hero.title_gold} onChange={(e) => setHero({ title_gold: e.target.value })} /></label>
            </div>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTITLE</span><textarea className="w-full rounded-md border px-3 py-1.5 text-xs min-h-[80px]" value={form.hero.sub} onChange={(e) => setHero({ sub: e.target.value })} /></label>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">BOTTOM CTA</h2>
          <div className="space-y-3">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta?.eyebrow || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, eyebrow: e.target.value } })} /></label>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.cta?.title || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, title: e.target.value } })} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">BUTTON TEXT</span><input className="w-full rounded-md border px-3 py-1.5 text-[12px]" value={form.cta?.cta_text || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, cta_text: e.target.value } })} /></label>
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">BUTTON LINK</span><input className="w-full rounded-md border px-3 py-1.5 text-[12px]" value={form.cta?.cta_link || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, cta_link: e.target.value } })} /></label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-[14px] font-extrabold uppercase tracking-widest text-muted-foreground">ALL JOURNAL POSTS</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Click any post to edit its title, content, cover image, and detail page banner image.</p>
          </div>
          <button
            onClick={() => navigate({ to: "/admin/post/$slug", params: { slug: "new" } })}
            className="flex items-center gap-2 rounded-full border border-[#3E332A] bg-[#3E332A] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            CREATE NEW POST
          </button>
        </div>

        {isLoadingPosts ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center bg-white">
            <p className="text-muted-foreground text-sm">No posts found. Create your first post!</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...posts].sort((a, b) => {
              const rA = a.rank ?? 0;
              const rB = b.rank ?? 0;
              const rankA = rA > 0 ? rA : 9999;
              const rankB = rB > 0 ? rB : 9999;
              if (rankA !== rankB) return rankA - rankB;
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            }).map((p) => (
              <div key={p.slug} className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm transition hover:shadow-md flex flex-col">
                <div className="relative h-40 bg-muted overflow-hidden">
                  {p.image ? (
                    <img src={getImageUrl(p.image)} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 bg-muted/60">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                    <span className="rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {p.category}
                    </span>
                    {p.detail_image && (
                      <span className="rounded-full bg-secondary/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        + Detail Banner
                      </span>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                    <button
                      onClick={() => navigate({ to: "/admin/post/$slug", params: { slug: p.slug } })}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#3E332A] shadow-md hover:bg-gray-100"
                      title="Edit Post"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-white text-red-500 shadow-md hover:bg-red-50"
                      title="Delete Post"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{p.date}</span>
                    <h3 className="mt-1 font-display text-base font-extrabold leading-tight tracking-tight text-foreground line-clamp-2 group-hover:text-secondary transition-colors">
                      {p.title}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <button
                      onClick={() => navigate({ to: "/admin/post/$slug", params: { slug: p.slug } })}
                      className="font-bold text-[#3E332A] hover:underline"
                    >
                      Edit Content & Images →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
