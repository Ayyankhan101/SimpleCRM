import { AltArrowLeftIcon, AltArrowRightIcon } from '@solar-icons/react/linear'

export default function Pagination({ page, totalPages, total, perPage, onPageChange }) {
  if (totalPages <= 1) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-glassfin-secondary/8 dark:border-glassfin-neutral/8">
      <span className="text-xs font-mono text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <AltArrowLeftIcon size={14} />
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="min-w-[28px] h-7 text-xs font-mono rounded-lg text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-xs text-glassfin-secondary/30 dark:text-glassfin-neutral/30 px-1">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[28px] h-7 text-xs font-mono rounded-lg transition-colors ${
              p === page
                ? 'bg-glassfin-primary text-white'
                : 'text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12'
            }`}
          >
            {p}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-xs text-glassfin-secondary/30 dark:text-glassfin-neutral/30 px-1">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="min-w-[28px] h-7 text-xs font-mono rounded-lg text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <AltArrowRightIcon size={14} />
        </button>
      </div>
    </div>
  )
}
