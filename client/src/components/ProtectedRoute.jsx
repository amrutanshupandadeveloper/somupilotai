import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-glow backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
            SomuPilot AI
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-white">Loading session</h1>
          <p className="mt-3 text-sm text-slate-400">
            Checking your authentication status.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
