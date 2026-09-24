import { forwardRef, useId } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        aria-describedby={errorId}
        aria-invalid={error ? 'true' : undefined}
        className={`
          w-full px-4 py-2.5 border bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40
          text-glassfin-secondary dark:text-glassfin-neutral font-mono text-xs
          placeholder:text-glassfin-secondary/40 dark:placeholder:text-glassfin-neutral/35
          focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary
          transition-all duration-200 rounded-xl
          ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-glassfin-secondary/15 dark:border-glassfin-neutral/12'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500 font-mono" role="alert">{error}</p>
      )}
    </div>
  )
})

export default Input
