export function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-4 rounded-2xl border border-border bg-card p-4 animate-pulse"
        >
          <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
          <div className="flex flex-1 flex-col justify-between">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
