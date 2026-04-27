import {
  CarrotIcon,
  CreditCardIcon,
  LayoutDashboard,
  ScrollText,
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
  },
  {
    label: "Đơn Hàng",
    icon: ScrollText,
    href: "/admin/orders",
    badgeWarning: true,
  },
  { label: "Thanh Toán", icon: CreditCardIcon, href: "/admin/payments" },
];
