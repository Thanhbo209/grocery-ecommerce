export function CardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex justify-between">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
