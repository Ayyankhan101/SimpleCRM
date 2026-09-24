import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DangerTriangleIcon } from '@solar-icons/react/linear'
import Button from './Button'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  danger = false,
  loading = false,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-glassfin-secondary/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-sm glass overflow-hidden pointer-events-auto"
            >
              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center gap-3 mb-3">
                  {danger && (
                    <div className="w-10 h-10 bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center rounded-full flex-shrink-0">
                      <DangerTriangleIcon size={20} className="text-red-500" />
                    </div>
                  )}
                  <h2 className="text-lg font-display font-semibold tracking-wide uppercase text-glassfin-secondary dark:text-glassfin-neutral">
                    {title}
                  </h2>
                </div>
                <p className="text-sm text-glassfin-secondary/60 dark:text-glassfin-neutral/60 font-mono">
                  {message}
                </p>
              </div>
              <div className="px-8 pb-6 pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant={danger ? 'danger' : 'primary'}
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
