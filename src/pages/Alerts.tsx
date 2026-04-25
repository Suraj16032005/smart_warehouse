import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockStore, useMockStore } from "@/lib/mockStore";

const Alerts = () => {
  const alerts = useMockStore(s => s.listAlerts());
  const [tab, setTab] = useState<"open" | "resolved">("open");

  const resolve = (id: string) => {
    mockStore.resolveAlert(id);
    toast.success("Marked resolved");
  };

  const list = alerts.filter(a => tab === "open" ? !a.resolved : a.resolved);

  return (
    <AppLayout>
      <div className="bg-blueprint min-h-full">
        <div className="p-6 md:p-10 space-y-6 max-w-[1200px]">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-2">// SIGNAL LOG</div>
              <h1 className="font-display text-4xl md:text-5xl font-black">Alerts</h1>
            </div>
            <div className="flex border border-foreground/20 font-mono text-[10px] tracking-[0.2em] uppercase">
              {(["open", "resolved"] as const).map(k => (
                <button key={k} onClick={() => setTab(k)}
                  className={cn("px-4 py-2 transition-colors", tab === k ? "bg-foreground text-background" : "hover:bg-paper-2")}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="bg-card border border-foreground/15 py-20 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-4" strokeWidth={1.5} />
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-2">// CLEAR</div>
              <div className="font-display text-2xl font-black">{tab === "open" ? "No open alerts" : "No resolved alerts"}</div>
              <p className="text-muted-foreground mt-2 text-sm">{tab === "open" ? "Your warehouse is operating normally." : "Resolved alerts will appear here."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map(a => {
                const critical = a.severity === "critical";
                return (
                  <div key={a.id} className={cn(
                    "bg-card border-l-4 border border-foreground/15 p-5 flex items-start gap-4 group transition-all",
                    critical ? "border-l-destructive" : "border-l-warning",
                  )}>
                    <div className={cn("p-2 mt-0.5", critical ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground")}>
                      <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn("font-mono text-[10px] tracking-[0.2em] uppercase px-1.5 py-0.5",
                          critical ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground")}>
                          {a.severity}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(a.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{a.message}</p>
                    </div>
                    {!a.resolved && (
                      <Button onClick={() => resolve(a.id)} variant="outline"
                        className="rounded-none border-foreground/30 font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-foreground hover:text-background">
                        Mark resolved
                      </Button>
                    )}
                    {a.resolved && (
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Alerts;
