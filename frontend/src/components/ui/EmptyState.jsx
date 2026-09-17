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
        <div className="w-16 h-16 rounded-4xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
          <Icon size={28} className="text-zinc-400 dark:text-zinc-500" weight="light" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">{description}</p>
      {action}
    </motion.div>
  )
}
