import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Boxes, Package, Bell, User, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/BlueprintMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAlerts } from "@/lib/queries";
import { useAuth } from "@/lib/auth";

const nav = [
  { id: "00", to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "01", to: "/inventory", label: "Inventory", icon: Boxes },
  { id: "02", to: "/products", label: "Products", icon: Package },
  { id: "03", to: "/alerts", label: "Alerts", icon: Bell },
  { id: "04", to: "/profile", label: "Profile", icon: User },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { data: alerts = [] } = useAlerts();
  const alertCount = alerts.filter(a => a.status === 'active').length;
  
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
  };

  const current = nav.find(n => location.pathname.startsWith(n.to));

  return (
    <div className="min-h-screen flex bg-paper">
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-foreground text-primary-foreground flex flex-col transition-all duration-300 relative z-40",
        "border-r border-foreground/40",
        collapsed ? "w-16" : "w-60",
        "hidden md:flex"
      )}>
        <div className={cn("flex items-center h-16 border-b border-primary-foreground/10 shrink-0", collapsed ? "justify-center" : "px-5")}>
          {collapsed ? (
            <div className="w-8 h-8 border-2 border-primary-foreground grid place-items-center font-mono text-[10px] font-bold relative">
              <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-accent" />CS
            </div>
          ) : <Logo invert />}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {!collapsed && <div className="font-mono text-[9px] tracking-[0.3em] text-primary-foreground/50 px-2 py-2"></div>}
          {nav.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative group",
                "font-mono text-xs tracking-[0.15em] uppercase",
                isActive
                  ? "bg-primary-foreground text-foreground"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                  {!collapsed && item.to === "/alerts" && alertCount > 0 && (
                    <span className="bg-accent text-accent-foreground font-mono text-[9px] px-1.5 py-0.5">{alertCount}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-foreground/10">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-primary-foreground/60 hover:text-primary-foreground transition-colors">
            <Menu className="w-4 h-4" />
          </button>
          {!collapsed && <div className="font-mono text-[9px] tracking-[0.2em] text-primary-foreground/40 mt-2 text-center">REV 2026.04</div>}
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/60" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-foreground text-primary-foreground p-4" onClick={e => e.stopPropagation()}>
            <Logo invert />
            <nav className="mt-8 space-y-1">
              {nav.map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-[0.15em] uppercase",
                    isActive ? "bg-primary-foreground text-foreground" : "text-primary-foreground/70")}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-foreground/15 bg-paper/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground"> {current?.id ?? "00"}</div>
              <div className="font-display font-black text-lg leading-none">{current?.label ?? "Dashboard"}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Operator</div>
              <div className="text-sm font-medium">{user?.name || "Loading..."}</div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}
              className="rounded-none border-foreground/30 hover:bg-foreground hover:text-background font-mono text-[10px] tracking-[0.2em] uppercase">
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
