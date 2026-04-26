import { cn } from "@/lib/utils";

/** Decorative blueprint corner marks for industrial framing */
export const CornerFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative", className)}>
    <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-foreground/70" />
    <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-foreground/70" />
    <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-foreground/70" />
    <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-foreground/70" />
    {children}
  </div>
);

export const Logo = ({ className, invert }: { className?: string; invert?: boolean }) => (
  <div className={cn("flex items-center gap-2.5", className)}>
    <div className={cn(
      "relative w-8 h-8 border-2 grid place-items-center font-mono text-[10px] font-bold tracking-tighter",
      invert ? "border-primary-foreground text-primary-foreground" : "border-foreground text-foreground"
    )}>
      <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-accent" />
      CS
    </div>
    <div className="flex flex-col leading-none">
      <span className={cn("font-display font-black text-lg tracking-tight", invert && "text-primary-foreground")}>CloudStock</span>
      <span className={cn("font-mono text-[9px] tracking-[0.2em] uppercase", invert ? "text-primary-foreground/60" : "text-muted-foreground")}>Inventory · OS</span>
    </div>
  </div>
);
