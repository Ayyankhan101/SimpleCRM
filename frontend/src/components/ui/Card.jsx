import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        bg-white rounded-4xl border border-slate-200/50 shadow-diffusion
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
