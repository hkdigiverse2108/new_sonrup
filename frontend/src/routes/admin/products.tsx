import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import { apiAdminCreateProduct, apiAdminUpdateProduct, apiAdminDeleteProduct, apiUploadFile } from "@/lib/api";
import { Product } from "@/lib/products";
import { BrandButton } from "@/components/site/Primitives";

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

function ProductForm({ product, onClose, onSave }: { product: Partial<Product>, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState<any>(product);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await apiUploadFile(file);
      setFormData({ ...formData, image: res.url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

        <FieldGroup title="Images">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label>Main Image</Label>
              <div className="flex items-center gap-3">
                {formData.image && <img src={formData.image} className="h-12 w-12 rounded-lg object-cover" />}
                <label className="cursor-pointer flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{uploading ? 'Uploading...' : 'Upload'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <Label>Gallery</Label>
                <label className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                  + Add
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const res = await apiUploadFile(file);
                      setFormData({ ...formData, gallery: [...(formData.gallery || []), res.url] });
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUploading(false);
                    }
                  }} disabled={uploading} />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.gallery || []).map((imgUrl: string, i: number) => (
                  <div key={i} className="relative group border border-border rounded-lg">
                    <img src={imgUrl} className="h-12 w-12 rounded-lg object-cover" />
                    <button type="button" onClick={() => setFormData({ ...formData, gallery: formData.gallery.filter((_: any, idx: number) => idx !== i) })} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
                {uploading && <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />}
                {!(formData.gallery || []).length && !uploading && <div className="h-12 w-12 rounded-lg border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">None</div>}
              </div>
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
                  (formData.badges || []).includes('Best Sellers')
                    ? 'Best Sellers'
                    : (formData.badges || []).includes('New Arrivals')
                    ? 'New Arrivals'
                    : ''
                }
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, badges: val ? [val] : [] });
                }}
                className="field"
              >
                <option value="">— None —</option>
                <option value="Best Sellers">Best Sellers</option>
                <option value="New Arrivals">New Arrivals</option>
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
