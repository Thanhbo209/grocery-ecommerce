// ─── 4. PROMO BANNERS ─────────────────────────────────────────────────────────

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PromoBanners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Rau */}
        <div className="relative flex h-52 items-center overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-400 px-8">
          <div className="z-10 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100">
              Tươi mỗi sáng
            </p>
            <h3 className="text-2xl font-bold leading-tight text-white">
              Rau củ sạch <br />
              <span className="text-yellow-300">từ vườn đến bàn</span>
            </h3>
            <Button
              size="sm"
              className="w-fit rounded-full bg-white px-5 text-emerald-700 hover:bg-emerald-50"
              asChild
            >
              <Link to="/shop">Mua Ngay</Link>
            </Button>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full " />
          <div className="absolute -bottom-12 right-8 h-44 w-44 rounded-full " />
          {/* Image */}
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/058/144/013/small/fresh-assorted-vegetables-with-vibrant-colors-and-textures-on-transparent-background-png.png"
            alt="Rau sạch"
            className="absolute bottom-0 right-4 h-50 w-100 rounded-xl object-cover opacity-80 "
          />
        </div>

        {/* Thịt */}
        <div className="relative flex h-52 items-center overflow-hidden rounded-2xl bg-linear-to-r from-rose-500 to-orange-400 px-8">
          <div className="z-10 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-100">
              Nhập mỗi ngày
            </p>
            <h3 className="text-2xl font-bold leading-tight text-white">
              Thịt tươi <br />
              <span className="text-yellow-200">chất lượng cao</span>
            </h3>
            <Button
              size="sm"
              className="w-fit rounded-full bg-white px-5 text-rose-600 hover:bg-rose-50"
              asChild
            >
              <Link to="/shop">Mua Ngay</Link>
            </Button>
          </div>
          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full " />
          <div className="absolute -bottom-12 right-8 h-44 w-44 rounded-full " />
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/049/799/009/small/steak-meat-beef-isolated-transparent-background-png.png"
            alt="Thịt tươi"
            className="absolute bottom-0 right-4 h-50 w-100 rounded-xl object-cover opacity-80 "
          />
        </div>
      </div>
    </section>
  );
}
