import Logo from "@/assets/green-logo.png";
import { useAuth } from "@/components/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-sidebar border-b backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="logo" className="w-10 h-10 object-cover" />
          <p className="text-xl font-semibold text-primary">
            Green<span className="text-chart-3">Cart</span>
          </p>
        </div>

        {/* SEARCH (desktop only) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10" />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* account */}
          {user ? (
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                {/* Trigger */}
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-lg  transition">
                    <User2 size={20} className="text-primary" />
                    <p className="text-xs font-medium  flex flex-col items-start">
                      Xin chào
                      <span className="text-xs font-medium text-primary">
                        {user.name || user.email}
                      </span>
                    </p>
                  </button>
                </DropdownMenuTrigger>

                {/* Dropdown */}
                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                  {/* Info */}
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Settings */}
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt người dùng
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4 " />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <User2 size={20} className="text-primary" />
              <div className="flex flex-col leading-none">
                <p className="text-xs text-primary">Tài khoản</p>
                <a href="/login" className="text-xs hover:underline">
                  Đăng nhập
                </a>
              </div>
            </div>
          )}

          {/* cart */}
          <Button className="rounded-full p-3">
            <ShoppingCart size={18} />
            <p>Giỏ Hàng</p>
          </Button>

          {/* mobile menu */}
          <button className="md:hidden">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
