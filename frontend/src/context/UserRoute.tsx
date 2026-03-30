import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function UserRoute({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);

  if (!auth) throw new Error("AuthContext chưa được cung cấp");

  if (auth.loading) {
    return <div>Loading...</div>; // hoặc skeleton
  }

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
