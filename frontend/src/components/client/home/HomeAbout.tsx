// ─── 6. ABOUT / GALLERY ───────────────────────────────────────────────────────

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, MapPin, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80",
    alt: "Chợ rau tươi",
  },
  {
    src: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80",
    alt: "Giao hàng tận nhà",
  },
  {
    src: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    alt: "Thực phẩm hữu cơ",
  },
  {
    src: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    alt: "Đóng gói cẩn thận",
  },
];

export default function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* LEFT — Text */}
        <div className="flex flex-col justify-center gap-5">
          <Badge className="w-fit rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold text-emerald-700">
            Về Chúng Tôi
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Tươi từ vườn — <br />
            <span className="text-primary">sạch đến bàn ăn</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Chúng tôi làm việc trực tiếp với nông dân địa phương để mang đến sản
            phẩm tươi ngon nhất mỗi ngày. Không qua nhiều khâu trung gian — giá
            tốt hơn và chất lượng đảm bảo hơn cho bạn.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                icon: <MapPin size={18} className="text-primary" />,
                title: "Địa điểm",
                desc: "123 Nguyễn Văn A, Q.1, TP.HCM",
              },
              {
                icon: <Truck size={18} className="text-primary" />,
                title: "Giao hàng",
                desc: "Trong 2 giờ nội thành, miễn phí từ 200k",
              },
              {
                icon: <Leaf size={18} className="text-primary" />,
                title: "Tiêu chuẩn",
                desc: "VietGAP, hữu cơ, không hoá chất",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  {icon}
                </div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <Button
            className="w-fit rounded-full bg-primary px-7 text-white hover:bg-emerald-700"
            asChild
          >
            <Link to="/about">
              Tìm hiểu thêm <ArrowRight size={15} className="ml-2" />
            </Link>
          </Button>
        </div>

        {/* RIGHT — Gallery */}
        <div className="flex flex-col gap-3">
          {/* Large image */}
          <div className="h-60 overflow-hidden rounded-2xl">
            <img
              src={GALLERY[0].src}
              alt={GALLERY[0].alt}
              className="h-full w-full object-cover"
            />
          </div>
          {/* 3 nhỏ */}
          <div className="grid grid-cols-3 gap-3">
            {GALLERY.slice(1).map((img) => (
              <div key={img.alt} className="h-28 overflow-hidden rounded-xl">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
