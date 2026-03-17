import Navbar from "@/components/client/Navbar";
import Login from "@/pages/Login";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />

      <main className="pt-16">
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
