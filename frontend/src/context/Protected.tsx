import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // chưa login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // không phải admin
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
