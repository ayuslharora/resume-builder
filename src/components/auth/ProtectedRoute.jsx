import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Spinner from "../ui/Spinner";
import AppLayout from "../layout/AppLayout";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <Spinner />;
  
  return currentUser ? <AppLayout /> : <Navigate to="/login" replace />;
}
