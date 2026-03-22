import {
  BarChart3,
  CarrotIcon,
  FlaskConical,
  LayoutDashboard,
  Settings,
  ShoppingBasket,
  Users,
} from "lucide-react";

export const ADMIN_NAVITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    active: true,
  },
  { label: "Sản Phẩm", icon: CarrotIcon, href: "#", badge: "12" },
  { label: "Công Thức", icon: FlaskConical, href: "#" },
  {
    label: "Nguyên Liệu",
    icon: ShoppingBasket,
    href: "#",
    badge: "3",
    badgeWarning: true,
  },
  { label: "Người Dùng", icon: Users, href: "#" },
  { label: "Báo Cáo", icon: BarChart3, href: "#" },
  { label: "Cài Đặt", icon: Settings, href: "#" },
];
