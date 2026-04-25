import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/BlueprintMark";

const schema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.success("Welcome back");
      nav("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-blueprint">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-foreground text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-dark opacity-100" />
        <div className="relative z-10">
          <Logo invert />
        </div>
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="font-mono text-[10px] tracking-[0.3em] text-primary-foreground/60">SECTION 01 / ACCESS</div>
          <h1 className="font-display text-5xl font-black leading-[0.95] text-balance">
            Track every <span className="italic font-medium">unit</span>.
            <br />Prevent every <span className="italic font-medium text-accent">loss</span>.
          </h1>
          <p className="text-primary-foreground/70 max-w-sm">A precision inventory system designed for warehouse operators who do not have time to guess.</p>
        </div>
        <div className="relative z-10 font-mono text-[10px] tracking-[0.2em] text-primary-foreground/50 flex justify-between">
          <span>REV. 2026.04</span>
          <span>SHEET 01 / 04</span>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 lg:px-16 py-12">
        <div className="lg:hidden mb-10"><Logo /></div>
        <div className="max-w-sm w-full mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">// LOG IN</div>
          <h2 className="font-display text-4xl font-black mb-2">Sign in</h2>
          <p className="text-muted-foreground mb-8 text-sm">Access your control panel.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-mono text-[10px] tracking-[0.2em] uppercase">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.2em] uppercase">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary bg-card pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={busy} className="w-full h-11 rounded-none bg-foreground hover:bg-foreground/90 text-background font-mono text-xs tracking-[0.2em] uppercase group">
              {busy ? "Authenticating…" : <>Sign in <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-foreground font-medium underline underline-offset-4 hover:text-primary">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
