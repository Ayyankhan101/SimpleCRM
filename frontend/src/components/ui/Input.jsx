import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-zinc-800
          text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
          transition-all duration-200
          ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-600'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

export default Input
