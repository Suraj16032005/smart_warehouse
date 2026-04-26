import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from "@/lib/queries";
import { Product } from "@/lib/api/productApi";

const Products = () => {
  const { data: items = [], isLoading } = useProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", description: "", unit: "pcs" });
  const [busy, setBusy] = useState(false);

  const openNew = () => { setEditing(null); setForm({ name: "", sku: "", category: "", description: "", unit: "pcs" }); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, sku: (p as any).sku ?? "", category: p.category ?? "", description: p.description ?? "", unit: (p as any).unit ?? "pcs" }); setOpen(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: form });
        toast.success("Product updated");
      } else {
        await addProduct.mutateAsync(form);
        toast.success("Product added");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!delId) return;
    try {
      await deleteProduct.mutateAsync(delId);
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setDelId(null);
    }
  };

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.sku ?? "").toLowerCase().includes(q.toLowerCase()) ||
    (p.category ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="bg-blueprint min-h-full">
        <div className="p-6 md:p-10 space-y-6 max-w-[1600px]">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-2">// CATALOG</div>
              <h1 className="font-display text-4xl md:text-5xl font-black">Products</h1>
            </div>
            <Button onClick={openNew} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase">
              <Plus className="w-4 h-4 mr-2" /> Add product
            </Button>
          </div>

          <div className="bg-card border border-foreground/15">
            <div className="p-4 border-b border-foreground/10 flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, SKU, category…"
                className="rounded-none border-0 focus-visible:ring-0 h-8 bg-transparent" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">{filtered.length} items</span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-2">// EMPTY</div>
                <div className="font-display text-2xl font-black">No products yet</div>
                <p className="text-muted-foreground mt-2 text-sm">Add your first product to start tracking.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-paper-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">SKU</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Unit</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-t border-foreground/10 hover:bg-paper-2/50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-sm">{p.category || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="icon" variant="ghost" className="rounded-none h-8 w-8" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-none h-8 w-8 hover:text-destructive" onClick={() => setDelId(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none bg-card border-foreground/30 max-w-md">
          <DialogHeader>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">// {editing ? "EDIT" : "NEW"}</div>
            <DialogTitle className="font-display text-2xl font-black">{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required maxLength={120}
                className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">SKU</Label>
                <Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} maxLength={40}
                  className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Unit</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} maxLength={20}
                  className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Category</Label>
              <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} maxLength={60}
                className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} rows={3}
                className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none">Cancel</Button>
              <Button type="submit" disabled={busy} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase">
                {busy ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={o => !o && setDelId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the product and its inventory record. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-none bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Products;
