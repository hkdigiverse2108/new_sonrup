import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUploadFile, apiAdminUpdatePost, apiAdminCreatePost, fetchJson } from "@/lib/api";
import { CheckCircle2, ArrowLeft, Plus, Trash2, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";
import { UploadCloud, CheckCircle, Trash2 as TrashIcon } from "lucide-react";

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
        <div className="relative h-full w-full group">
          <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
            <button
              onClick={() => onChange("")}
              className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors shadow-lg"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            {uploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <UploadCloud className="mb-2 h-6 w-6 text-muted-foreground/50" />
                <p className="text-xs font-semibold text-muted-foreground">Upload {label}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">PNG, JPG up to 5MB</p>
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
    queryFn: () => fetchJson<any>(`/api/posts/${slug}`).then((r) => r.json()),
    enabled: !isNew,
  });

  const [form, setForm] = useState<any>({
    slug: "",
    title: "",
    category: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    read: "5 min read",
    excerpt: "",
    accent: "primary",
    image: "",
    body: [{ type: "text", content: "" }],
  });

  useEffect(() => {
    if (existingPost && !isNew) {
      setForm({
        ...existingPost,
        body: Array.isArray(existingPost.body) && existingPost.body.length > 0
          ? (typeof existingPost.body[0] === "string" 
              ? existingPost.body.map((t: string) => ({ type: "text", content: t }))
              : existingPost.body)
          : [{ type: "text", content: "" }]
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(isNew ? "Post created!" : "Post updated!");
      navigate({ to: "/admin/settings/journal" });
    },
    onError: (err: any) => toast.error(err.message || "Failed to save post"),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setField = (k: string, v: string) => setForm({ ...form, [k]: v });
  
  const updateBlock = (idx: number, content: string) => {
    const newBody = [...form.body];
    newBody[idx].content = content;
    setForm({ ...form, body: newBody });
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
            <div className="grid gap-4">
              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span><input className="w-full rounded-md border px-3 py-2 text-[13px] font-bold" value={form.title} onChange={(e) => {
                const title = e.target.value;
                if (isNew) {
                  setForm({ ...form, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
                } else setField("title", title);
              }} placeholder="Enter post title..." /></label>
              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SLUG (URL)</span><input className="w-full rounded-md border px-3 py-2 text-[13px] bg-gray-50" value={form.slug} onChange={(e) => setField("slug", e.target.value)} disabled={!isNew} /></label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CATEGORY</span><input className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Science" /></label>
                <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">PUBLISH DATE</span><input className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.date} onChange={(e) => setField("date", e.target.value)} /></label>
                <label className="grid gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">ACCENT COLOR</span>
                  <select className="w-full rounded-md border px-3 py-2 text-[13px]" value={form.accent} onChange={(e) => setField("accent", e.target.value)}>
                    <option value="primary">Primary (Yellow)</option>
                    <option value="citrus">Citrus (Orange)</option>
                    <option value="berry">Berry (Red)</option>
                    <option value="grape">Grape (Purple)</option>
                    <option value="leaf">Leaf (Green)</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EXCERPT</span><textarea className="w-full rounded-md border px-3 py-2 text-[13px] min-h-[80px]" value={form.excerpt} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short summary for the blog list..." /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e1dc] bg-white p-6 shadow-sm space-y-6">
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CONTENT BLOCKS</h2>
            <div className="space-y-4">
              {form.body.map((block: any, i: number) => (
                <div key={i} className="relative group rounded-xl border border-border p-4 bg-gray-50/50">
                  <div className="absolute -left-3 top-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveBlock(i, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white border shadow text-xs hover:bg-gray-50" disabled={i === 0}>↑</button>
                    <button onClick={() => moveBlock(i, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white border shadow text-xs hover:bg-gray-50" disabled={i === form.body.length - 1}>↓</button>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      {block.type === "text" ? <Type className="w-3 h-3"/> : <ImageIcon className="w-3 h-3"/>} {block.type.toUpperCase()} BLOCK
                    </span>
                    <button onClick={() => removeBlock(i)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                  {block.type === "text" ? (
                    <textarea 
                      className="w-full rounded-md border px-3 py-2 text-[13px] min-h-[100px] font-mono leading-relaxed" 
                      value={block.content} 
                      onChange={(e) => updateBlock(i, e.target.value)} 
                      placeholder="Write your paragraph here..." 
                    />
                  ) : (
                    <div className="h-48 rounded overflow-hidden border border-dashed border-gray-300">
                      <ImageUpload label="Block Image" value={block.content} onChange={(v) => updateBlock(i, v)} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-center pt-4 border-t">
              <button onClick={() => addBlock("text")} className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold hover:bg-gray-50"><Type className="w-3 h-3"/> ADD TEXT</button>
              <button onClick={() => addBlock("image")} className="flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold hover:bg-gray-50"><ImageIcon className="w-3 h-3"/> ADD IMAGE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
