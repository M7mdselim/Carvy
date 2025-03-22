
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ 
  requireAdmin = false,
  requireOwner = false 
}: { 
  requireAdmin?: boolean,
  requireOwner?: boolean 
}) {
  const { user, isAdmin, isOwner, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireOwner && !isOwner && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
