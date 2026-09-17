import { motion } from 'framer-motion'

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export default function Table({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-4xl border border-slate-200/50 shadow-diffusion p-12 text-center">
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-4xl border border-slate-200/50 shadow-diffusion overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.map((row, i) => (
              <motion.tr
                key={row.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                onClick={() => onRowClick?.(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-zinc-50/50' : ''}
                  transition-colors duration-150
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-zinc-700 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
