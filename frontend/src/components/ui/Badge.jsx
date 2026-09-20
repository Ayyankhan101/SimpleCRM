export default function Badge({ color = '#71717a', children, dot = false }) {
  const isLight = color === '#E2F4CB' || color === '#F0E5C5' || color === '#a8a29e'
  const textColor = isLight ? '#332B1C' : color === '#ef4444' ? '#fff' : '#F0E5C5'
  const bgColor = color === '#ef4444' ? color : `${color}22`

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium font-display tracking-wide uppercase"
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
