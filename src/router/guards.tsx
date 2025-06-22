import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ✅ Chỉ cho vào nếu đã login
export function ProtectedRoute() {
  const { token } = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// ✅ Chỉ cho vào nếu CHƯA login (login, register)
export function PublicOnlyRoute() {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : <Outlet />;
}
