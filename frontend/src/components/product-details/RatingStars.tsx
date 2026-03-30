import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function RatingStars({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}
