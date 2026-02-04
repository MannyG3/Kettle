export default function KettlesLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded bg-charcoal-light" />
          <div className="h-8 w-48 rounded bg-charcoal-light" />
          <div className="h-4 w-32 rounded bg-charcoal-light" />
        </div>
        <div className="h-8 w-24 rounded-full bg-charcoal-light" />
      </div>

      {/* Stats bar skeleton */}
      <div className="glass-strong flex items-center justify-between rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 rounded bg-charcoal-light mb-1" />
              <div className="h-3 w-16 rounded bg-charcoal-light" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-strong rounded-2xl border border-white/10 p-5 space-y-4"
          >
            <div className="space-y-2">
              <div className="h-6 w-32 rounded bg-charcoal-light" />
              <div className="h-4 w-full rounded bg-charcoal-light" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-20 rounded bg-charcoal-light" />
              <div className="h-2 w-full rounded-full bg-charcoal-light" />
            </div>
            <div className="flex justify-between border-t border-white/5 pt-3">
              <div className="h-3 w-16 rounded bg-charcoal-light" />
              <div className="h-3 w-20 rounded bg-charcoal-light" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
