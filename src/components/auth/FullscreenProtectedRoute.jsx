import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

/**
 * Like ProtectedRoute but renders <Outlet> directly — no sidebar, no padding.
 * Used for full-screen experiences (Export, etc.) that manage their own layout.
 */
export default function FullscreenProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <Spinner />;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}
