export function OrderSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-card p-4 space-y-3"
        >
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
