import AdminRoute from "@/context/Protected";
import ClientLayout from "@/layouts/ClientLayout";
import HomePage from "@/pages/client/HomePage";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminLayout from "@/layouts/AdminLayout";
import DashboardPage from "@/pages/admin/Dashboard";
import ProductsPage from "@/pages/admin/ProductsPage";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
