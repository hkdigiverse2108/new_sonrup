import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useProductReviews, 
  apiAdminCreateProductReview, 
  apiAdminUpdateProductReview, 
  apiAdminDeleteProductReview,
  useProducts
} from "@/lib/api";
import { Plus, Trash2, CheckCircle2, Edit2, X } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/product-reviews")({
  component: ProductReviewsPage,
});

function ProductReviewsPage() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useProducts();
  const { data: reviews = [], isLoading } = useProductReviews();
  const confirm = useConfirm();

  const [editingReview, setEditingReview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSaveReview = async () => {
    if (!editingReview.name || !editingReview.product_slug || !editingReview.text) {
      toast.error("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingReview._id) {
        await apiAdminUpdateProductReview(editingReview._id, editingReview);
      } else {
        await apiAdminCreateProductReview(editingReview);
      }
      queryClient.invalidateQueries({ queryKey: ["product_reviews"] });
      toast.success("Review saved successfully!");
      setEditingReview(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Delete Review?",
      description: "Are you sure you want to delete this product review?",
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    
    if (isConfirmed) {
      try {
        await apiAdminDeleteProductReview(id);
        queryClient.invalidateQueries({ queryKey: ["product_reviews"] });
        toast.success("Review deleted successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete review");
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8 pb-20 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#3E332A]">Product Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage reviews for specific products</p>
        </div>
        <button 
          onClick={() => setEditingReview({ product_slug: "", name: "", city: "", rating: 5, text: "" })}
          className="flex items-center gap-2 rounded-full bg-[#3E332A] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#3E332A]/90 focus:outline-none focus:ring-2 focus:ring-[#3E332A]/20"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {editingReview && (
        <div className="mb-10 overflow-hidden rounded-xl border border-[#e5e1dc] bg-[#faf9f6] shadow-sm">
          <div className="border-b border-[#e5e1dc] bg-[#f4f1eb] px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-[#2d3748]">
              {editingReview._id ? "Edit Review" : "New Review"}
            </h3>
            <button 
              onClick={() => setEditingReview(null)}
              className="text-muted-foreground hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="grid gap-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Product *</span>
                <select 
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50 cursor-pointer" 
                  value={editingReview.product_slug} 
                  onChange={(e) => setEditingReview({...editingReview, product_slug: e.target.value})} 
                >
                  <option value="">Select a product...</option>
                  {products.map((p: any) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Customer Name *</span>
                <input 
                  type="text"
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.name} 
                  onChange={(e) => setEditingReview({...editingReview, name: e.target.value})} 
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">City</span>
                <input 
                  type="text"
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50" 
                  value={editingReview.city} 
                  onChange={(e) => setEditingReview({...editingReview, city: e.target.value})} 
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Rating (1-5)</span>
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

              <label className="grid gap-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Review Text *</span>
                <textarea 
                  className="w-full rounded-md border border-[#e5e1dc] bg-white px-3 py-1.5 text-sm outline-none transition focus:border-primary/50 min-h-[100px]" 
                  value={editingReview.text} 
                  onChange={(e) => setEditingReview({...editingReview, text: e.target.value})} 
                />
              </label>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleSaveReview}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-full bg-[#3E332A] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#3E332A]/90 focus:outline-none focus:ring-2 focus:ring-[#3E332A]/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {reviews.length === 0 && !editingReview ? (
        <div className="rounded-xl border border-dashed border-[#e5e1dc] bg-white/50 p-12 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">No product reviews found. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((r: any) => (
            <div key={r._id} className="group relative overflow-hidden rounded-xl border border-[#e5e1dc] bg-white p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`h-4 w-4 ${i < Math.floor(r.rating) ? "text-[#f59e0b]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider bg-[#faf9f8] px-2 py-0.5 rounded-md border border-[#e5e1dc]">
                    {products.find((p: any) => p.slug === r.product_slug)?.name || r.product_slug}
                  </span>
                </div>
                <p className="font-medium text-foreground text-sm italic mb-4">"{r.text}"</p>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e1dc]">
                <div>
                  <p className="text-sm font-bold leading-none text-foreground">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{r.city}</p>
                </div>
                
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button 
                    onClick={() => setEditingReview(r)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-[#faf9f8] hover:text-[#3E332A] transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteReview(r._id)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
