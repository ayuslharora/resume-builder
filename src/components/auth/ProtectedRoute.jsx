import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Spinner from "../ui/Spinner";
import AppLayout from "../layout/AppLayout";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <Spinner />;
  
  return currentUser
    ? <AppLayout />
    : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
}
