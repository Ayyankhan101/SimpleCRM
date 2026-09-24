import { useState, useEffect, useRef } from 'react'
import { MagnifierIcon, CloseIcon, UserIcon } from '@solar-icons/react/linear'
import api from '../utils/api'

export default function ContactPicker({ value, onChange }) {
  const [contacts, setContacts] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    api.get('/v1/contacts/', { params: { per_page: 9999 } }).then((res) => {
      const data = res.data.items || res.data || []
      setContacts(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = contacts.find((c) => String(c.id) === String(value))
  const filtered = contacts.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase">Contact</label>
      <div className="relative">
        {selected ? (
          <div className="flex items-center gap-2 w-full px-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-xs text-glassfin-secondary dark:text-glassfin-neutral rounded-xl">
            <UserIcon size={14} className="text-glassfin-secondary/40 dark:text-glassfin-neutral/40 flex-shrink-0" />
            <span className="flex-1 truncate font-mono">{selected.first_name} {selected.last_name}</span>
            {selected.company && <span className="text-glassfin-secondary/40 dark:text-glassfin-neutral/40 text-xs font-mono">{selected.company}</span>}
            <button
              type="button"
              onClick={() => { onChange(''); setSearch('') }}
              className="p-1 text-glassfin-secondary/40 hover:text-glassfin-secondary hover:bg-glassfin-primary/10 dark:hover:text-glassfin-neutral dark:hover:bg-glassfin-primary/15 rounded-full transition-colors"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifierIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-glassfin-secondary/40 dark:text-glassfin-neutral/40" />
            <input
              type="text"
              placeholder={loading ? 'Loading contacts...' : 'Search contacts...'}
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
              className="w-full pl-9 pr-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-xs text-glassfin-secondary dark:text-glassfin-neutral font-mono placeholder:text-glassfin-secondary/40 dark:placeholder:text-glassfin-neutral/35 focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary transition-all rounded-xl"
            />
          </div>
        )}

        {open && !selected && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral dark:bg-glassfin-secondary shadow-glass rounded-xl">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-glassfin-secondary/40 dark:text-glassfin-neutral/40 font-mono">
                {loading ? 'Loading...' : 'No contacts found'}
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(String(c.id)); setSearch(''); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-glassfin-primary/8 dark:hover:bg-glassfin-primary/12 transition-colors"
                >
                  <div className="w-7 h-7 bg-glassfin-primary/12 dark:bg-glassfin-primary/18 flex items-center justify-center flex-shrink-0 rounded-full">
                    <span className="text-xs font-display text-glassfin-secondary dark:text-glassfin-neutral">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-glassfin-secondary dark:text-glassfin-neutral truncate">
                      {c.first_name} {c.last_name}
                    </div>
                    {c.company && (
                      <div className="text-xs text-glassfin-secondary/40 dark:text-glassfin-neutral/40 font-mono truncate">{c.company}</div>
                    )}
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
