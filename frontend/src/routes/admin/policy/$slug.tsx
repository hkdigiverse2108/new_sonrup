import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdminUpdatePolicy, fetchJson, apiAdminCreatePolicy } from "@/lib/api";
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/policy/$slug")({
  component: PolicyEditorPage,
});

function PolicyEditorPage() {
  const { slug } = Route.useParams();
  const isNew = slug === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: initialData, isLoading } = useQuery<any>({
    queryKey: ["policy", slug],
    queryFn: () => fetchJson<any>(`/api/policies/${slug}`),
    enabled: !isNew,
  });

  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    intro: "",
    updated: "",
    sections: [{ heading: "", body: [""] }],
  });

  useEffect(() => {
    if (initialData && !isNew) {
      setForm({
        title: initialData.title || "",
        slug: initialData.slug || "",
        intro: initialData.intro || "",
        updated: initialData.updated || initialData.updatedAt || "",
        sections: initialData.sections && initialData.sections.length > 0 
          ? initialData.sections 
          : [{ heading: "", body: [""] }],
      });
    }
  }, [initialData, isNew]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => (isNew ? apiAdminCreatePolicy(data) : apiAdminUpdatePolicy(data.slug, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success(isNew ? "Policy created" : "Policy updated");
      if (isNew) {
        navigate({ to: "/admin/settings/policies" });
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save policy");
    },
  });

  const setField = (k: string, v: string) => setForm({ ...form, [k]: v });

  const addSection = () => {
    setForm({ ...form, sections: [...form.sections, { heading: "", body: [""] }] });
  };

  const updateSection = (idx: number, k: string, v: any) => {
    const newSections = [...form.sections];
    newSections[idx][k] = v;
    setForm({ ...form, sections: newSections });
  };

  const removeSection = (idx: number) => {
    const newSections = [...form.sections];
    newSections.splice(idx, 1);
    setForm({ ...form, sections: newSections });
  };

  const updateParagraph = (sIdx: number, pIdx: number, v: string) => {
    const newSections = [...form.sections];
    newSections[sIdx].body[pIdx] = v;
    setForm({ ...form, sections: newSections });
  };

  const addParagraph = (sIdx: number) => {
    const newSections = [...form.sections];
    newSections[sIdx].body.push("");
    setForm({ ...form, sections: newSections });
  };

  const removeParagraph = (sIdx: number, pIdx: number) => {
    const newSections = [...form.sections];
    newSections[sIdx].body.splice(pIdx, 1);
    setForm({ ...form, sections: newSections });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 pt-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/settings/policies"
            className="grid h-10 w-10 place-items-center rounded-full border bg-white text-muted-foreground transition hover:bg-gray-50 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">
              {isNew ? "New Policy" : "Edit Policy"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage policy content and details without using HTML tags.</p>
          </div>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending || !form.title || !form.slug}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {saveMutation.isPending ? "SAVING..." : "SAVE POLICY"}
        </button>
      </div>

      <div className="rounded-2xl border border-[#e5e1dc] bg-white p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TITLE</span>
            <input
              className="w-full rounded-md border px-3 py-2 text-[13px]"
              value={form.title}
              onChange={(e) => {
                setField("title", e.target.value);
                if (isNew) {
                  setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                }
              }}
              placeholder="e.g. Privacy Policy"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SLUG (URL)</span>
            <input
              className="w-full rounded-md border px-3 py-2 text-[13px] bg-gray-50"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              disabled={!isNew}
              placeholder="e.g. privacy-policy"
            />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">LAST UPDATED DATE</span>
          <input
            className="w-full rounded-md border px-3 py-2 text-[13px]"
            value={form.updated}
            onChange={(e) => setField("updated", e.target.value)}
            placeholder="e.g. August 2026"
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">INTRO PARAGRAPH</span>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-[13px] min-h-[80px]"
            value={form.intro}
            onChange={(e) => setField("intro", e.target.value)}
            placeholder="This policy explains..."
          />
        </label>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl font-extrabold text-[#3E332A]">Sections</h2>
        {form.sections.map((sec: any, sIdx: number) => (
          <div key={sIdx} className="rounded-xl border bg-gray-50 p-5 space-y-4 relative">
            <button
              onClick={() => removeSection(sIdx)}
              className="absolute right-4 top-4 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <label className="grid gap-1.5 pr-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SECTION HEADING</span>
              <input
                className="w-full rounded-md border px-3 py-2 text-[13px]"
                value={sec.heading}
                onChange={(e) => updateSection(sIdx, "heading", e.target.value)}
                placeholder="e.g. Information we collect"
              />
            </label>
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 block">PARAGRAPHS</span>
              {sec.body.map((pText: string, pIdx: number) => (
                <div key={pIdx} className="flex gap-2">
                  <textarea
                    className="flex-1 rounded-md border px-3 py-2 text-[13px] min-h-[60px]"
                    value={pText}
                    onChange={(e) => updateParagraph(sIdx, pIdx, e.target.value)}
                    placeholder="Paragraph text..."
                  />
                  <button
                    onClick={() => removeParagraph(sIdx, pIdx)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md border bg-white text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addParagraph(sIdx)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Paragraph
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={addSection}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition"
        >
          <Plus className="h-4 w-4" /> ADD NEW SECTION
        </button>
      </div>
    </div>
  );
}
