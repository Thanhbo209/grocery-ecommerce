import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/green-logo.png";
import { CategoryStrip } from "@/components/client/CategoryStrip";
import { useCart } from "@/context/CartContext";
import { categoryApi } from "@/api/categoryApi";
import type { Category } from "@/types/category";
// ─── Hooks placeholder — thay bằng hook thực của project ─────────────────────

interface AuthUser {
  name: string;
  role: "admin" | "user";
}

function useAuth() {
  const raw = localStorage.getItem("user");
  const token =
    localStorage.getItem("token") ?? localStorage.getItem("accessToken");
  const user: AuthUser | null =
    token && raw ? (JSON.parse(raw) as AuthUser) : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return { user, logout };
}

/** Inline search form — dùng cả desktop lẫn mobile */
function SearchForm({
  className,
  onSubmit,
}: {
  className?: string;
  onSubmit?: () => void;
}) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex items-center", className)}
    >
      <Search
        size={14}
        className="absolute left-3 text-muted-foreground pointer-events-none"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-400 focus:bg-background transition-colors"
      />
    </form>
  );
}

/** Avatar + dropdown menu khi đã đăng nhập */
function UserDropdown({
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
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Fetch categories once
  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const NAV_LINKS = [
    { to: "/", label: "Trang chủ" },
    { to: "/shop", label: "Cửa hàng" },
    { to: "/about", label: "Về chúng tôi" },
  ];

  return (
    <>
      {/* ── Main bar (fixed) ── */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              aria-label="GreenMart"
              className="flex shrink-0 items-center gap-2 font-bold text-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center p-1 rounded-full border-2 border-primary text-sm text-white">
                <img src={Logo} alt="" className="object-cover" />
              </span>
              <span className="hidden text-base sm:inline">GreenMart</span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop search — grows */}
            <div className="hidden flex-1 md:block max-w-sm">
              <SearchForm />
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <ShoppingCart size={19} />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {user ? (
                <UserDropdown user={user} logout={logout} />
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar — drops down */}
          {searchOpen && (
            <div className="pb-3 md:hidden">
              <SearchForm onSubmit={() => setSearchOpen(false)} />
            </div>
          )}
        </div>

        {/* Category strip — chỉ hiện ở trang "/" */}
        <CategoryStrip categories={categories} />
      </header>

      {/* ── Mobile slide-in menu ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <nav className="fixed left-0 right-0 top-16.25 z-40 border-b border-border bg-background shadow-lg md:hidden">
            <div className="flex flex-col divide-y divide-border">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-6 py-3.5 text-sm font-medium transition-colors",
                    pathname === to
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {label}
                </Link>
              ))}

              {/* Auth links mobile */}
              {!user && (
                <div className="flex gap-3 px-6 py-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full border border-border py-2 text-center text-sm font-medium hover:bg-muted"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full bg-emerald-600 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
