export function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton ${className}`} />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion overflow-hidden">
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-8">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border-t-2 border-zinc-100 dark:border-zinc-800">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
