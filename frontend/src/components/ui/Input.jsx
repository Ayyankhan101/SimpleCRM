import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-display font-medium text-carga-secondary dark:text-carga-primary tracking-widest uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5 border bg-carga-primary/30 dark:bg-carga-neutral/30
          text-carga-secondary dark:text-carga-primary font-mono text-xs
          placeholder:text-carga-secondary/40 dark:placeholder:text-carga-primary/40
          focus:outline-none focus:ring-2 focus:ring-carga-tertiary/50 focus:border-carga-secondary
          transition-all duration-200
          ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-carga-secondary/30 dark:border-carga-primary/20'}
          ${className}
        `}
        style={{ borderRadius: 0 }}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
    </div>
  )
})

export default Input
