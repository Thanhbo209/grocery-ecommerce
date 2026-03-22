import Logo from "@/assets/green-logo.png";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  User2,
  Menu,
  Search,
  Settings,
  LogOut,
  Heart,
  Bell,
  ChevronDown,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [cartCount] = useState(3); // mock cart count
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const activeCategory = searchParams.get("category") ?? "";

  const handleSelect = (categoryId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (categoryId === "") {
        next.delete("category");
      } else {
        next.set("category", categoryId);
      }
      // Reset về trang 1 khi đổi danh mục
      next.delete("page");
      return next;
    });
  };

  // Chỉ hiện ở route "/"
  if (pathname !== "/") return null;

  const items = [{ _id: "", name: "Tất Cả Danh Mục" }, ...categories];
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary-foreground/80">
            <MapPin size={11} />
            <span>Giao hàng toàn quốc · Miễn phí từ 299k</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-primary-foreground/80">
            <a
              href="#"
              className="hover:text-primary-foreground transition-colors"
            >
              Chính sách đổi trả
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-primary-foreground transition-colors"
            >
              Hỗ trợ khách hàng
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* LOGO */}
            <a href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden group-hover:bg-primary/20 transition-colors">
                  <img
                    src={Logo}
                    alt="logo"
                    className="w-7 h-7 object-contain"
                  />
                </div>
              </div>
              <p className="text-lg font-bold tracking-tight">
                Green<span className="text-chart-3">Cart</span>
              </p>
            </a>

            {/* SEARCH */}
            <div className="flex-1 mx-2 hidden md:block">
              <div
                className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
                  searchFocused
                    ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                    : "border-border bg-muted/40 hover:border-primary/40"
                }`}
              >
                <Search
                  size={16}
                  className={`absolute left-3.5 transition-colors ${
                    searchFocused ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <Input
                  placeholder="Tìm kiếm rau củ, trái cây, thực phẩm..."
                  className="pl-10 pr-28 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <button className="absolute right-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Wishlist */}
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors relative group">
                <Heart
                  size={20}
                  className="text-muted-foreground group-hover:text-rose-500 transition-colors"
                />
              </button>

              {/* Notification */}
              {user && (
                <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors relative">
                  <Bell size={20} className="text-muted-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-chart-3 rounded-full ring-2 ring-background" />
                </button>
              )}

              {/* ACCOUNT */}
              {user?.role === "admin" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center border border-primary gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <User2 size={15} className="text-primary" />
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-muted-foreground">
                          Tài khoản
                        </span>
                        <span className="text-xs font-semibold text-foreground max-w-20 truncate">
                          {user.name || user.email}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className="text-muted-foreground"
                      />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl shadow-xl border-border/60 p-1.5"
                  >
                    <div className="px-3 py-2.5 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                          <User2 size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {user.name || "Người dùng"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-37.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem
                      onClick={() => navigate("/admin/dashboard")}
                      className="cursor-pointer rounded-xl text-sm gap-2.5 py-2"
                    >
                      <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer rounded-xl text-sm gap-2.5 py-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : user?.role === "user" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center border border-primary gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                        <User2 size={15} className="text-primary" />
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] text-muted-foreground">
                          Tài khoản
                        </span>
                        <span className="text-xs font-semibold text-foreground max-w-20 truncate">
                          {user.name || user.email}
                        </span>
                      </div>
                      <ChevronDown
                        size={14}
                        className="text-muted-foreground"
                      />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl shadow-xl border-border/60 p-1.5"
                  >
                    <div className="px-3 py-2.5 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                          <User2 size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {user.name || "Người dùng"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-37.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer rounded-xl text-sm gap-2.5 py-2"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Cài đặt tài khoản
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuSeparator className="my-1" />

                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive focus:text-destructive cursor-pointer rounded-xl text-sm gap-2.5 py-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  href="/login"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <User2 size={15} className="text-muted-foreground" />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-muted-foreground">
                      Chào mừng
                    </span>
                    <span className="text-xs font-semibold">Đăng nhập</span>
                  </div>
                </a>
              )}

              {/* CART */}
              <button className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-2 rounded-2xl transition-all duration-150 active:scale-95 relative ml-1">
                <div className="relative">
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-3 min-w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>

              {/* MOBILE MENU */}
              <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-colors ml-1">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <div className="relative flex items-center rounded-2xl border border-border bg-muted/40">
              <Search
                size={15}
                className="absolute left-3 text-muted-foreground"
              />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-9"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Category nav */}
      {pathname === "/" && (
        <div className="hidden border-b border-border/40 bg-background shadow-sm md:block">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-10 items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {items.map((cat) => {
                const isActive = cat._id === activeCategory;
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleSelect(cat._id)}
                    className={`
                  relative whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium
                  transition-colors duration-150 shrink-0
                  ${
                    isActive
                      ? " text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
                  >
                    {cat.name}
                    {/* Active indicator line */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
