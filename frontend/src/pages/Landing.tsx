import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Bell, BarChart3, Github } from "lucide-react";
import { Logo } from "@/components/BlueprintMark";
import { Button } from "@/components/ui/button";

const features = [
  { id: "01", icon: Boxes, title: "Real-time tracking", body: "Every SKU. Every location. Updated the moment a unit moves." },
  { id: "02", icon: Bell, title: "Low-stock alerts", body: "Triggers fire automatically when inventory dips below your threshold." },
  { id: "03", icon: BarChart3, title: "Operational insight", body: "Dashboards built for warehouse managers, not data scientists." },
];

const Landing = () => (
  <div className="min-h-screen bg-blueprint">
    {/* NAV */}
    <nav className="border-b border-foreground/10 backdrop-blur-sm bg-paper/80 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login"><Button variant="ghost" className="rounded-none font-mono text-xs tracking-[0.2em] uppercase">Sign in</Button></Link>
          <Link to="/register"><Button className="rounded-none font-mono text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90">Register</Button></Link>
        </div>
      </div>
    </nav>

    {/* HERO */}
    <section className="container py-20 lg:py-28 relative">
      <div className="grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-7 space-y-8">
          <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground flex items-center gap-3">
            <span className="w-8 h-px bg-foreground/40" />
            CLOUDSTOCK / INVENTORY OS / V1
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tight text-balance">
            Track inventory.
            <br />
            <span className="italic font-medium">Prevent</span> loss.
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            A blueprint-precise inventory system. Built for the warehouse floor — quick to scan, hard to mis-read, impossible to ignore.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="rounded-none h-12 px-6 font-mono text-xs tracking-[0.2em] uppercase bg-foreground text-background hover:bg-foreground/90 group">
                Get started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="rounded-none h-12 px-6 font-mono text-xs tracking-[0.2em] uppercase border-foreground/30 hover:bg-foreground hover:text-background">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Schematic illustration */}
        <div className="lg:col-span-5 relative">
          <div className="aspect-square border border-foreground/30 bg-card relative p-6 shadow-blueprint">
            <span className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-foreground" />
            <span className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-foreground" />
            <span className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-foreground" />
            <span className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-foreground" />

            <div className="absolute top-2 left-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground">FIG.01 — WAREHOUSE SCHEMA</div>
            <div className="absolute bottom-2 right-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground">SCALE 1:1</div>

            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* grid */}
              {Array.from({ length: 20 }).map((_, i) => (
                <g key={i}>
                  <line x1={i * 20} y1="0" x2={i * 20} y2="400" stroke="hsl(var(--foreground))" strokeOpacity="0.06" />
                  <line x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="hsl(var(--foreground))" strokeOpacity="0.06" />
                </g>
              ))}
              {/* shelves */}
              {[60, 140, 220, 300].map((y, i) => (
                <g key={y}>
                  <rect x="40" y={y} width="320" height="40" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  {Array.from({ length: 8 }).map((_, j) => (
                    <rect key={j} x={48 + j * 38} y={y + 6} width="32" height="28"
                      fill={i === 1 && j > 4 ? "hsl(var(--accent))" : i === 2 && j === 2 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                      fillOpacity={i === 1 && j > 4 ? "0.85" : i === 2 && j === 2 ? "0.85" : "0.15"}
                      stroke="hsl(var(--foreground))" strokeWidth="0.8" />
                  ))}
                  <text x="20" y={y + 26} fontFamily="JetBrains Mono" fontSize="9" fill="hsl(var(--muted-foreground))">A{i+1}</text>
                </g>
              ))}
              {/* dimension */}
              <line x1="40" y1="370" x2="360" y2="370" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
              <line x1="40" y1="365" x2="40" y2="375" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
              <line x1="360" y1="365" x2="360" y2="375" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
              <text x="200" y="385" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="hsl(var(--muted-foreground))">320 UNITS</text>
            </svg>
          </div>
          <div className="mt-3 flex items-center gap-4 font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary/30 border border-foreground/40" />stock</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-accent" />moving</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-destructive" />low</span>
          </div>
        </div>
      </div>
    </section>

    {/* TICKER */}
    <div className="border-y border-foreground/20 bg-foreground text-background py-3 overflow-hidden">
      <div className="flex gap-12 font-mono text-xs tracking-[0.3em] uppercase whitespace-nowrap animate-[marquee_30s_linear_infinite]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-12 shrink-0">
            <span>★ Real-time stock sync</span>
            <span>★ Threshold-based alerts</span>
            <span>★ Multi-location ready</span>
            <span>★ Built for warehouse floors</span>
          </div>
        ))}
      </div>
    </div>

    {/* FEATURES */}
    <section className="container py-24">
      <div className="grid lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-4">
          <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-3">CAPABILITIES</div>
          <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">Engineered for the floor.</h2>
        </div>
        <p className="lg:col-span-7 lg:col-start-6 text-lg text-muted-foreground leading-relaxed">
          Every feature is built from one principle: a warehouse manager should understand the state of their inventory in three seconds or less.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-foreground/15 border border-foreground/15">
        {features.map(f => (
          <div key={f.id} className="bg-card p-8 group hover:bg-paper-2 transition-colors">
            <div className="flex items-start justify-between mb-8">
              <f.icon className="w-7 h-7 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">FIG.{f.id}</span>
            </div>
            <h3 className="font-display text-2xl font-black mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container pb-24">
      <div className="bg-foreground text-background p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-dark opacity-60" />
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-background/60 mb-4">READY?</div>
            <h2 className="font-display text-4xl md:text-5xl font-black leading-tight">
              Start tracking in <span className="italic font-medium text-accent">three minutes</span>.
            </h2>
          </div>
          <div className="flex lg:justify-end">
            <Link to="/register">
              <Button size="lg" className="rounded-none h-14 px-8 bg-background text-foreground hover:bg-accent hover:text-foreground font-mono text-xs tracking-[0.2em] uppercase group">
                Create free account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="border-t border-foreground/10 bg-paper-2">
      <div className="container py-10 grid md:grid-cols-3 gap-8 items-start">
        <Logo />
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <div className="text-foreground tracking-[0.2em] uppercase mb-2">Project Team</div>
          <div>Lead · Engineering</div>
          <div>UX · HMI Design</div>
          <div>Backend · Cloud Systems</div>
        </div>
        <div className="md:text-right space-y-3">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase text-foreground hover:text-primary">
            <Github className="w-4 h-4" /> GitHub
          </a>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">© 2026 CloudStock · v1.0</div>
        </div>
      </div>
    </footer>

    <style>{`
      @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    `}</style>
  </div>
);

export default Landing;
