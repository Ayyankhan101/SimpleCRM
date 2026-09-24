import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-glassfin-secondary text-glassfin-neutral hover:opacity-90 border-0 dark:bg-glassfin-neutral dark:text-glassfin-secondary',
  secondary: 'bg-glassfin-primary/10 text-glassfin-secondary hover:bg-glassfin-primary/20 border border-glassfin-secondary/15 dark:bg-glassfin-primary/15 dark:text-glassfin-neutral dark:hover:bg-glassfin-primary/25 dark:border-glassfin-neutral/15',
  ghost: 'text-glassfin-secondary hover:bg-glassfin-primary/8 border border-transparent dark:text-glassfin-neutral dark:hover:bg-glassfin-primary/12',
  danger: 'bg-red-500 text-white hover:bg-red-600 border-0',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-glassfin-primary/50 focus-visible:outline-offset-2
        font-display tracking-wide uppercase
        rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
})

export default Button
