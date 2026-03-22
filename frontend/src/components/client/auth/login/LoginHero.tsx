import { ArrowLeft, ShoppingBasket } from "lucide-react";

const STATS = [
  { value: "5K+", label: "Sản phẩm" },
  { value: "2h", label: "Giao hàng" },
  { value: "98%", label: "Hài lòng" },
];

export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden rounded-l-2xl bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12 lg:my-8">
      {/* Decorative circles */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-white/5" />

      <div className="absolute left-12 top-8 z-50 text-white">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs hover:underline"
        >
          <ArrowLeft />
          Quay về trang chủ
        </a>
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 mt-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent shadow-lg">
          <ShoppingBasket color="white" />
        </div>
        <span className="font-display text-2xl font-bold tracking-tight text-white">
          GreenCart
        </span>
      </div>

      {/* Main copy */}
      <div className="relative z-10">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/60">
          Thực phẩm tươi sạch
        </p>
        <h1 className="font-display mb-5 text-[2.2rem] font-bold leading-[1.2] text-white">
          Mua sắm thông minh,
          <br />
          <span className="text-white/70">sống khỏe mỗi ngày</span>
        </h1>
        <p className="max-w-70 text-sm leading-relaxed text-white/55">
          Hơn 5.000 sản phẩm tươi sạch từ nông trại đến bàn ăn, giao hàng trong
          2 giờ.
        </p>

        {/* Stats */}
        <div className="mt-9 flex gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-[1.6rem] font-bold text-white">
                {s.value}
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex -space-x-2">
          {["🧑", "👩", "👨"].map((a, i) => (
            <div
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-sm"
            >
              {a}
            </div>
          ))}
        </div>
        <p className="text-sm text-white/55">+12.000 khách hàng tin tưởng</p>
      </div>
    </div>
  );
}
