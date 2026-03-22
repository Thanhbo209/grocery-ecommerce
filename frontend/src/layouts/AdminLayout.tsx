import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

// Map pathname → page title
const pageTitles = {
  "/": "Dashboard",
  "/admin": "Dashboard",
  "/admin/mon-an": "Món Ăn",
  "/admin/cong-thuc": "Công Thức",
  "/admin/nguyen-lieu": "Nguyên Liệu",
  "/admin/nguoi-dung": "Người Dùng",
  "/admin/bao-cao": "Báo Cáo",
  "/admin/cai-dat": "Cài Đặt",
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] ?? "Admin";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen overflow-hidden bg-background transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main area — shifts right based on sidebar width */}
        <div
          className={[
            "flex flex-col flex-1 min-w-0 transition-all duration-300",
            collapsed ? "lg:ml-[72px]" : "lg:ml-64",
          ].join(" ")}
        >
          {/* Navbar */}
          <Navbar
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((c) => !c)}
            onToggleMobile={() => setMobileOpen((o) => !o)}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode((d) => !d)}
            pageTitle={pageTitle}
          />

          {/* Page content via Outlet */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet context={{ darkMode }} />
          </main>
        </div>
      </div>
    </div>
  );
}
