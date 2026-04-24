import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-blueprint flex items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground tracking-widest">LOADING<span className="animate-blueprint-pulse">_</span></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
