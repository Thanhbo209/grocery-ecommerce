// ─── Quantity Selector ────────────────────────────────────────────────────────

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0 rounded-xl border border-border overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Minus size={15} />
      </button>
      <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
