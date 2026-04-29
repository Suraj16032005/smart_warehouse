import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth";

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { toast.error("Name too short"); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.info("Profile update not connected to DB in this demo.");
    }, 250);
  };

  const changePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.info("Password update not connected to DB in this demo.");
      setPw("");
    }, 250);
  };

  return (
    <AppLayout>
      <div className="bg-blueprint min-h-full">
        <div className="p-6 md:p-10 space-y-6 max-w-3xl">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-2">OPERATOR</div>
            <h1 className="font-display text-4xl md:text-5xl font-black">Profile</h1>
          </div>

          <div className="bg-card border border-foreground/15 p-6 flex items-center gap-5">
            <div className="w-16 h-16 bg-foreground text-background grid place-items-center">
              <User className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Identity</div>
              <div className="font-display text-2xl font-black">{name || "—"}</div>
              <div className="font-mono text-xs text-muted-foreground">{email}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={saveProfile} className="bg-card border border-foreground/15 p-6 space-y-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">01</div>
                <h3 className="font-display text-xl font-black">Personal info</h3>
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} maxLength={80}
                  className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">Email</Label>
                <Input value={email} disabled className="rounded-none border-foreground/30 bg-paper-2 font-mono text-sm" />
              </div>
              <Button type="submit" disabled={busy} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase w-full">
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </form>

            <form onSubmit={changePw} className="bg-card border border-foreground/15 p-6 space-y-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">02</div>
                <h3 className="font-display text-xl font-black">Change password</h3>
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] tracking-[0.2em] uppercase">New password</Label>
                <Input type="password" value={pw} onChange={e => setPw(e.target.value)} maxLength={72} minLength={8}
                  className="rounded-none border-foreground/30 focus-visible:ring-0 focus-visible:border-primary" />
                <p className="font-mono text-[10px] text-muted-foreground">Min. 8 characters</p>
              </div>
              <Button type="submit" disabled={busy || !pw} className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase w-full">
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
