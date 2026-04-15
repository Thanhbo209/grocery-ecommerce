import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Menu, Search, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/green-logo.png";
import { CategoryStrip } from "@/components/client/navbar/CategoryStrip";
import { useCart } from "@/context/CartContext";
import { categoryApi } from "@/api/categoryApi";
import type { Category } from "@/types/category";
import { useAuth } from "@/hooks/useAuth";
import { UserDropdown } from "@/components/client/navbar/UserDropdown";
import { SearchForm } from "@/components/client/navbar/SearchForm";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center gap-4">
            {/* Logo */}
            <Link
              to="/"
              aria-label="GreenMart"
              className="flex shrink-0 items-center gap-2 font-bold text-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center p-1 rounded-full border-2 border-primary text-sm ">
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
              {user?.role === "user" ? (
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
              ) : null}

              {/* Auth */}
              {user?.role === "user" ? (
                <UserDropdown user={user} logout={logout} />
              ) : user?.role === "admin" ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-1"
                    >
                      <LayoutDashboard size={16} className="mr-1" /> Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={logout}
                    className="ml-2"
                  >
                    Đăng xuất
                  </Button>
                </div>
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
                    className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
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

          {searchOpen && (
            <div className="pb-3 md:hidden">
              <SearchForm onSubmit={() => setSearchOpen(false)} />
            </div>
          )}
        </div>

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
                      ? "bg-primary/50 text-primary"
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
                    className="flex-1 rounded-full bg-primary py-2 text-center text-sm font-semibold text-white hover:bg-primary/80"
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
