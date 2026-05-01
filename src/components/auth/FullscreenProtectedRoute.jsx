import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Spinner from "../ui/Spinner";

/**
 * Like ProtectedRoute but renders <Outlet> directly — no sidebar, no padding.
 * Used for full-screen experiences (Export, etc.) that manage their own layout.
 */
export default function FullscreenProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  return currentUser
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
}
