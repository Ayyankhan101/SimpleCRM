import { useTheme } from '../../context/ThemeContext'

export default function Badge({ color = '#71717a', children, dot = false }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const isLightColor = color === '#2F9078' || color === '#E0714A' || color === '#a8a29e'
  const textColor = isDark
    ? '#FFF6F1'
    : isLightColor
      ? '#FFF6F1'
      : color === '#ef4444'
        ? '#fff'
        : '#123029'
  const bgColor = isDark
    ? `${color}30`
    : color === '#ef4444'
      ? color
      : `${color}22`

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-display tracking-wide uppercase rounded-full"
      style={{
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${color}44`,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  )
}
