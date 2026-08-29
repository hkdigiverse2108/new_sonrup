import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useLoginContent, apiUploadFile, apiAdminUpdateLoginContent } from "@/lib/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/login")({
  component: LoginSettingsPage,
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
      toast.error("Failed to upload image");
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

function LoginSettingsPage() {
  const queryClient = useQueryClient();
  const { data: loginContent, isLoading } = useLoginContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (loginContent && !form) {
      setForm({
        image: loginContent.image || "/multi-vitamin.jpg",
        subtitle: loginContent.subtitle || "Delicious Nutrition.",
        description: loginContent.description || "Formulated with care to make taking your vitamins the best part of your day. Your wellness journey starts here."
      });
    }
  }, [loginContent, form]);

  const mutation = useMutation({
    mutationFn: apiAdminUpdateLoginContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login_content"] });
      toast.success("Login settings saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save login settings.");
    },
  });

  if (isLoading || !form) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-20 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Login Page Settings</h1>
          <p className="text-sm text-muted-foreground">Manage the content and imagery for the login/register screen.</p>
        </div>
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#3E332A] px-6 text-sm font-bold text-white transition-all hover:bg-[#3E332A]/90 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-bold text-foreground">Content Settings</h2>
          <div className="space-y-6">
            <ImageUpload 
              label="Product Image" 
              value={form.image} 
              onChange={(url) => setForm({ ...form, image: url })} 
            />

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-2.5 text-[13px] text-foreground transition-colors focus:border-[#3E332A]/50 focus:outline-none focus:ring-1 focus:ring-[#3E332A]/20"
                placeholder="Delicious Nutrition."
              />
            </label>

            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-2.5 text-[13px] text-foreground transition-colors focus:border-[#3E332A]/50 focus:outline-none focus:ring-1 focus:ring-[#3E332A]/20"
                placeholder="Description text here..."
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
