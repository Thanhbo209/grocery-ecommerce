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
  {
    label: "Sản Phẩm",
    icon: CarrotIcon,
    href: "",
    badge: "12",
    disabled: true,
  },
  { label: "Công Thức", icon: FlaskConical, href: "", disabled: true },
  {
    label: "Nguyên Liệu",
    icon: ShoppingBasket,
    href: "#",
    badge: "3",
    badgeWarning: true,
  },
  { label: "Người Dùng", icon: Users, href: "", disabled: true },
  { label: "Báo Cáo", icon: BarChart3, href: "", disabled: true },
  { label: "Cài Đặt", icon: Settings, href: "", disabled: true },
];
