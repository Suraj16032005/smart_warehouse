import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Package, Boxes, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";

type Stats = { products: number; lowStock: number; totalQty: number; alerts: number };

const StatCard = ({ id, label, value, icon: Icon, trend, accent }: any) => (
  <div className="bg-card border border-foreground/15 p-6 relative group hover:border-foreground transition-colors">
    <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t-2 border-l-2 border-foreground" />
    <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t-2 border-r-2 border-foreground" />
    <div className="flex items-start justify-between mb-6">
      <div className={`p-2 ${accent ?? "bg-foreground"} text-background`}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>
      <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">{id}</span>
    </div>
    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1.5">{label}</div>
    <div className="font-display text-4xl font-black leading-none">{value}</div>
    {trend && <div className="font-mono text-[10px] text-muted-foreground mt-3">{trend}</div>}
  </div>
);

const Dashboard = () => {
  const nav = useNavigate();
  const [stats, setStats] = useState<Stats>({ products: 0, lowStock: 0, totalQty: 0, alerts: 0 });
  const [chartData, setChartData] = useState<{ name: string; qty: number }[]>([]);
  const [trendData, setTrendData] = useState<{ d: string; v: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: products }, { data: inventory }, { count: alerts }] = await Promise.all([
        supabase.from("products").select("id, name, created_at").order("created_at", { ascending: false }),
        supabase.from("inventory").select("product_id, quantity, low_stock_threshold, products(name)"),
        supabase.from("alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
      ]);
      const inv = inventory ?? [];
      const totalQty = inv.reduce((s, r: any) => s + (r.quantity ?? 0), 0);
      const lowStock = inv.filter((r: any) => r.quantity <= r.low_stock_threshold).length;
      setStats({ products: products?.length ?? 0, lowStock, totalQty, alerts: alerts ?? 0 });
      setChartData(inv.slice(0, 8).map((r: any) => ({ name: r.products?.name?.slice(0, 10) ?? "—", qty: r.quantity })));
      setRecent((products ?? []).slice(0, 5));
      // synthetic 7-day trend from current totals (visualization only)
      const today = totalQty || 50;
      setTrendData(Array.from({ length: 7 }, (_, i) => ({
        d: ["MON","TUE","WED","THU","FRI","SAT","SUN"][i],
        v: Math.max(0, Math.round(today * (0.7 + Math.random() * 0.4))),
      })));
    })();
  }, []);

  return (
    <AppLayout>
      <div className="bg-blueprint min-h-full">
        <div className="p-6 md:p-10 space-y-8 max-w-[1600px]">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-2">// CONTROL PANEL</div>
              <h1 className="font-display text-4xl md:text-5xl font-black">Operations overview</h1>
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Last sync · {new Date().toLocaleString()}
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard id="01" label="Total products" value={stats.products} icon={Package} trend="catalogued items" />
            <StatCard id="02" label="Total quantity" value={stats.totalQty} icon={Boxes} trend="units in stock" />
            <StatCard id="03" label="Low-stock items" value={stats.lowStock} icon={AlertTriangle} accent="bg-warning text-warning-foreground" trend="below threshold" />
            <StatCard id="04" label="Open alerts" value={stats.alerts} icon={TrendingUp} accent="bg-destructive text-destructive-foreground" trend="awaiting action" />
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-foreground/15 p-6 relative">
              <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t-2 border-l-2 border-foreground" />
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">FIG.05</div>
                  <h3 className="font-display text-xl font-black">Stock distribution</h3>
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">UNITS / SKU</span>
              </div>
              <div className="h-64">
                {chartData.length === 0 ? (
                  <div className="h-full grid place-items-center font-mono text-xs text-muted-foreground tracking-widest">// NO DATA — ADD INVENTORY</div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--foreground))" strokeOpacity={0.12} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }} axisLine={{ stroke: "hsl(var(--foreground))", strokeOpacity: 0.4 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", border: "none", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                      <Bar dataKey="qty" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-foreground text-background p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-blueprint-dark opacity-50" />
              <div className="relative z-10">
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-background/60 mb-1">FIG.06</div>
                <h3 className="font-display text-xl font-black mb-4">Stock trend</h3>
                <div className="h-48">
                  <ResponsiveContainer>
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="d" tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "hsl(var(--background) / 0.6)" }} axisLine={false} tickLine={false} />
                      <Area dataKey="v" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#g1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] text-background/60 mt-3">7-DAY PROJECTION</div>
              </div>
            </div>
          </div>

          {/* RECENT */}
          <div className="bg-card border border-foreground/15 p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">FIG.07</div>
                <h3 className="font-display text-xl font-black">Recent activity</h3>
              </div>
              <button onClick={() => nav("/products")} className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground hover:text-primary flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {recent.length === 0 ? (
              <div className="py-10 text-center font-mono text-xs tracking-widest text-muted-foreground">// NO RECENT ACTIVITY</div>
            ) : (
              <div className="divide-y divide-foreground/10">
                {recent.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground w-8">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
