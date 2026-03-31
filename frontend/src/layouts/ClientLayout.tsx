import Navbar from "@/components/client/navbar/Navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function ClientLayout() {
  const { pathname } = useLocation();

  // Route "/" có CategoryStrip thêm h-9 (36px) bên dưới navbar h-16 (64px)
  // Các route khác chỉ có navbar h-16 (64px)
  const paddingTop = pathname === "/" ? "pt-[100px]" : "pt-16";

  return (
    <>
      <Navbar />
      <main className={paddingTop}>
        <Outlet />
      </main>
    </>
  );
}
