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
  },
  {
    label: "Sản Phẩm",
    icon: CarrotIcon,
    href: "/admin/products",
    badge: "12",
  },
  { label: "Người dùng", icon: FlaskConical, href: "/admin/4" },
  {
    label: "Nguyên Liệu",
    icon: ShoppingBasket,
    href: "#",
    badge: "3",
    badgeWarning: true,
  },
  { label: "Người Dùng", icon: Users, href: "/admin/1" },
  { label: "Báo Cáo", icon: BarChart3, href: "/admin/2" },
  { label: "Cài Đặt", icon: Settings, href: "/admin/dashb3oard" },
];
