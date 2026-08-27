import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContactContent, apiAdminUpdateContactContent } from "@/lib/api";
import { CheckCircle2, Plus, Edit2, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/settings/contact")({
  component: ContactSettingsPage,
});

function ContactSettingsPage() {
  const queryClient = useQueryClient();
  const { data: contactContent, isLoading  } = useContactContent();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (contactContent && !form) {
      setForm(contactContent);
    }
  }, [contactContent]);

  const saveContentMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateContactContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact_content"] }),
  });

  if (isLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setHero = (u: any) => setForm({ ...form, hero: { ...form.hero, ...u } });
  const setSupportHours = (u: any) => setForm({ ...form, support_hours: { ...form.support_hours, ...u } });
  const setContactForm = (u: any) => setForm({ ...form, form: { ...form.form, ...u } });
  
  const updateChannel = (idx: number, field: string, val: string) => {
    const newChannels = [...form.channels];
    newChannels[idx] = { ...newChannels[idx], [field]: val };
    setForm({ ...form, channels: newChannels });
  };
  
  const addChannel = () => {
    setForm({ ...form, channels: [...form.channels, { icon: "Mail", label: "New Channel", value: "Details", note: "Note" }] });
  };
  
  const deleteChannel = (idx: number) => {
    const newChannels = [...form.channels];
    newChannels.splice(idx, 1);
    setForm({ ...form, channels: newChannels });
  };

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Contact Page</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all contact information and headers.</p>
        </div>
        <button
          onClick={() => saveContentMutation.mutate(form)}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
          disabled={saveContentMutation.isPending}
        >
          {saveContentMutation.isPending ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-4 w-4" />}
          {saveContentMutation.isPending ? "SAVING..." : "SAVE ALL CHANGES"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* HERO */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">PAGE HERO</h2>
          <div className="space-y-3">
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">TITLE (BLACK)</span><input className="w-full rounded-md border px-3 py-1.5 text-[12px]" value={form.hero.title_black} onChange={(e) => setHero({ title_black: e.target.value })} /></label>
              <label className="grid gap-1"><span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">TITLE (GOLD)</span><input className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px]" value={form.hero.title_gold} onChange={(e) => setHero({ title_gold: e.target.value })} /></label>
            </div>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">SUBTITLE</span><textarea className="w-full rounded-md border px-3 py-1.5 text-xs min-h-[60px]" value={form.hero.sub} onChange={(e) => setHero({ sub: e.target.value })} /></label>
          </div>
        </div>

        {/* SUPPORT HOURS & FORM */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SUPPORT HOURS</h2>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">TEXT</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.support_hours.text} onChange={(e) => setSupportHours({ text: e.target.value })} /></label>
          </div>

          <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
            <h2 className="mb-4 font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CONTACT FORM</h2>
            <label className="grid gap-1"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">FORM TITLE</span><input className="w-full rounded-md border px-3 py-1.5 text-xs" value={form.form.title} onChange={(e) => setContactForm({ title: e.target.value })} /></label>
          </div>
        </div>
      </div>

      {/* CHANNELS */}
      <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CONTACT CHANNELS</h2>
            <p className="text-[10px] text-muted-foreground mt-1">Manage email, phone, and other contact methods.</p>
          </div>
          <button onClick={addChannel} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20"><Plus className="w-3 h-3" /> ADD CHANNEL</button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {form.channels.map((c: any, i: number) => (
            <div key={i} className="relative p-4 border rounded-xl bg-muted/20 space-y-3">
              <button onClick={() => deleteChannel(i)} className="absolute right-3 top-3 p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
              
              <div className="grid gap-3 mr-6">
                <div className="flex gap-2">
                  <label className="w-1/3 grid gap-1"><span className="text-[9px] font-bold uppercase">ICON</span><input className="w-full rounded-md border px-2 py-1 text-xs" value={c.icon} onChange={(e) => updateChannel(i, "icon", e.target.value)} placeholder="Mail, Phone..." /></label>
                  <label className="flex-1 grid gap-1"><span className="text-[9px] font-bold uppercase">LABEL</span><input className="w-full rounded-md border px-2 py-1 text-xs" value={c.label} onChange={(e) => updateChannel(i, "label", e.target.value)} placeholder="Email us" /></label>
                </div>
                <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">VALUE</span><input className="w-full rounded-md border px-2 py-1 text-xs font-bold" value={c.value} onChange={(e) => updateChannel(i, "value", e.target.value)} placeholder="care@sonrup.in" /></label>
                <label className="grid gap-1"><span className="text-[9px] font-bold uppercase">NOTE</span><input className="w-full rounded-md border px-2 py-1 text-xs" value={c.note} onChange={(e) => updateChannel(i, "note", e.target.value)} placeholder="Replies within one working day" /></label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
