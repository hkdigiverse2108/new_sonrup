import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ArrowLeft, ArrowRight, Star, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
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
            <BrandButton onClick={() => setEditing({
              categories: [],
              benefits: [],
              goals: [],
              badges: [],
              ingredients: [],
              nutrition: [],
              accordions: [
                { title: "Benefits", content: "" },
                { title: "Ingredients", content: "" },
                { title: "Nutritional Information", content: "" },
                { title: "How to use", content: "" },
                { title: "Storage", content: "" },
                { title: "Shipping", content: "" },
                { title: "Returns", content: "" },
              ],
              trust_badges: [
                { icon: "Truck", text: "Free shipping above ₹499" },
                { icon: "ShieldCheck", text: "Lab tested every batch" },
                { icon: "Undo2", text: "7-day easy returns" },
              ]
            })}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </BrandButton>
          </div>

          {isLoading ? (
            <div>Loading products...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[600px] text-left text-sm">
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
  const [formData, setFormData] = useState<any>(() => {
    const data = { ...product };
    if (!data.accordions || data.accordions.length === 0) {
      const accs = [];
      if (data.benefits && data.benefits.length > 0) {
        accs.push({
          title: "Benefits",
          content: data.benefits.map((b: string) => `+ ${b}`).join("\n")
        });
      }
      if (data.ingredients && data.ingredients.length > 0) {
        accs.push({
          title: "Ingredients",
          content: data.ingredients.map((i: any) => `${i.name} — ${i.note}`).join("\n")
        });
      }
      if (data.nutrition && data.nutrition.length > 0) {
        accs.push({
          title: "Nutritional Information",
          content: data.nutrition.map((n: any) => `${n.label}: ${n.value}`).join("\n")
        });
      }
      if (data.howToUse) {
        accs.push({ title: "How to use", content: data.howToUse });
      }
      if (data.storage) {
        accs.push({ title: "Storage", content: data.storage });
      }
      if (data.shipping_info) {
        accs.push({ title: "Shipping", content: data.shipping_info });
      }
      if (data.returns_info) {
        accs.push({ title: "Returns", content: data.returns_info });
      }
      data.accordions = accs.length > 0 ? accs : [
        { title: "Benefits", content: "" },
        { title: "Ingredients", content: "" },
        { title: "Nutritional Information", content: "" },
        { title: "How to use", content: "" },
        { title: "Storage", content: "" },
        { title: "Shipping", content: "" },
        { title: "Returns", content: "" },
      ];
    }
    if (!data.trust_badges || data.trust_badges.length === 0) {
      data.trust_badges = [
        { icon: "Truck", text: "Free shipping above ₹499" },
        { icon: "ShieldCheck", text: "Lab tested every batch" },
        { icon: "Undo2", text: "7-day easy returns" },
      ];
    }
    return data;
  });
  const [uploading, setUploading] = useState(false);
  const [expandedTab, setExpandedTab] = useState<number | null>(0);
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



  const addAccordionTab = () => setFormData({ ...formData, accordions: [...(formData.accordions || []), { title: '', content: '' }] });
  const removeAccordionTab = (idx: number) => setFormData({ ...formData, accordions: (formData.accordions || []).filter((_: any, i: number) => i !== idx) });
  const updateAccordionTab = (idx: number, field: string, val: string) => {
    const newAccordions = [...(formData.accordions || [])];
    newAccordions[idx] = { ...newAccordions[idx], [field]: val };
    setFormData({ ...formData, accordions: newAccordions });
  };

  const moveAccordionTabUp = (idx: number) => {
    if (idx === 0) return;
    setFormData((prev: any) => {
      const next = [...(prev.accordions || [])];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return { ...prev, accordions: next };
    });
    setExpandedTab(idx - 1);
  };

  const moveAccordionTabDown = (idx: number) => {
    setFormData((prev: any) => {
      const next = [...(prev.accordions || [])];
      if (idx === next.length - 1) return prev;
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return { ...prev, accordions: next };
    });
    setExpandedTab(idx + 1);
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
        {/* 1. Basic Info & Tags */}
        <FieldGroup title="Basic Info & Tags (Headline, Tags, Badges)">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <Label>Name</Label>
              <input
                className="field font-semibold"
                required
                value={formData.name || ''}
                onChange={e => {
                  const nameVal = e.target.value;
                  const newFormData = { ...formData, name: nameVal };
                  newFormData.slug = nameVal
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_]+/g, '-')
                    .replace(/-+/g, '-');
                  setFormData(newFormData);
                }}
              />
            </label>
            <label className="grid gap-1">
              <Label>Tagline</Label>
              <input className="field" required value={formData.tagline || ''} onChange={e => setFormData({...formData, tagline: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Categories (Top Headline Tags)</Label>
              <input className="field" placeholder="e.g. Wellness, Kids" value={(formData.categories || []).join(', ')} onChange={e => setFormData({...formData, categories: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
            </label>
            <label className="grid gap-1">
              <Label>Badges (Best Seller / New Arrival)</Label>
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
              <Label>Goals</Label>
              <input className="field" placeholder="e.g. Sleep, Energy" value={(formData.goals || []).join(', ')} onChange={e => setFormData({...formData, goals: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
            </label>
            <label className="grid gap-1">
              <Label>URL Slug</Label>
              <input className="field text-muted-foreground" required value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </label>
          </div>
        </FieldGroup>

        {/* 2. Product Images */}
        <FieldGroup title="Product Images & Gallery (Displays on Left)">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-3 items-start">
              {imagesList.map((imgUrl, i) => (
                <div key={i} className={cn(
                  "relative group flex flex-col items-center gap-1 p-1 rounded-lg border transition-all bg-card shadow-sm",
                  i === 0 ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-muted-foreground/30"
                )}>
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border border-border">
                    <img src={imgUrl} className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-0.5 left-0.5 right-0.5 text-center bg-primary/95 text-primary-foreground text-[8px] font-bold py-0.5 rounded uppercase tracking-wider shadow">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive/90"
                      title="Delete Image"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
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

        {/* 3. Pricing & Specs */}
        <FieldGroup title="Pricing & Variant Specs (Price, Pack Size, Flavour, etc.)">
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
              <Label>Pack Size (e.g. 60 Gummies)</Label>
              <input className="field" required value={formData.count || ''} onChange={e => setFormData({...formData, count: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Flavour</Label>
              <input className="field" required value={formData.flavour || ''} onChange={e => setFormData({...formData, flavour: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Format</Label>
              <input className="field" value={formData.format || ''} placeholder="e.g. Pectin Gummy" onChange={e => setFormData({...formData, format: e.target.value})} />
            </label>
            <label className="grid gap-1">
              <Label>Flavour Token (Color Indicator)</Label>
              <input className="field" required value={formData.flavourToken || ''} onChange={e => setFormData({...formData, flavourToken: e.target.value})} />
            </label>
          </div>
        </FieldGroup>

        {/* Trust Badges */}
        <FieldGroup title="Trust Badges (Displays under pricing)">
          <div className="grid gap-3 sm:grid-cols-3">
            {(formData.trust_badges || []).map((badge: any, i: number) => (
              <div key={i} className="rounded-lg border border-border p-3 bg-muted/20 space-y-2 relative">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-display">Badge {i + 1}</span>
                <label className="grid gap-1">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">Icon</span>
                  <select
                    className="field font-sans"
                    value={badge.icon || "ShieldCheck"}
                    onChange={e => {
                      const next = [...(formData.trust_badges || [])];
                      next[i] = { ...next[i], icon: e.target.value };
                      setFormData({ ...formData, trust_badges: next });
                    }}
                  >
                    <option value="Truck">Truck (Delivery)</option>
                    <option value="ShieldCheck">Shield Check (Tested)</option>
                    <option value="Undo2">Undo Arrow (Returns)</option>
                    <option value="Heart">Heart</option>
                    <option value="ShoppingBag">Shopping Bag</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[9px] font-bold uppercase text-muted-foreground font-sans">Text</span>
                  <input
                    className="field"
                    value={badge.text || ""}
                    onChange={e => {
                      const next = [...(formData.trust_badges || [])];
                      next[i] = { ...next[i], text: e.target.value };
                      setFormData({ ...formData, trust_badges: next });
                    }}
                    placeholder="e.g. Free shipping above ₹499"
                  />
                </label>
              </div>
            ))}
          </div>
        </FieldGroup>

        {/* 4. Description */}
        <FieldGroup title="Product Description">
          <label className="grid gap-1">
            <Label>Main Description Text</Label>
            <textarea className="field min-h-[100px]" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </label>
        </FieldGroup>

        {/* 5. Accordion Tabs */}
        <FieldGroup title="Accordion Tabs (Details)">
          <div className="space-y-3">
            {(formData.accordions || []).map((acc: any, i: number) => {
              const isExpanded = expandedTab === i;
              return (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-sm">
                  {/* Collapsible Header */}
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-3 select-none">
                    <button
                      type="button"
                      onClick={() => setExpandedTab(isExpanded ? null : i)}
                      className="flex items-center gap-3 text-left font-display text-sm font-bold text-ink hover:opacity-80 transition-opacity"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <span>{acc.title || `Untitled Tab ${i + 1}`}</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveAccordionTabUp(i)}
                        disabled={i === 0}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveAccordionTabDown(i)}
                        disabled={i === (formData.accordions || []).length - 1}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeAccordionTab(i)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors ml-1"
                        title="Delete Tab"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Body */}
                  {isExpanded && (
                    <div className="p-4 border-t border-border bg-muted/10 space-y-3 animate-in fade-in duration-200">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="grid gap-1 sm:col-span-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tab Title</span>
                          <input
                            className="field font-bold text-ink"
                            placeholder="e.g. Warnings"
                            value={acc.title || ''}
                            onChange={e => updateAccordionTab(i, 'title', e.target.value)}
                          />
                        </label>
                        <label className="grid gap-1 sm:col-span-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tab Content</span>
                          <textarea
                            className="field min-h-[120px]"
                            placeholder="Type tab content here (supports line breaks)..."
                            value={acc.content || ''}
                            onChange={e => updateAccordionTab(i, 'content', e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {!(formData.accordions || []).length && (
              <div className="text-xs text-muted-foreground py-2">No accordion tabs added yet. Click below to add one.</div>
            )}

            <button
              type="button"
              onClick={() => {
                addAccordionTab();
                setExpandedTab((formData.accordions || []).length);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 shrink-0" /> Add Accordion Tab
            </button>
          </div>
        </FieldGroup>

        {/* 6. Related Products */}
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

        {/* 7. Combo Products */}
        <FieldGroup title="Combo Products (Bundle Included Items)">
          <div className="grid gap-3">
            <select
              className="field"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const cp = formData.combo_products || [];
                if (!cp.includes(val)) {
                  setFormData({ ...formData, combo_products: [...cp, val] });
                }
              }}
            >
              <option value="">+ Add a combo product item...</option>
              {allProducts
                .filter(p => p.slug !== product.slug)
                .filter(p => !(formData.combo_products || []).includes(p.slug))
                .map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
            </select>
            
            <div className="flex flex-wrap gap-2">
              {(formData.combo_products || []).map((slug: string) => {
                const p = allProducts.find(prod => prod.slug === slug);
                if (!p) return null;
                return (
                  <div key={slug} className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2.5 pr-1.5 shadow-sm">
                    {p.image && <img src={p.image} className="h-5 w-5 rounded-full object-cover shrink-0" />}
                    <span className="text-sm font-semibold">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cp = formData.combo_products || [];
                        setFormData({ ...formData, combo_products: cp.filter((s: string) => s !== slug) });
                      }}
                      className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
              {!(formData.combo_products || []).length && (
                <div className="text-xs text-muted-foreground">Not a combo/bundle product (No items selected).</div>
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
