import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  useHomeContent,
  apiAdminUpdateHomeContent, 
  useFaqs,
  apiAdminCreateFaq,
  apiAdminUpdateFaq,
  apiAdminDeleteFaq,
  apiAdminReorderFaqs
} from "@/lib/api";
import { CheckCircle2, Plus, Edit2, Trash2, X, Search } from "lucide-react";

import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/settings/faqs")({
  component: FaqsSettingsPage,
});

function FaqsSettingsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: homeContent, isLoading: isContentLoading } = useHomeContent();

  const { data: faqs = [], isLoading: isFaqsLoading } = useFaqs();

  const [form, setForm] = useState<any>(null);
  const [catInput, setCatInput] = useState<string | null>(null);
  
  // FAQ CRUD State
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const categories = form?.faq_settings?.categories || ["PRODUCTS", "INGREDIENTS", "SHIPPING", "RETURNS", "PAYMENTS", "ORDERS"];
  
  const displayCategories = ["All", ...categories];

  const list = faqs.filter(
    (f) =>
      (cat === "All" || f.category?.trim().toLowerCase() === cat.trim().toLowerCase()) &&
      (q.trim() === "" || (f.q + f.a).toLowerCase().includes(q.toLowerCase())),
  );

  useEffect(() => {
    if (homeContent && !form) {
      const rawSection = homeContent?.faq_settings || {};
      
      const homeSectionData = {
        eyebrow: rawSection.home_section?.eyebrow || "FAQ",
        title: rawSection.home_section?.title || "Good questions, straight answers",
        cta_text: rawSection.home_section?.cta_text || "All FAQs"
      };
      
      const pageHeaderData = {
        eyebrow: rawSection.page_header?.eyebrow || "Help centre",
        title_black: rawSection.page_header?.title_black || "Questions, ",
        title_gold: rawSection.page_header?.title_gold || "answered.",
        sub: rawSection.page_header?.sub || "Ingredients, dosage, delivery and returns — if it isn't here, our team replies within one working day."
      };
      
      setForm({ 
        ...homeContent, 
        faq_settings: {
          home_section: homeSectionData,
          page_header: pageHeaderData,
          categories: rawSection.categories || ["PRODUCTS", "INGREDIENTS", "SHIPPING", "RETURNS", "PAYMENTS", "ORDERS"]
        } 
      });
    }
  }, [homeContent]);

  // Mutations
  const saveHeaderMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["home_content"] }),
  });

  const createFaqMutation = useMutation({
    mutationFn: (data: any) => apiAdminCreateFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setIsAdding(false);
      setEditingFaq(null);
    }
  });

  const updateFaqMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateFaq(data.originalQ, {
      category: data.category,
      q: data.q,
      a: data.a
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setEditingFaq(null);
    }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (q: string) => apiAdminDeleteFaq(q),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faqs"] }),
  });

  if (isContentLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setHomeSection = (updates: any) => setForm({ ...form, faq_settings: { ...form.faq_settings, home_section: { ...form.faq_settings.home_section, ...updates } } });
  const setPageHeader = (updates: any) => setForm({ ...form, faq_settings: { ...form.faq_settings, page_header: { ...form.faq_settings.page_header, ...updates } } });
  
  const homeSection = form.faq_settings.home_section;
  const pageHeader = form.faq_settings.page_header;

  const handleSaveFaq = (faqData: any) => {
    if (isAdding) {
      createFaqMutation.mutate(faqData);
    } else {
      updateFaqMutation.mutate(faqData);
    }
  };

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">FAQs Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage home page headers, FAQ page headers, categories, and individual questions.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Home Page Section Headers */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">HOME PAGE HEADERS</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Headers for the teaser section on the homepage.</p>
            </div>
            <button
              onClick={() => saveHeaderMutation.mutate(form)}
              className="flex items-center gap-1 rounded-full bg-[#3E332A] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
              disabled={saveHeaderMutation.isPending}
            >
              {saveHeaderMutation.isPending ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-3 w-3" />}
              SAVE
            </button>
          </div>
          
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW TEXT</span>
              <input 
                className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs outline-none transition focus:border-[#3E332A]/50" 
                value={homeSection.eyebrow} 
                onChange={(e) => setHomeSection({ eyebrow: e.target.value })} 
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">MAIN TITLE</span>
              <input 
                className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs outline-none transition focus:border-[#3E332A]/50" 
                value={homeSection.title} 
                onChange={(e) => setHomeSection({ title: e.target.value })} 
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">BUTTON TEXT</span>
              <input 
                className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs outline-none transition focus:border-[#3E332A]/50" 
                value={homeSection.cta_text} 
                onChange={(e) => setHomeSection({ cta_text: e.target.value })} 
              />
            </label>
          </div>
        </div>

        {/* FAQ Page Headers */}
        <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FAQ PAGE HEADERS</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Headers and categories for the /faq page.</p>
            </div>
            <button
              onClick={() => saveHeaderMutation.mutate(form)}
              className="flex items-center gap-1 rounded-full bg-[#3E332A] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
              disabled={saveHeaderMutation.isPending}
            >
              {saveHeaderMutation.isPending ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <CheckCircle2 className="h-3 w-3" />}
              SAVE
            </button>
          </div>
          
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">EYEBROW TEXT</span>
              <input 
                className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-xs outline-none transition focus:border-[#3E332A]/50" 
                value={pageHeader.eyebrow} 
                onChange={(e) => setPageHeader({ eyebrow: e.target.value })} 
              />
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">TITLE PART 1 (BLACK)</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-[12px] outline-none transition focus:border-[#3E332A]/50" 
                  value={pageHeader.title_black} 
                  onChange={(e) => setPageHeader({ title_black: e.target.value })} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">TITLE PART 2 (GOLD)</span>
                <input 
                  className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12px] outline-none transition focus:border-amber-400" 
                  value={pageHeader.title_gold} 
                  onChange={(e) => setPageHeader({ title_gold: e.target.value })} 
                />
              </label>
            </div>
            
            <label className="grid gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">INTRODUCTORY SUBTITLE</span>
              <textarea 
                className="w-full min-h-[50px] rounded-xl border border-[#e5e1dc] bg-[#faf9f8] px-4 py-3 text-[13px] outline-none transition focus:border-[#3E332A]/50" 
                value={pageHeader.sub} 
                onChange={(e) => setPageHeader({ sub: e.target.value })} 
              />
            </label>

            <label className="grid gap-1 border-t border-border pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CATEGORIES (COMMA-SEPARATED)</span>
              <input 
                className="w-full rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-3 py-1.5 text-[12px] outline-none transition focus:border-[#3E332A]/50" 
                value={catInput !== null ? catInput : categories.join(", ")} 
                onChange={(e) => {
                  setCatInput(e.target.value);
                  const cats = e.target.value.split(",").map(c => c.trim()).filter(Boolean);
                  setForm({ ...form, faq_settings: { ...form.faq_settings, categories: cats } });
                }}
                placeholder="PRODUCTS, INGREDIENTS, SHIPPING..."
              />
              <p className="text-[10px] text-muted-foreground">These appear as the filter pills on the FAQ page.</p>
            </label>
          </div>
        </div>
      </div>

      {/* FAQs List Manager */}
      <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">FAQ QUESTIONS & ANSWERS</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Manage all FAQs across the site.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex w-64 items-center gap-2 rounded-md border border-[#e5e1dc] bg-[#faf9f8] px-4 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search questions..."
                className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
              />
            </div>
            {!editingFaq && (
              <button 
                onClick={() => {
                  setEditingFaq({ category: "PRODUCTS", q: "", a: "" });
                  setIsAdding(true);
                }}
                className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
              >
                <Plus className="h-3.5 w-3.5" />
                ADD FAQ
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {displayCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${
                cat === c
                  ? "border-transparent bg-[#3E332A] text-white"
                  : "border-border bg-white text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Editing Form */}
        {editingFaq && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 relative">
            <button 
              onClick={() => setEditingFaq(null)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-ink transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold mb-4">{isAdding ? "Add New FAQ" : `Edit FAQ`}</h3>
            
            <div className="grid gap-4">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CATEGORY</span>
                <select 
                  className="w-full sm:w-1/2 rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingFaq.category} 
                  onChange={(e) => setEditingFaq({...editingFaq, category: e.target.value})} 
                >
                  {categories.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">QUESTION</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingFaq.q} 
                  onChange={(e) => setEditingFaq({...editingFaq, q: e.target.value})} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">ANSWER</span>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingFaq.a} 
                  onChange={(e) => setEditingFaq({...editingFaq, a: e.target.value})} 
                />
              </label>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => handleSaveFaq(editingFaq)}
                disabled={createFaqMutation.isPending || updateFaqMutation.isPending || !editingFaq.q || !editingFaq.a}
                className="rounded-full bg-[#3E332A] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
              >
                {(createFaqMutation.isPending || updateFaqMutation.isPending) ? "SAVING..." : "SAVE FAQ"}
              </button>
            </div>
          </div>
        )}

        {/* Existing FAQs List */}
        {!isFaqsLoading && !editingFaq && (
          <div className="grid gap-4">
            {list.map((f) => (
              <div key={f.q} className="rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary mb-2">
                      {f.category}
                    </span>
                    <h4 className="text-sm font-bold text-ink mb-2">{f.q}</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">{f.a}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => {
                        setEditingFaq({ ...f, originalQ: f.q });
                        setIsAdding(false);
                      }}
                      className="rounded p-1.5 text-muted-foreground hover:bg-black/5 hover:text-ink transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={async () => {
                        const ok = await confirm({
                          title: "Delete FAQ",
                          message: "Are you sure you want to delete this FAQ?",
                          confirmText: "Delete",
                          cancelText: "Cancel"
                        });
                        if (ok) {
                          deleteFaqMutation.mutate(f.q);
                        }
                      }}
                      className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete FAQ"
                      disabled={deleteFaqMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {list.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8] p-8 text-center text-sm text-muted-foreground">
                No FAQs found for this filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
