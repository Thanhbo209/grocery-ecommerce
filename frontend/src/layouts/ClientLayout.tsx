import Navbar from "@/components/client/Navbar";
import { Outlet } from "react-router-dom";

export default function ClientLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}
