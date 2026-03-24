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
import { categoryApi } from "@/hooks/api";
import type { Category } from "@/types/product";

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

function useCartCount(): number {
  // TODO: replace with real cart store selector
  return 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        <span className="hidden max-w-[80px] truncate sm:inline">
          {user.name}
        </span>
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
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Thanh danh mục bên dưới navbar — chỉ hiện ở route "/" */
function CategoryStrip({ categories }: { categories: Category[] }) {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("category") ?? "";

  if (pathname !== "/") return null;

  const items: Pick<Category, "_id" | "name">[] = [
    { _id: "", name: "Tất Cả" },
    ...categories,
  ];

  const handleSelect = (id: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        id ? next.set("category", id) : next.delete("category");
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="border-b border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-9 items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {items.map((cat) => {
            const active = cat._id === activeId;
            return (
              <button
                key={cat._id}
                onClick={() => handleSelect(cat._id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat.name}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const { user, logout } = useAuth();
  const cartCount = useCartCount();
  const { pathname } = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
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
              className="flex shrink-0 items-center gap-2 font-bold text-emerald-600"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm text-white">
                🌿
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
                      ? "bg-emerald-50 text-emerald-700"
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
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
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
          <nav className="fixed left-0 right-0 top-[65px] z-40 border-b border-border bg-background shadow-lg md:hidden">
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
