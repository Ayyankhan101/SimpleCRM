export function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton ${className}`} />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg overflow-hidden" style={{ borderRadius: 0 }}>
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
        <div key={i} className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-8" style={{ borderRadius: 0 }}>
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
        <div key={i} className="p-6 border-t-2 border-carga-secondary/10 dark:border-carga-primary/10">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
