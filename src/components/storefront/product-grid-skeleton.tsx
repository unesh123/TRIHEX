export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-[var(--border)] bg-white"
        >
          <div className="aspect-square bg-[var(--surface-muted)]" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-[var(--surface-muted)]" />
            <div className="h-4 w-4/5 rounded bg-[var(--surface-muted)]" />
            <div className="h-3 w-2/3 rounded bg-[var(--surface-muted)]" />
            <div className="mt-3 h-8 w-full rounded-lg bg-[var(--surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
