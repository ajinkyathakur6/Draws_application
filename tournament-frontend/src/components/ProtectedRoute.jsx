import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const userRole = localStorage.getItem("role");
  if (!userRole) return <Navigate to="/login" />;
  if (role && userRole !== role) return <Navigate to="/login" />;
  return children;
}
