import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-carga-neutral/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`relative w-full ${maxWidth} bg-carga-primary dark:bg-carga-neutral shadow-carga-lg border border-carga-secondary dark:border-carga-primary/20 overflow-hidden pointer-events-auto`}
              style={{ borderRadius: 0 }}
            >
              <div className="flex items-center justify-between px-8 pt-6 pb-2">
                <h2 className="text-lg font-display font-semibold tracking-wide uppercase text-carga-secondary dark:text-carga-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-carga-secondary/50 hover:text-carga-secondary hover:bg-carga-primary/50 dark:hover:bg-carga-neutral/50 transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
              <div className="px-8 pb-6 pt-2">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
