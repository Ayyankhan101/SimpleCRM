import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 bg-carga-primary/50 dark:bg-carga-neutral/50 flex items-center justify-center mb-6" style={{ borderRadius: 0 }}>
          <Icon size={28} className="text-carga-secondary/40 dark:text-carga-primary/40" weight="light" />
        </div>
      )}
      <h3 className="text-lg font-display font-semibold tracking-wide uppercase text-carga-secondary dark:text-carga-primary mb-2">{title}</h3>
      <p className="text-xs text-carga-secondary/50 dark:text-carga-primary/50 font-mono max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  )
}
