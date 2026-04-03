import type { Step } from "@/types/check-out";
import { CheckCircle2, MapPin } from "lucide-react";

export function StepBar({ current }: { current: Step }) {
  const steps = [
    { key: "address", label: "Địa chỉ", icon: <MapPin size={14} /> },
    { key: "review", label: "Xác nhận", icon: <CheckCircle2 size={14} /> },
  ] as const;

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done = step.key === "address" && current === "review";
        const active = step.key === current;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white"
                  : done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.icon}
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 transition-colors ${current === "review" ? "bg-emerald-400" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
