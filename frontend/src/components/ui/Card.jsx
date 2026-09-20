import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        bg-carga-surface dark:bg-carga-surface-dark
        border border-carga-secondary dark:border-carga-primary/20
        shadow-carga-lg
        ${className}
      `}
      style={{ borderRadius: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
