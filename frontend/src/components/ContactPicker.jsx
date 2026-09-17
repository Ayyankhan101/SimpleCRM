import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlass, X, User } from '@phosphor-icons/react'
import api from '../utils/api'

export default function ContactPicker({ value, onChange }) {
  const [contacts, setContacts] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    api.get('/v1/contacts').then((res) => {
      setContacts(res.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = contacts.find((c) => c.id === Number(value))
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
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Contact</label>
      <div className="relative">
        {selected ? (
          <div className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-950 dark:text-zinc-50">
            <User size={14} className="text-zinc-400 flex-shrink-0" />
            <span className="flex-1 truncate">{selected.first_name} {selected.last_name}</span>
            {selected.company && <span className="text-zinc-400 dark:text-zinc-500 text-xs">{selected.company}</span>}
            <button
              type="button"
              onClick={() => { onChange(null); setSearch('') }}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={loading ? 'Loading contacts...' : 'Search contacts...'}
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        )}

        {open && !selected && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 shadow-diffusion-lg">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                {loading ? 'Loading...' : 'No contacts found'}
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.id); setSearch(''); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-950 dark:text-zinc-50 truncate">
                      {c.first_name} {c.last_name}
                    </div>
                    {c.company && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{c.company}</div>
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
