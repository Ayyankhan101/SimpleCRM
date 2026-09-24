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
      <div className="glass p-12 text-center">
        <p className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono text-xs">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glassfin-secondary/10 dark:border-glassfin-neutral/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-display font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-widest"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-glassfin-secondary/5 dark:divide-glassfin-neutral/5">
            {data.map((row, i) => (
              <motion.tr
                key={row.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                onClick={() => onRowClick?.(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer hover:bg-glassfin-primary/5 dark:hover:bg-glassfin-primary/8' : ''}
                  transition-colors duration-150
                `}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-glassfin-secondary dark:text-glassfin-neutral font-mono whitespace-nowrap">
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
