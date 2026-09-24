import { forwardRef, useId } from 'react'

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select...', className = '', ...props },
  ref
) {
  const id = useId()

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`
          select-field
          text-xs
          ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500 font-mono">{error}</p>
      )}
    </div>
  )
})

export default Select
