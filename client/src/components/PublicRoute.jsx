import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSkeleton } from "./ui/LoadingSkeleton";

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-[calc(100vh-5rem)] items-center justify-center px-6">
        <div className="app-card w-full max-w-md rounded-[28px] px-8 py-6">
          <LoadingSkeleton className="h-5 w-28" />
          <LoadingSkeleton className="mt-4 h-3 w-48" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
