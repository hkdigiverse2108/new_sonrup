import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { apiAdminCreateProduct, apiAdminUpdateProduct, apiAdminDeleteProduct, apiUploadFile } from "@/lib/api";
import { Product } from "@/lib/products";
import { BrandButton } from "@/components/site/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{children}</span>;
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-3 py-1.5.5">
        <h2 className="font-display text-sm font-extrabold">{title}</h2>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  );
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((r) => r.json()),
  });

  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => apiAdminDeleteProduct(slug),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing?.slug && products.find(p => p.slug === editing.slug)) {
        return apiAdminUpdateProduct(editing.slug, data);
      }
      return apiAdminCreateProduct(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });

  return (
    <div className="space-y-6">
      {editing ? (
        <ProductForm 
          product={editing} 
          onClose={() => setEditing(null)} 
          onSave={(data) => saveMutation.mutate(data)} 
          allProducts={products}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-extrabold tracking-tight">Products</h1>
            <BrandButton onClick={() => setEditing({ categories: [], benefits: [], goals: [], badges: [], ingredients: [], nutrition: [] })}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </BrandButton>
          </div>

          {isLoading ? (
            <div>Loading products...</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Flavour</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.slug} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} className="h-10 w-10 rounded-lg object-cover" />}
                          <span className="font-semibold">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{p.price}</td>
                      <td className="px-6 py-4">{p.flavour}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setEditing(p)} className="p-2 text-muted-foreground hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(p.slug)} className="p-2 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSave, allProducts }: { product: Partial<Product>, onClose: () => void, onSave: (data: any) => void, allProducts: Product[] }) {
  const [formData, setFormData] = useState<any>(product);
  const [uploading, setUploading] = useState(false);
  const [imagesList, setImagesList] = useState<string[]>(() => {
    const list = [product.image, ...(product.gallery || [])].filter(Boolean) as string[];
    return Array.from(new Set(list));
  });

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      await Promise.all(
        files.map(async (file) => {
          try {
            const res = await apiUploadFile(file);
            if (res.url) {
              urls.push(res.url);
            }
          } catch (err) {
            console.error("Failed to upload file:", file.name, err);
          }
        })
      );
      if (urls.length > 0) {
        setImagesList((prev) => [...prev, ...urls]);
      }
    } catch (err) {
      console.error("Error during batch upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const moveImageLeft = (idx: number) => {
    if (idx === 0) return;
    setImagesList((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
  };

  const moveImageRight = (idx: number) => {
    setImagesList((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
  };

  const makeCoverImage = (idx: number) => {
    if (idx === 0) return;
    setImagesList((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const removeImage = (idx: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      image: imagesList[0] || "",
      gallery: imagesList.slice(1)
    });
  };

  const addIngredient = () => setFormData({ ...formData, ingredients: [...(formData.ingredients || []), { name: '', note: '' }] });
  const removeIngredient = (idx: number) => setFormData({ ...formData, ingredients: (formData.ingredients || []).filter((_: any, i: number) => i !== idx) });
  const updateIngredient = (idx: number, field: string, val: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[idx] = { ...newIngredients[idx], [field]: val };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addNutrition = () => setFormData({ ...formData, nutrition: [...(formData.nutrition || []), { label: '', value: '' }] });
  const removeNutrition = (idx: number) => setFormData({ ...formData, nutrition: (formData.nutrition || []).filter((_: any, i: number) => i !== idx) });
  const updateNutrition = (idx: number, field: string, val: string) => {
    const newNutrition = [...(formData.nutrition || [])];
    newNutrition[idx] = { ...newNutrition[idx], [field]: val };
    setFormData({ ...formData, nutrition: newNutrition });
  };

  return (
    <div className="space-y-3 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <Label>Product Editor</Label>
          <h1 className="mt-0.5 font-display text-2xl font-extrabold tracking-tight">{product.slug ? 'Edit Product' : 'Add Product'}</h1>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <FieldGroup title="Basic Info">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <Label>Name</Label>
              <input className="field" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Slug</Label>
              <input className="field" required value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} disabled={!!product.slug} />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <Label>Tagline</Label>
              <input className="field" required value={formData.tagline || ''} onChange={e => setFormData({...formData, tagline: e.target.value})} />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <Label>Description</Label>
              <textarea className="field min-h-[72px]" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </label>
          </div>
        </FieldGroup>

        <FieldGroup title="Pricing & Variant">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1">
              <Label>Price (₹)</Label>
              <input type="number" className="field" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </label>
            <label className="grid gap-1">
              <Label>MRP (₹)</Label>
              <input type="number" className="field" required value={formData.mrp || ''} onChange={e => setFormData({...formData, mrp: Number(e.target.value)})} />
            </label>
            <label className="grid gap-1">
              <Label>Count</Label>
              <input className="field" required value={formData.count || ''} onChange={e => setFormData({...formData, count: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Flavour</Label>
              <input className="field" required value={formData.flavour || ''} onChange={e => setFormData({...formData, flavour: e.target.value})} />
            </label>
            <label className="grid gap-1 sm:col-span-2">
              <Label>Flavour Token (Color)</Label>
              <input className="field" required value={formData.flavourToken || ''} onChange={e => setFormData({...formData, flavourToken: e.target.value})} />
            </label>
          </div>
        </FieldGroup>

        <FieldGroup title="Usage & Storage">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <Label>How To Use</Label>
              <textarea className="field min-h-[60px]" value={formData.howToUse || ''} onChange={e => setFormData({...formData, howToUse: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Storage</Label>
              <textarea className="field min-h-[60px]" value={formData.storage || ''} onChange={e => setFormData({...formData, storage: e.target.value})} />
            </label>
          </div>
        </FieldGroup>

        <FieldGroup title="Product Images">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 items-start">
              {imagesList.map((imgUrl, i) => (
                <div key={i} className={cn(
                  "relative group flex flex-col items-center gap-1 p-1 rounded-lg border transition-all bg-card shadow-sm",
                  i === 0 ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-muted-foreground/30"
                )}>
                  {/* Image Display */}
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                    <img src={imgUrl} className="h-full w-full object-cover" />
                    
                    {/* Cover badge overlay */}
                    {i === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 right-0.5 text-center bg-primary/95 text-primary-foreground text-[8px] font-bold py-0.5 rounded uppercase tracking-wider shadow">
                        Cover
                      </span>
                    )}

                    {/* Delete button (Top Right) */}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive/90"
                      title="Delete Image"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Reordering Controls */}
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    {/* Move Left */}
                    <button
                      type="button"
                      onClick={() => moveImageLeft(i)}
                      disabled={i === 0}
                      className={cn(
                        "p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      )}
                      title="Move Left"
                    >
                      <ArrowLeft className="h-2.5 w-2.5" />
                    </button>

                    {/* Make Cover Button (Star) */}
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => makeCoverImage(i)}
                        className="p-0.5 rounded hover:bg-muted text-yellow-500 hover:text-yellow-600 transition-colors"
                        title="Make Cover Image"
                      >
                        <Star className="h-2.5 w-2.5 fill-current" />
                      </button>
                    )}

                    {/* Move Right */}
                    <button
                      type="button"
                      onClick={() => moveImageRight(i)}
                      disabled={i === imagesList.length - 1}
                      className={cn(
                        "p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      )}
                      title="Move Right"
                    >
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))}

              {uploading && (
                <div className="flex flex-col items-center gap-1 p-1 rounded-lg border border-dashed border-border bg-card">
                  <div className="h-16 w-16 rounded-md bg-muted animate-pulse flex items-center justify-center text-[10px] text-muted-foreground">
                    Uploading...
                  </div>
                  <div className="h-4" />
                </div>
              )}

              {/* Upload Input Card */}
              <label className={cn(
                "h-20 w-20 cursor-pointer rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-all shadow-sm",
                uploading && "pointer-events-none opacity-50"
              )}>
                <Plus className="h-5 w-5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Add Images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUploadImages} disabled={uploading} />
              </label>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup title="Tags & Badges">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <Label>Categories</Label>
              <input className="field" placeholder="e.g. Immunity, Wellness" value={(formData.categories || []).join(', ')} onChange={e => setFormData({...formData, categories: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
            </label>
            <label className="grid gap-1">
              <Label>Badges</Label>
              <select
                value={
                  (formData.badges || []).some(b => b === 'Best Sellers' || b === 'Best Seller')
                    ? 'Best Seller'
                    : (formData.badges || []).some(b => b === 'New Arrivals' || b === 'New Arrival')
                    ? 'New Arrival'
                    : ''
                }
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, badges: val ? [val] : [] });
                }}
                className="field"
              >
                <option value="">— None —</option>
                <option value="Best Seller">Best Sellers</option>
                <option value="New Arrival">New Arrivals</option>
              </select>
            </label>
            <label className="grid gap-1">
              <Label>Benefits</Label>
              <input className="field" placeholder="e.g. Boosts energy, Improves focus" value={(formData.benefits || []).join(', ')} onChange={e => setFormData({...formData, benefits: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
            </label>
            <label className="grid gap-1">
              <Label>Goals</Label>
              <input className="field" placeholder="e.g. Sleep, Immunity" value={(formData.goals || []).join(', ')} onChange={e => setFormData({...formData, goals: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
            </label>
          </div>
        </FieldGroup>

        <FieldGroup title="Ingredients">
          <div className="space-y-2">
            {(formData.ingredients || []).map((ing: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2 bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
                <input className="field flex-1 min-w-0" placeholder="Name" value={ing.name || ''} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                <input className="field flex-1 min-w-0" placeholder="Note" value={ing.note || ''} onChange={e => updateIngredient(i, 'note', e.target.value)} />
                <button type="button" onClick={() => removeIngredient(i)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors">
              <Plus className="h-3.5 w-3.5 shrink-0" /> Add Ingredient
            </button>
          </div>
        </FieldGroup>

        <FieldGroup title="Nutrition Facts">
          <div className="space-y-2">
            {(formData.nutrition || []).map((nut: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2 bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
                <input className="field flex-1 min-w-0" placeholder="Label (e.g. Energy)" value={nut.label || ''} onChange={e => updateNutrition(i, 'label', e.target.value)} />
                <input className="field flex-1 min-w-0" placeholder="Value (e.g. 26 kcal)" value={nut.value || ''} onChange={e => updateNutrition(i, 'value', e.target.value)} />
                <button type="button" onClick={() => removeNutrition(i)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addNutrition} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors">
              <Plus className="h-3.5 w-3.5 shrink-0" /> Add Nutrition Fact
            </button>
          </div>
        </FieldGroup>

        <FieldGroup title="Related Products (You may also like)">
          <div className="grid gap-3">
            <select
              className="field"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const rp = formData.related_products || [];
                if (!rp.includes(val)) {
                  setFormData({ ...formData, related_products: [...rp, val] });
                }
              }}
            >
              <option value="">+ Add a related product...</option>
              {allProducts
                .filter(p => p.slug !== product.slug)
                .filter(p => !(formData.related_products || []).includes(p.slug))
                .map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
            </select>
            
            <div className="flex flex-wrap gap-2">
              {(formData.related_products || []).map((slug: string) => {
                const p = allProducts.find(prod => prod.slug === slug);
                if (!p) return null;
                return (
                  <div key={slug} className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2.5 pr-1.5 shadow-sm">
                    {p.image && <img src={p.image} className="h-5 w-5 rounded-full object-cover shrink-0" />}
                    <span className="text-sm font-semibold">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const rp = formData.related_products || [];
                        setFormData({ ...formData, related_products: rp.filter((s: string) => s !== slug) });
                      }}
                      className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {!(formData.related_products || []).length && (
                <div className="text-xs text-muted-foreground">No related products selected.</div>
              )}
            </div>
          </div>
        </FieldGroup>


        <div className="sticky bottom-3 flex justify-end gap-2 rounded-xl bg-card border border-border px-4 py-3 shadow-lg">
          <button type="button" onClick={onClose} className="rounded-lg px-5 py-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow transition-all hover:opacity-90 active:scale-[0.99]">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
