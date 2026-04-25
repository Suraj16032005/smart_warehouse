import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/BlueprintMark";
import { mockStore } from "@/lib/mockStore";

const schema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

const Register = () => {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    setTimeout(() => {
      mockStore.updateUser({ name: parsed.data.name, email: parsed.data.email });
      setBusy(false);
      toast.success("Account created");
      nav("/dashboard");
    }, 400);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-blueprint">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-foreground text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint-dark" />
        <div className="relative z-10"><Logo invert /></div>
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="font-mono text-[10px] tracking-[0.3em] text-primary-foreground/60">SECTION 02 / ENROLL</div>
          <h1 className="font-display text-5xl font-black leading-[0.95]">
            Build your <span className="italic font-medium text-accent">warehouse</span><br />
            on solid ground.
          </h1>
          <p className="text-primary-foreground/70 text-sm max-w-sm">Three minutes to set up. Lifetime of saved revenue.</p>
        </div>
        <div className="relative z-10 font-mono text-[10px] tracking-[0.2em] text-primary-foreground/50 flex justify-between">
          <span>REV. 2026.04</span><span>SHEET 02 / 04</span>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 lg:px-16 py-12">
        <div className="lg:hidden mb-10"><Logo /></div>
        <div className="max-w-sm w-full mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">// REGISTER</div>
          <h2 className="font-display text-4xl font-black mb-2">Create account</h2>
          <p className="text-muted-foreground mb-8 text-sm">Start tracking in minutes.</p>

          <form onSubmit={onSubmit} className="space-y-4">
            {[
              { id: "name", label: "Full Name", type: "text" },
              { id: "email", label: "Email", type: "email" },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="font-mono text-[10px] tracking-[0.2em] uppercase">{f.label}</Label>
                <Input id={f.id} type={f.type} value={form[f.id as keyof typeof form]} onChange={set(f.id as keyof typeof form)} required className="h-11 rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary bg-card" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mono text-[10px] tracking-[0.2em] uppercase">Password</Label>
              <div className="relative">
                <Input id="password" type={show ? "text" : "password"} value={form.password} onChange={set("password")} required className="h-11 rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary bg-card pr-10" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="font-mono text-[10px] tracking-[0.2em] uppercase">Confirm</Label>
              <Input id="confirm" type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} required className="h-11 rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary bg-card" />
            </div>

            <Button type="submit" disabled={busy} className="w-full h-11 rounded-none bg-foreground hover:bg-foreground/90 text-background font-mono text-xs tracking-[0.2em] uppercase group mt-2">
              {busy ? "Creating…" : <>Create account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-foreground/10 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium underline underline-offset-4 hover:text-primary">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
