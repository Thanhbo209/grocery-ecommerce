import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
// ─── 1. HERO SLIDER ───────────────────────────────────────────────────────────

const SLIDES = [
  {
    label: "Rau sạch hôm nay",
    img: "https://plus.unsplash.com/premium_photo-1664527305901-a3c8bec62850?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Rau củ tươi",
  },
  {
    label: "Trái cây nhập khẩu",
    img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    alt: "Trái cây",
  },
  {
    label: "Thịt tươi mỗi ngày",
    img: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80",
    alt: "Thịt tươi",
  },
];
// ─── 2. HERO SECTION ──────────────────────────────────────────────────────────
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    [],
  );
  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      <img
        src={slide.img}
        alt={slide.alt}
        className="h-full w-full object-cover transition-all duration-700"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />

      {/* Label */}
      <div className="absolute bottom-4 left-4">
        <span className="inline-block rounded-md  px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
          {slide.label}
        </span>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-5 bg-primary" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-1.5 shadow-md backdrop-blur-sm "
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-secondary p-1.5 shadow-md backdrop-blur-sm "
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
export default function HeroSection() {
  return (
    <section className="mx-auto pt-25 max-w-7xl px-4 py-12">
      <div className="grid min-h-105 grid-cols-1 gap-8 md:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col justify-center gap-5">
          <Badge className="w-fit rounded-full bg-primary/20 px-4 py-1 text-xs font-semibold text-primary">
            Tươi Sạch Mỗi Ngày
          </Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-5xl">
            Thực phẩm sạch <br />
            <span className="text-primary">tận cửa nhà</span> bạn
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Rau củ quả, thịt cá tươi ngon — thu hoạch buổi sáng, giao tận tay
            buổi chiều. Không lo nguồn gốc, không lo chất lượng.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className=" px-7" asChild>
              <Link to="/shop">
                Mua ngay <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-7" asChild>
              <Link to="/about">Tìm hiểu thêm</Link>
            </Button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="h-95 md:h-auto">
          <HeroSlider />
        </div>
      </div>
    </section>
  );
}
