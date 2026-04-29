import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-blueprint grid place-items-center px-6">
    <div className="text-center max-w-md">
      <div className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mb-3">RROR 404</div>
      <h1 className="font-display text-7xl font-black mb-3">Off-grid.</h1>
      <p className="text-muted-foreground mb-6">This sheet does not exist on the blueprint.</p>
      <Link to="/">
        <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90 font-mono text-xs tracking-[0.2em] uppercase">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to base
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
