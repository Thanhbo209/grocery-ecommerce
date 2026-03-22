import { useState, useRef, useEffect, type RefObject } from "react";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Home,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const notifications = [
  {
    id: 1,
    text: "Nguyên liệu bơ sắp hết hàng",
    time: "5 phút trước",
    unread: true,
  },
  {
    id: 2,
    text: "Đơn hàng #1082 đã xác nhận",
    time: "20 phút trước",
    unread: true,
  },
  {
    id: 3,
    text: "Công thức mới được thêm vào",
    time: "1 giờ trước",
    unread: false,
  },
];

function useOutsideClick(
  ref: RefObject<HTMLDivElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  onToggleDark: () => void;
  pageTitle: string;
  darkMode: boolean;
}

export default function Navbar({
  onToggleSidebar,
  onToggleMobile,
  darkMode,
  onToggleDark,
  pageTitle = "Dashboard",
}: NavbarProps) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(profileRef, () => setProfileOpen(false));

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16.25 bg-sidebar  border-b border-border  flex items-center px-4 gap-3 sticky top-0 z-10">
      {/* Toggle sidebar — desktop */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-accent transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Hamburger — mobile */}
      <button
        onClick={onToggleMobile}
        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-accent transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-foreground hidden sm:block">
        {pageTitle}
      </h1>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto lg:mx-0 lg:ml-4">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl  border border-border  placeholder-muted-foreground focus:outline-none focus:ring-2 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-accent  transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card  rounded-2xl shadow-xl border border-border  overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border ">
                <span className="text-sm font-semibold ">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] bg-primary/20 text-primary  font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <div className="divide-y divide-border/50  max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={[
                      "flex gap-3 px-4 py-3 hover:bg-accent/20 cursor-pointer transition-colors",
                      n.unread ? " bg-primary/10" : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-1 w-2 h-2 rounded-full shrink-0",
                        n.unread ? "bg-primary" : "bg-muted ",
                      ].join(" ")}
                    />
                    <div>
                      <p className="text-sm  leading-snug">{n.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border ">
                <button className="text-xs font-medium text-accent hover:underline">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-card  transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold  leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Quản trị viên
              </p>
            </div>
            <ChevronDown
              size={14}
              className={[
                "text-muted-foreground transition-transform hidden sm:block",
                profileOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card rounded-2xl shadow-xl border border-border  overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border ">
                <p className="text-sm font-semibold ">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>
              <div className="p-1.5">
                <a className="flex gap-2" href="/">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm  hover:bg-accent/10  rounded-xl transition-colors">
                    <Home size={15} />
                    Về trang chủ
                  </button>
                </a>
              </div>
              <div className="p-1.5">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10  rounded-xl transition-colors">
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
