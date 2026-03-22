import ClientLayout from "@/layouts/ClientLayout";
import HomePage from "@/pages/HomePage";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Register";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />{" "}
        </Route>
        <Route path="/login" element={<LoginPage />} />{" "}
        <Route path="/register" element={<RegisterPage />} />{" "}
      </Routes>
    </>
  );
}

export default App;
