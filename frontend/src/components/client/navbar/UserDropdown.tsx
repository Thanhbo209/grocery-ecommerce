import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import {
  ChevronDown,
  LayoutDashboard,
  LogOutIcon,
  Package,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function UserDropdown({
  user,
  logout,
}: {
  user: AuthUser;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-20 truncate sm:inline">{user.name}</span>
        <ChevronDown
          size={12}
          className={cn(
            "text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Xin chào,</p>
            <p className="truncate text-sm font-semibold">{user.name}</p>
          </div>

          {/* Menu items */}
          <nav className="py-1.5">
            {[
              { to: "/profile", icon: <User size={14} />, label: "Tài khoản" },
              {
                to: "/orders",
                icon: <Package size={14} />,
                label: "Đơn hàng của tôi",
              },
              ...(user.role === "admin"
                ? [
                    {
                      to: "/admin/dashboard",
                      icon: <LayoutDashboard size={14} />,
                      label: "Quản trị",
                    },
                  ]
                : []),
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="text-muted-foreground">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-border py-1.5">
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/20"
            >
              <LogOutIcon size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
