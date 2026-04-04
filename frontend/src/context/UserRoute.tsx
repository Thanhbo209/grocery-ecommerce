import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function UserRoute() {
  const auth = useContext(AuthContext);

  if (!auth) throw new Error("AuthContext chưa được cung cấp");

  if (auth.loading) {
    return <div>Loading...</div>;
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
