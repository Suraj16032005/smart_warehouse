import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useInventory, useProducts, useAddInventory, useUpdateInventory, useDeleteInventory } from "@/lib/queries";
import { InventoryRow } from "@/lib/api/inventoryApi";

const Inventory = () => {
  const { data: rows = [], isLoading } = useInventory();
  const { data: products = [] } = useProducts();
  const addInventory = useAddInventory();
  const updateInventory = useUpdateInventory();
  const deleteInventory = useDeleteInventory();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "low">("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryRow | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [form, setForm] = useState({ product_id: "", quantity: 0 });
  const [busy, setBusy] = useState(false);

  const productMap = new Map(products.map(p => [p.id, p]));

  const openNew = () => {
    setEditing(null);
    setForm({ product_id: "", quantity: 0 });
    setOpen(true);
  };
  const openEdit = (r: InventoryRow) => {
    setEditing(r);
    setForm({ product_id: r.product_id.toString(), quantity: r.quantity });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) { toast.error("Select a product"); return; }
    setBusy(true);
    try {
      if (editing) {
        await updateInventory.mutateAsync({ id: editing.id, data: { quantity: form.quantity } });
        toast.success("Inventory updated");
      } else {
        await addInventory.mutateAsync({ product_id: parseInt(form.product_id), quantity: form.quantity });
        toast.success("Inventory saved");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save inventory");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!delId) return;
    try {
      await deleteInventory.mutateAsync(delId);
      toast.success("Removed");
    } catch (error) {
      toast.error("Failed to delete inventory");
    } finally {
      setDelId(null);
    }
  };

  const filtered = rows.filter(r => {
    const prod = productMap.get(r.product_id);
    const name = prod?.name ?? "";
    if (q && !name.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === "low" && r.quantity >= 10) return false;
    if (filter === "in" && r.quantity < 10) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="bg-blueprint min-h-full">
        <div className="p-6 md:p-10 space-y-6 max-w-[1600px]">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-2">// STOCK LEVELS</div>
              <h1 className="font-display text-4xl md:text-5xl font-black">Inventory</h1>
            </div>
            <Button onClick={openNew} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase">
              <Plus className="w-4 h-4 mr-2" /> Add stock
            </Button>
          </div>

          <div className="bg-card border border-foreground/15">
            <div className="p-4 border-b border-foreground/10 flex items-center gap-3 flex-wrap">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search product…"
                className="rounded-none border-0 focus-visible:ring-0 h-8 bg-transparent flex-1 min-w-[200px]" />
              <div className="flex border border-foreground/20 font-mono text-[10px] tracking-[0.2em] uppercase">
                {(["all", "in", "low"] as const).map(k => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={cn("px-3 py-1.5 transition-colors", filter === k ? "bg-foreground text-background" : "hover:bg-paper-2")}>
                    {k === "all" ? "All" : k === "in" ? "In stock" : "Low stock"}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-2">// EMPTY</div>
                <div className="font-display text-2xl font-black">No items found</div>
                <p className="text-muted-foreground mt-2 text-sm">Add stock to a product to see it here.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-paper-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Quantity</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Updated</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => {
                    const prod = productMap.get(r.product_id);
                    const low = r.quantity < 10;
                    const out = r.quantity === 0;
                    return (
                      <tr key={r.id} className="border-t border-foreground/10 hover:bg-paper-2/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{prod?.name ?? "—"}</div>
                          {prod && (prod as any).sku && <div className="font-mono text-[10px] text-muted-foreground">{(prod as any).sku}</div>}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="text-lg font-bold">{r.quantity}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">/ 10</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] tracking-[0.15em] uppercase",
                            out ? "bg-destructive text-destructive-foreground" :
                            low ? "bg-warning text-warning-foreground" :
                            "bg-success text-success-foreground"
                          )}>
                            <span className="w-1.5 h-1.5 bg-current rounded-full" />
                            {out ? "Out" : low ? "Low" : "In stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{new Date(r.last_updated || new Date()).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="icon" variant="ghost" className="rounded-none h-8 w-8" onClick={() => openEdit(r)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="rounded-none h-8 w-8 hover:text-destructive" onClick={() => setDelId(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
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
            <DialogTitle className="font-display text-2xl font-black">{editing ? "Adjust stock" : "Add stock"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Product *</Label>
              <Select value={form.product_id} onValueChange={v => setForm({ ...form, product_id: v })} disabled={!!editing}>
                <SelectTrigger className="rounded-none border-foreground/30"><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent className="rounded-none">
                  {products.length === 0 && <div className="p-2 text-xs text-muted-foreground">No products. Create one first.</div>}
                  {products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Quantity</Label>
              <Input type="number" min={0} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary font-mono" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-none">Cancel</Button>
              <Button type="submit" disabled={busy} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase">
                {busy ? "Saving…" : editing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delId} onOpenChange={o => !o && setDelId(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove this stock entry?</AlertDialogTitle>
            <AlertDialogDescription>The product remains in your catalog.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="rounded-none bg-destructive">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Inventory;
