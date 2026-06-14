import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSkeleton } from "./ui/LoadingSkeleton";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-6">
        <div className="app-card w-full max-w-md rounded-[32px] p-8 text-center">
          <p className="app-kicker">SomuPilot AI</p>
          <h1 className="mt-4 text-2xl font-semibold text-[var(--text)]">Loading session</h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Checking your authentication status.
          </p>
          <div className="mt-6 space-y-3">
            <LoadingSkeleton className="h-4 w-2/3 mx-auto" />
            <LoadingSkeleton className="h-3 w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
