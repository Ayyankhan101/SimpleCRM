import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { CheckCircleIcon, CloseIcon, LetterIcon } from '@solar-icons/react/linear'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, variant = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, variant, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  }), [addToast])

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const icons = {
  success: CheckCircleIcon,
  error: CloseIcon,
  info: LetterIcon,
}

const iconColors = {
  success: 'text-glassfin-tertiary',
  error: 'text-red-500',
  info: 'text-glassfin-primary',
}

function ToastItem({ toast: t, onRemove }) {
  const Icon = icons[t.variant] || LetterIcon
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (t.duration > 0) {
      const timer = setTimeout(() => setExiting(true), t.duration - 200)
      return () => clearTimeout(timer)
    }
  }, [t.duration])

  return (
    <div
      className={`toast toast-${t.variant}`}
      style={{ animation: exiting ? 'toast-out 0.2s ease forwards' : undefined }}
    >
      <Icon size={18} className={iconColors[t.variant] || iconColors.info} />
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => onRemove(t.id)}
        className="p-1 rounded-full hover:bg-glassfin-secondary/10 dark:hover:bg-glassfin-neutral/10 transition-colors"
        aria-label="Dismiss"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  )
}
