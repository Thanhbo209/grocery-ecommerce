import {
  BarChart3,
  CarrotIcon,
  CreditCardIcon,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

export const ADMIN_NAVITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  { label: "Người dùng", icon: Users, href: "/admin/users" },
  {
    label: "Sản Phẩm",
    icon: CarrotIcon,
    href: "/admin/products",
    badge: "12",
  },
  {
    label: "Đơn Hàng",
    icon: ScrollText,
    href: "/admin/orders",
    badge: "3",
    badgeWarning: true,
  },
  { label: "Thanh Toán", icon: CreditCardIcon, href: "/admin/payments" },
  { label: "Báo Cáo", icon: BarChart3, href: "/admin/2" },
  { label: "Cài Đặt", icon: Settings, href: "/admin/settings" },
];
