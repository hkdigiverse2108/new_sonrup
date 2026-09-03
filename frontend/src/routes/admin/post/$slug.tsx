import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUploadFile, apiAdminUpdatePost, apiAdminCreatePost, fetchJson, getImageUrl } from "@/lib/api";
import { CheckCircle2, ArrowLeft, Plus, Trash2, Image as ImageIcon, Type, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { UploadCloud, CheckCircle, Trash2 as TrashIcon } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function ImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await apiUploadFile(file);
      onChange(data.url);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {value ? (
        <div className="relative h-full w-full group min-h-[160px]">
          <img src={getImageUrl(value)} alt="Uploaded" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors shadow-lg"
              title="Remove Image"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors min-h-[160px]">
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            {uploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3E332A] border-t-transparent" />
            ) : (
              <>
                <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground/50" />
                <p className="text-xs font-semibold text-muted-foreground">Upload {label}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin/post/$slug")({
  component: PostEditor,
});

function PostEditor() {
  const { slug } = Route.useParams();
  const isNew = slug === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingPost, isLoading } = useQuery<any>({
    queryKey: ["posts", slug],
    queryFn: () => fetchJson<any>(`/api/posts/${slug}`),
    enabled: !isNew,
  });

  const [form, setForm] = useState<any>({
    slug: "",
    title: "",
    category: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    read: "5 min read",
    excerpt: "",
    image: "",
    detail_image: "",
    body: [{ type: "text", content: "" }],
    rank: 0,
  });

  useEffect(() => {
    if (existingPost && !isNew) {
      let mergedBody = "";
      if (Array.isArray(existingPost.body) && existingPost.body.length > 0) {
        if (typeof existingPost.body[0] === "string") {
          mergedBody = existingPost.body.map((t: string) => `<p>${t}</p>`).join("");
        } else if (existingPost.body.length === 1 && existingPost.body[0].type === "html") {
          mergedBody = existingPost.body[0].content;
        } else {
          // Convert legacy multi-block format to single HTML block
          mergedBody = existingPost.body.map((block: any) => {
            if (block.type === "text") return `<p>${block.content}</p>`;
            if (block.type === "image") return `<img src="${block.content}" alt="Image" />`;
            return block.content;
          }).join("");
        }
      }
      
      setForm({
        ...existingPost,
        detail_image: existingPost.detail_image || "",
        body: [{ type: "html", content: mergedBody }]
      });
    }
  }, [existingPost, isNew]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data };
      if (!payload.slug && payload.title) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return isNew ? apiAdminCreatePost(payload) : apiAdminUpdatePost(slug, payload);
    },
    onSuccess: (respData: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (!isNew && slug) {
        queryClient.invalidateQueries({ queryKey: ["posts", slug] });
      }
      toast.success(isNew ? "Post created!" : "Post updated!");
      navigate({ to: "/admin/settings/journal" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save post"),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setField = (k: string, v: any) => setForm({ ...form, [k]: v });
  
  const updateBlock = (index: number, content: string) => {
    const newBody = [...form.body];
    newBody[index] = { ...newBody[index], content };
    setField("body", newBody);
  };
  
  const addBlock = (type: "text" | "image") => {
    setForm({ ...form, body: [...form.body, { type, content: "" }] });
  };
  
  const removeBlock = (idx: number) => {
    const newBody = [...form.body];
    newBody.splice(idx, 1);
    setForm({ ...form, body: newBody });
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= form.body.length) return;
    const newBody = [...form.body];
    const temp = newBody[idx];
    newBody[idx] = newBody[idx + dir];
    newBody[idx + dir] = temp;
    setForm({ ...form, body: newBody });
  };

  return (
    <div className="space-y-8 pb-32 pt-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="grid h-10 w-10 place-items-center rounded-full border bg-white hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">{isNew ? "Create Post" : "Edit Post"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage article content and images.</p>
          </div>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
          disabled={saveMutation.isPending || !form.slug || !form.title}
        >
          {saveMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          {saveMutation.isPending ? "SAVING..." : "SAVE POST"}
        </button>
      </div>

      <div className="grid gap-6">
        {/* MAIN EDITOR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#e5e1dc] bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">POST SETTINGS</h2>
            <div className="grid gap-5">
              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span><input className="w-full rounded-md border px-3 py-2 text-[13px] font-bold" value={form.title} onChange={(e) => {
                const title = e.target.value;
                setForm({ ...form, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
              }} placeholder="Enter post title..." /></label>
              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SLUG (URL)</span><input className="w-full rounded-md border px-3 py-2 text-[13px] bg-gray-50" value={form.slug} onChange={(e) => setField("slug", e.target.value)} disabled={!isNew} /></label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CATEGORY</span><input className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Science" /></label>
                <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">PUBLISH DATE</span><input className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.date} onChange={(e) => setField("date", e.target.value)} /></label>
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">RANK (Sort Order)</span>
                  <input type="number" className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.rank} onChange={(e) => setField("rank", parseInt(e.target.value) || 0)} placeholder="e.g. 1" />
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* 1. Card Thumbnail Image */}
                <div className="grid gap-1.5 rounded-xl border border-border p-4 bg-[#faf9f8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3E332A]">1. LIST / CARD THUMBNAIL IMAGE</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">Used on the main Journal list grid (`/blog`) and 'Keep reading' cards.</p>
                  <div className="h-44 rounded-lg overflow-hidden border border-dashed border-gray-300 relative bg-white">
                    <ImageUpload label="Card Thumbnail Image" value={form.image} onChange={(v) => setField("image", v)} />
                  </div>
                </div>

                {/* 2. Detail Page Hero Banner Image */}
                <div className="grid gap-1.5 rounded-xl border border-border p-4 bg-[#faf9f8]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3E332A]">2. DETAIL PAGE HERO BANNER IMAGE</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2">Used on the single article detail header (`/blog/$slug`). Falls back to Card Image if empty.</p>
                  <div className="h-44 rounded-lg overflow-hidden border border-dashed border-gray-300 relative bg-white">
                    <ImageUpload label="Detail Page Banner Image" value={form.detail_image || ""} onChange={(v) => setField("detail_image", v)} />
                  </div>
                </div>
              </div>

              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EXCERPT</span><textarea className="w-full rounded-md border px-3 py-2 text-[13px] min-h-[80px]" value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short summary for the blog list..." /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e1dc] bg-white p-6 shadow-sm space-y-6">
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CONTENT</h2>
            <div className="space-y-4">
              <RichTextEditor 
                value={form.body[0]?.content || ""} 
                onChange={(content) => {
                  setField("body", [{ type: "html", content }]);
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
