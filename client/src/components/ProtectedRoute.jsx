import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DashboardShellSkeleton } from "./ui/LoadingSkeleton";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <DashboardShellSkeleton />;
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
