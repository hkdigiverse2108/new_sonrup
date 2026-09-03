import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  apiAdminUpdateHomeContent, 
  useReviews, 
  apiAdminCreateReview, 
  apiAdminUpdateReview, 
  apiAdminDeleteReview,
  useHomeContent
} from "@/lib/api";
import { Plus, Trash2, CheckCircle2, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

export const Route = createFileRoute("/admin/settings/reviews")({
  component: ReviewsSettingsPage,
});

function ReviewsSettingsPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: homeContent, isLoading: isContentLoading } = useHomeContent();
  
  const { data: reviewsList = [], isLoading: isReviewsLoading } = useReviews();

  const [form, setForm] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (homeContent && !form) {
      const rawSection = homeContent?.reviews_section || {};
      const sectionData = {
        eyebrow: rawSection.eyebrow || "Reviews",
        title: rawSection.title || "Loved by 120,000+ mornings",
      };
      setForm({ ...homeContent, reviews_section: sectionData });
    }
  }, [homeContent]);

  const saveHeaderMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateHomeContent(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["home_content"] }); toast.success("Header saved"); },
    onError: (err: any) => toast.error(err.message || "Failed to save header"),
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: any) => apiAdminCreateReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setIsAdding(false);
      setEditingReview(null);
      toast.success("Review created");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create review"),
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: any) => apiAdminUpdateReview(data.originalName, {
      name: data.name,
      city: data.city,
      rating: data.rating,
      text: data.text,
      product: data.product || "multi"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setEditingReview(null);
      toast.success("Review updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update review"),
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (name: string) => apiAdminDeleteReview(name),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reviews"] }); toast.success("Review deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete review"),
  });

  if (isContentLoading || !form) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-[#3E332A]" /></div>;
  }

  const setSection = (updates: any) => setForm({ ...form, reviews_section: { ...form.reviews_section, ...updates } });
  const section = form.reviews_section;

  const handleSaveReview = (reviewData: any) => {
    if (isAdding) {
      createReviewMutation.mutate(reviewData);
    } else {
      updateReviewMutation.mutate(reviewData);
    }
  };

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Reviews Section</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the reviews section headers and all customer reviews.</p>
        </div>
      </div>

      {/* Section Headers */}
      <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">SECTION HEADERS</h2>
          <button
            onClick={() => saveHeaderMutation.mutate(form)}
            className="flex items-center gap-2 rounded-full bg-[#3E332A] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 focus:outline-none focus:ring-2 focus:ring-[#3E332A]/20 disabled:opacity-50"
            disabled={saveHeaderMutation.isPending}
          >
            {saveHeaderMutation.isPending ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {saveHeaderMutation.isPending ? "SAVING..." : "SAVE HEADERS"}
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Review Cards */}
      <div className="rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[12px] font-extrabold uppercase tracking-widest text-muted-foreground/80">CUSTOMER REVIEWS</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Manage individual review cards shown in the grid.</p>
          </div>
          {!editingReview && (
            <button 
              onClick={() => {
                setEditingReview({ name: "", city: "", rating: 5, text: "", product: "" });
                setIsAdding(true);
              }}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD REVIEW
            </button>
          )}
        </div>

        {/* Editing Form */}
        {editingReview && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 relative">
            <button 
              onClick={() => setEditingReview(null)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-ink transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold mb-4">{isAdding ? "Add New Review" : `Edit Review: ${editingReview.originalName || editingReview.name}`}</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CUSTOMER NAME</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.name} 
                  onChange={(e) => setEditingReview({...editingReview, name: e.target.value})} 
                  placeholder="e.g. Priya Sharma"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">CITY / LOCATION</span>
                <input 
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.city} 
                  onChange={(e) => setEditingReview({...editingReview, city: e.target.value})} 
                  placeholder="e.g. Delhi"
                />
              </label>
              <label className="grid gap-1 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">REVIEW TEXT</span>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.text} 
                  onChange={(e) => setEditingReview({...editingReview, text: e.target.value})} 
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">RATING (1-5)</span>
                <input 
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.rating} 
                  onChange={(e) => setEditingReview({...editingReview, rating: parseFloat(e.target.value) || 5})} 
                />
              </label>
            </div>
            
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => handleSaveReview(editingReview)}
                disabled={createReviewMutation.isPending || updateReviewMutation.isPending || !editingReview.name}
                className="rounded-full bg-[#3E332A] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#3E332A]/90 disabled:opacity-50"
              >
                {(createReviewMutation.isPending || updateReviewMutation.isPending) ? "SAVING..." : "SAVE REVIEW"}
              </button>
            </div>
          </div>
        )}

        {/* Existing Reviews Grid */}
        {!isReviewsLoading && !editingReview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviewsList.map((r) => (
              <div key={r.name} className="flex flex-col justify-between rounded-xl border border-[#e5e1dc] bg-[#faf9f8] p-5 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-extrabold text-ink">
                        {r.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold leading-none">{r.name}</p>
                        <p className="mt-1 truncate text-[10px] text-muted-foreground">{r.city} • {r.rating}★</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button 
                        onClick={() => {
                          setEditingReview({ ...r, originalName: r.name });
                          setIsAdding(false);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-black/5 hover:text-ink transition-colors"
                        title="Edit Review"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={async () => {
                          const ok = await confirm({
                            title: "Delete Review",
                            message: `Are you sure you want to delete the review from ${r.name}?`,
                            confirmText: "Delete",
                            cancelText: "Cancel"
                          });
                          if (ok) {
                            deleteReviewMutation.mutate(r.name);
                          }
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete Review"
                        disabled={deleteReviewMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground line-clamp-4">"{r.text}"</p>
                </div>
              </div>
            ))}
            
            {reviewsList.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-[#e5e1dc] bg-[#faf9f8] p-8 text-center text-sm text-muted-foreground">
                No reviews found. Add one to get started!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
