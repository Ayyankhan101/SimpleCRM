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
      <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-12 text-center" style={{ borderRadius: 0 }}>
        <p className="text-carga-secondary/50 font-mono text-xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg overflow-hidden" style={{ borderRadius: 0 }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-carga-secondary/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-display font-medium text-carga-secondary/60 uppercase tracking-widest"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-carga-secondary/10">
            {data.map((row, i) => (
              <motion.tr
                key={row.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                onClick={() => onRowClick?.(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-carga-primary/30' : ''}
                  transition-colors duration-150
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-carga-secondary font-mono whitespace-nowrap">
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
