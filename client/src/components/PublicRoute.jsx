import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginPageSkeleton } from "./ui/LoadingSkeleton";

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoginPageSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;
