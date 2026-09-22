import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlass, X, CurrencyCircleDollar } from '@phosphor-icons/react'
import api from '../utils/api'
import { formatCurrency } from '../lib/constants'

export default function DealPicker({ value, onChange }) {
  const [deals, setDeals] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    api.get('/v1/deals/').then((res) => {
      setDeals(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = deals.find((d) => String(d.id) === String(value))
  const filtered = deals.filter((d) => {
    if (!search) return true
    const q = search.toLowerCase()
    return d.title?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="block text-xs font-display font-medium text-carga-secondary dark:text-carga-primary tracking-widest uppercase">Deal</label>
      <div className="relative">
        {selected ? (
          <div className="flex items-center gap-2 w-full px-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-primary/30 dark:bg-carga-neutral/30 text-xs text-carga-secondary dark:text-carga-primary">
            <CurrencyCircleDollar size={14} className="text-carga-secondary/40 flex-shrink-0" />
            <span className="flex-1 truncate font-mono">{selected.title}</span>
            <span className="text-carga-secondary/40 dark:text-carga-primary/40 text-xs font-mono">{formatCurrency(selected.value)}</span>
            <button
              type="button"
              onClick={() => { onChange(''); setSearch('') }}
              className="p-1 text-carga-secondary/40 hover:text-carga-secondary hover:bg-carga-primary/50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carga-secondary/40" />
            <input
              type="text"
              placeholder={loading ? 'Loading deals...' : 'Search deals...'}
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
              className="w-full pl-9 pr-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-primary/30 dark:bg-carga-neutral/30 text-xs text-carga-secondary dark:text-carga-primary font-mono placeholder:text-carga-secondary/40 focus:outline-none focus:ring-2 focus:ring-carga-tertiary/50 focus:border-carga-secondary transition-all"
              style={{ borderRadius: 0 }}
            />
          </div>
        )}

        {open && !selected && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-primary dark:bg-carga-neutral shadow-carga-lg" style={{ borderRadius: 0 }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-carga-secondary/40 font-mono">
                {loading ? 'Loading...' : 'No deals found'}
              </div>
            ) : (
              filtered.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { onChange(String(d.id)); setSearch(''); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-carga-primary/50 transition-colors"
                >
                  <div className="w-7 h-7 bg-carga-primary/50 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 0 }}>
                    <CurrencyCircleDollar size={14} className="text-carga-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-carga-secondary dark:text-carga-primary truncate">
                      {d.title}
                    </div>
                    <div className="text-xs text-carga-secondary/40 dark:text-carga-primary/40 font-mono truncate">{formatCurrency(d.value)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
