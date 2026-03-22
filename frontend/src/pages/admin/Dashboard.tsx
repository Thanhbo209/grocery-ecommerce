import {
  UtensilsCrossed,
  FlaskConical,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Tổng món ăn",
    value: "48",
    change: "+4 tháng này",
    icon: UtensilsCrossed,
    color: "from-violet-500 to-indigo-500",
    light:
      "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    label: "Công thức",
    value: "132",
    change: "+12 tháng này",
    icon: FlaskConical,
    color: "from-sky-500 to-cyan-500",
    light: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  },
  {
    label: "Nguyên liệu",
    value: "87",
    change: "3 sắp hết",
    icon: ShoppingBasket,
    color: "from-amber-500 to-orange-500",
    light:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  {
    label: "Doanh thu",
    value: "24.5M",
    change: "+8% so với tháng trước",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    light:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
];

const recentDishes = [
  {
    name: "Phở bò đặc biệt",
    category: "Món chính",
    status: "Đang phục vụ",
    price: "85,000đ",
  },
  {
    name: "Bún bò Huế",
    category: "Món chính",
    status: "Đang phục vụ",
    price: "75,000đ",
  },
  {
    name: "Bánh mì thịt nướng",
    category: "Ăn nhẹ",
    status: "Tạm ngưng",
    price: "35,000đ",
  },
  {
    name: "Cơm tấm sườn",
    category: "Cơm",
    status: "Đang phục vụ",
    price: "65,000đ",
  },
  {
    name: "Gỏi cuốn tôm thịt",
    category: "Khai vị",
    status: "Đang phục vụ",
    price: "45,000đ",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card  rounded-2xl p-5 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${s.light}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent dishes table */}
      <div className="bg-card rounded-2xl border border-border  overflow-hidden">
        <div className="px-5 py-4 border-b border-border  flex items-center justify-between">
          <h2 className="text-sm font-semibold  text-foreground">
            Món ăn gần đây
          </h2>
          <button className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
            Xem tất cả
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3">Tên món</th>
                <th className="px-5 py-3">Danh mục</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentDishes.map((dish) => (
                <tr
                  key={dish.name}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-100">
                    {dish.name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                    {dish.category}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={[
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                        dish.status === "Đang phục vụ"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                      ].join(" ")}
                    >
                      {dish.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                    {dish.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
