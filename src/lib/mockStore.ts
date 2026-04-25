// Lightweight in-memory mock store for UI-only mode.
// State persists for the session only (no backend, no localStorage).

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  unit: string | null;
  created_at: string;
};

export type InventoryRow = {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  location: string | null;
  updated_at: string;
};

export type Alert = {
  id: string;
  product_id: string | null;
  message: string;
  severity: "warning" | "critical";
  resolved: boolean;
  created_at: string;
};

const uid = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();

const seedProducts: Product[] = [
  { id: uid(), name: "Industrial Bearing 6204", sku: "BRG-6204", category: "Hardware", description: "Sealed deep-groove ball bearing.", unit: "pcs", created_at: now() },
  { id: uid(), name: "Hex Bolt M10 × 40mm", sku: "BLT-M10-40", category: "Fasteners", description: "Galvanized hex bolt.", unit: "pcs", created_at: now() },
  { id: uid(), name: "PVC Conduit 25mm", sku: "CND-PVC-25", category: "Electrical", description: "3m grey conduit length.", unit: "m", created_at: now() },
  { id: uid(), name: "Safety Helmet Type-1", sku: "PPE-HLM-01", category: "Safety", description: "EN 397 certified hard hat.", unit: "pcs", created_at: now() },
  { id: uid(), name: "Cable Tie 200mm", sku: "TIE-200", category: "Accessories", description: "UV-resistant nylon ties.", unit: "pcs", created_at: now() },
];

const seedInventory: InventoryRow[] = [
  { id: uid(), product_id: seedProducts[0].id, quantity: 142, low_stock_threshold: 20, location: "Aisle A1 / Shelf 2", updated_at: now() },
  { id: uid(), product_id: seedProducts[1].id, quantity: 8, low_stock_threshold: 50, location: "Aisle B3 / Bin 4", updated_at: now() },
  { id: uid(), product_id: seedProducts[2].id, quantity: 36, low_stock_threshold: 10, location: "Aisle C2 / Rack 1", updated_at: now() },
  { id: uid(), product_id: seedProducts[3].id, quantity: 0, low_stock_threshold: 15, location: "Aisle D1 / Shelf 1", updated_at: now() },
  { id: uid(), product_id: seedProducts[4].id, quantity: 540, low_stock_threshold: 100, location: "Aisle E1 / Bin 7", updated_at: now() },
];

const seedAlerts: Alert[] = [
  { id: uid(), product_id: seedProducts[1].id, message: "Hex Bolt M10 × 40mm is low on stock (8 left)", severity: "warning", resolved: false, created_at: now() },
  { id: uid(), product_id: seedProducts[3].id, message: "Safety Helmet Type-1 is out of stock", severity: "critical", resolved: false, created_at: now() },
];

type State = {
  products: Product[];
  inventory: InventoryRow[];
  alerts: Alert[];
  user: { name: string; email: string };
};

const state: State = {
  products: [...seedProducts],
  inventory: [...seedInventory],
  alerts: [...seedAlerts],
  user: { name: "Operator", email: "operator@cloudstock.app" },
};

const listeners = new Set<() => void>();

// Cached snapshots — must return the SAME reference until data mutates,
// otherwise useSyncExternalStore will loop infinitely.
let productsSnap: Product[] = [...state.products].sort((a, b) => b.created_at.localeCompare(a.created_at));
let inventorySnap: InventoryRow[] = [...state.inventory].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
let alertsSnap: Alert[] = [...state.alerts].sort((a, b) => b.created_at.localeCompare(a.created_at));
let userSnap = { ...state.user };
let openAlertCountSnap = state.alerts.filter(a => !a.resolved).length;

const refresh = () => {
  productsSnap = [...state.products].sort((a, b) => b.created_at.localeCompare(a.created_at));
  inventorySnap = [...state.inventory].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  alertsSnap = [...state.alerts].sort((a, b) => b.created_at.localeCompare(a.created_at));
  userSnap = { ...state.user };
  openAlertCountSnap = state.alerts.filter(a => !a.resolved).length;
};

const notify = () => { refresh(); listeners.forEach(l => l()); };

export const mockStore = {
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },

  // Products
  listProducts(): Product[] { return productsSnap; },
  getProduct(id: string) { return state.products.find(p => p.id === id) ?? null; },
  addProduct(input: Omit<Product, "id" | "created_at">) {
    const p: Product = { ...input, id: uid(), created_at: now() };
    state.products.unshift(p);
    state.inventory.push({ id: uid(), product_id: p.id, quantity: 0, low_stock_threshold: 10, location: null, updated_at: now() });
    notify();
    return p;
  },
  updateProduct(id: string, patch: Partial<Product>) {
    const i = state.products.findIndex(p => p.id === id);
    if (i >= 0) { state.products[i] = { ...state.products[i], ...patch }; notify(); }
  },
  deleteProduct(id: string) {
    state.products = state.products.filter(p => p.id !== id);
    state.inventory = state.inventory.filter(r => r.product_id !== id);
    notify();
  },

  // Inventory
  listInventory(): InventoryRow[] { return inventorySnap; },
  upsertInventory(input: { product_id: string; quantity: number; low_stock_threshold: number; location: string }) {
    const existing = state.inventory.find(r => r.product_id === input.product_id);
    if (existing) {
      existing.quantity = input.quantity;
      existing.low_stock_threshold = input.low_stock_threshold;
      existing.location = input.location || null;
      existing.updated_at = now();
    } else {
      state.inventory.push({ id: uid(), ...input, location: input.location || null, updated_at: now() });
    }
    maybeAlert(input.product_id, input.quantity, input.low_stock_threshold);
    notify();
  },
  updateInventory(id: string, patch: { quantity: number; low_stock_threshold: number; location: string }) {
    const r = state.inventory.find(x => x.id === id);
    if (!r) return;
    r.quantity = patch.quantity;
    r.low_stock_threshold = patch.low_stock_threshold;
    r.location = patch.location || null;
    r.updated_at = now();
    maybeAlert(r.product_id, r.quantity, r.low_stock_threshold);
    notify();
  },
  deleteInventory(id: string) {
    state.inventory = state.inventory.filter(r => r.id !== id);
    notify();
  },

  // Alerts
  listAlerts(): Alert[] { return alertsSnap; },
  resolveAlert(id: string) {
    const a = state.alerts.find(x => x.id === id);
    if (a) { a.resolved = true; notify(); }
  },
  openAlertCount() { return openAlertCountSnap; },

  // User
  getUser() { return userSnap; },
  updateUser(patch: Partial<{ name: string; email: string }>) {
    state.user = { ...state.user, ...patch };
    notify();
  },
};

function maybeAlert(product_id: string, qty: number, threshold: number) {
  if (qty > threshold) return;
  const product = state.products.find(p => p.id === product_id);
  const name = product?.name ?? "Product";
  state.alerts.unshift({
    id: uid(),
    product_id,
    message: qty === 0 ? `${name} is out of stock` : `${name} is low on stock (${qty} left)`,
    severity: qty === 0 ? "critical" : "warning",
    resolved: false,
    created_at: now(),
  });
}

import { useSyncExternalStore } from "react";
export function useMockStore<T>(selector: (s: typeof mockStore) => T): T {
  return useSyncExternalStore(
    (cb) => mockStore.subscribe(cb),
    () => selector(mockStore),
    () => selector(mockStore),
  );
}
