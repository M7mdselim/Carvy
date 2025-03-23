
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ 
  requireAdmin = false,
  requireOwner = false 
}: { 
  requireAdmin?: boolean,
  requireOwner?: boolean 
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    // Store the current location to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem("redirectAfterLogin", currentPath);
    
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
