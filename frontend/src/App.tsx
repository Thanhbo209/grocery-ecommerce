import ClientLayout from "@/layouts/ClientLayout";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<HomePage />} />{" "}
      </Route>
      <Route path="/login" element={<Login />} />{" "}
    </Routes>
  );
}

export default App;
