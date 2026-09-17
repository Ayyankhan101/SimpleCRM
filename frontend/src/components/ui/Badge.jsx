const colorMap = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}

export default function Badge({ color = 'zinc', children, dot = false }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-xs font-medium ring-1 ring-inset
        ${colorMap[color] || colorMap.zinc}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      )}
      {children}
    </span>
  )
}
