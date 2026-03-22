import { ChevronRight, X } from "lucide-react";
import Logo from "@/assets/green-logo.png";
import { ADMIN_NAVITEMS } from "@/constants/admin-sidebar";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-30 h-full bg-sidebar border-r border-border",
          "flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          // Desktop: collapse/expand
          collapsed ? "lg:w-18" : "lg:w-64",
          // Mobile: slide in/out
          mobileOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-16.25">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shadow-lg ">
            <img src={Logo} alt="" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-lg text-foreground font-bold tracking-tight">
                Green<span className="text-chart-3">Cart</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Quản lý cửa hàng
              </p>
            </div>
          )}
          {/* Mobile close button */}
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={onMobileClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {ADMIN_NAVITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            console.log(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                title={collapsed ? item.label : undefined}
                className={[
                  "group flex justify-center items-center gap-2 px-1.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150 relative",
                  isActive
                    ? "bg-primary text-background shadow-md"
                    : "text-foreground  hover:bg-accent  hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  size={13}
                  className={[
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-background" : "",
                  ].join(" ")}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 whitespace-nowrap truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={[
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          item.active
                            ? "bg-white/25 text-white"
                            : item.badgeWarning
                              ? "bg-chart-5/10 text-chart-5 dark:bg-amber-900/40 dark:text-amber-400"
                              : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
                        ].join(" ")}
                      >
                        {item.badge}
                      </span>
                    )}
                    {!item.badge && !item.active && (
                      <ChevronRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                      />
                    )}
                  </>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {item.label}
                    {item.badge && <span className="hidden">{item.badge}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div
            className={[
              "flex items-center gap-3 p-2 rounded-xl hover:bg-secondary cursor-pointer transition-colors group",
            ].join(" ")}
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-xs font-bold shadow">
              AD
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-none">
                  Admin
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  admin@food.vn
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
