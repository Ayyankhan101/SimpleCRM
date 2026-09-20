import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-carga-secondary text-carga-primary hover:opacity-90 border border-carga-secondary',
  secondary: 'bg-carga-primary/50 text-carga-secondary hover:bg-carga-primary/70 border border-carga-secondary/20',
  ghost: 'text-carga-secondary hover:bg-carga-primary/50 border border-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 border border-red-500',
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
        font-display tracking-wide uppercase
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
