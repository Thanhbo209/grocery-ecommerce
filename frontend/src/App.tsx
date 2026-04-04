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
import ProductDetailPage from "@/pages/client/ProductDetailPage";
import ShopPage from "@/pages/client/ShopPage";
import CategoryPage from "@/pages/client/CategoryPage";
import UserRoute from "@/context/UserRoute";
import CartPage from "@/pages/client/CartPage";
import CheckoutPage from "@/pages/client/CheckOutPage";
import ProfilePage from "@/pages/client/ProfilePage";
import OrdersPage from "@/pages/client/OrdersPage";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* User Route */}
        <Route element={<UserRoute />}>
          <Route element={<ClientLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
        </Route>

        {/* PUBLIC ROUTES */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/shop" element={<ShopPage />} />
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
