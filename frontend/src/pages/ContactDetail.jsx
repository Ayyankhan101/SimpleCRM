import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, PencilSimple, Trash, Plus, CurrencyCircleDollar, Lightning, EnvelopeSimple, Phone, Buildings, CalendarBlank } from '@phosphor-icons/react'
import api from '../utils/api'
import { CONTACT_STAGES, DEAL_STAGES, ACTIVITY_TYPES, getStageColor, getStageLabel, formatCurrency, formatRelativeDate } from '../lib/constants'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContact()
  }, [id])

  const fetchContact = async () => {
    try {
      const res = await api.get(`/v1/contacts/${id}`)
      setContact(res.data)
    } catch {
      navigate('/contacts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this contact?')) return
    try {
      await api.delete(`/v1/contacts/${id}`)
      navigate('/contacts')
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!contact) return null

  const totalDealValue = (contact.deals || []).reduce((sum, d) => sum + (d.value || 0), 0)
  const wonDealValue = (contact.deals || [])
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.value || 0), 0)
  const openDeals = (contact.deals || []).filter(d => !['closed_won', 'closed_lost'].includes(d.stage))

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Back + actions */}
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <Link
          to="/contacts"
          className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Contacts
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/contacts`}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <PencilSimple size={16} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash size={16} />
          </button>
        </div>
      </motion.div>

      {/* Header card */}
      <motion.div variants={item} className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {contact.first_name?.[0]}{contact.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {contact.first_name} {contact.last_name}
              </h1>
              <Badge color={getStageColor(CONTACT_STAGES, contact.stage)} dot>
                {getStageLabel(CONTACT_STAGES, contact.stage)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              {contact.email && (
                <span className="flex items-center gap-1.5">
                  <EnvelopeSimple size={14} className="text-zinc-400 dark:text-zinc-500" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-zinc-400 dark:text-zinc-500" />
                  {contact.phone}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1.5">
                  <Buildings size={14} className="text-zinc-400 dark:text-zinc-500" />
                  {contact.company}
                </span>
              )}
              {contact.role && (
                <span className="text-zinc-400 dark:text-zinc-500">{contact.role}</span>
              )}
            </div>
            {contact.notes && (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{contact.notes}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Score</div>
            <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-zinc-50">{contact.score || 0}</div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-5">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Total Deals</div>
          <div className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">{(contact.deals || []).length}</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{formatCurrency(totalDealValue)} pipeline</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-5">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Won Value</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(wonDealValue)}</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{(contact.deals || []).filter(d => d.stage === 'closed_won').length} deals closed</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-5">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Activities</div>
          <div className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">{(contact.activities || []).length}</div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{(contact.activities || []).filter(a => !a.completed).length} pending</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Deals — 3 cols */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <CurrencyCircleDollar size={16} className="text-emerald-500" />
              Deals ({openDeals.length} open)
            </h2>
          </div>
          {(contact.deals || []).length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-12 text-center">
              <CurrencyCircleDollar size={28} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No deals yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.deals.map((deal) => (
                <Link
                  key={deal.id}
                  to="/deals"
                  className="block bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-5 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{deal.title}</span>
                    <Badge color={getStageColor(DEAL_STAGES, deal.stage)} dot>
                      {getStageLabel(DEAL_STAGES, deal.stage)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-50">{formatCurrency(deal.value)}</span>
                    {deal.expected_close_date && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <CalendarBlank size={12} />
                        {deal.expected_close_date}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activities — 2 cols */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Lightning size={16} className="text-amber-500" />
              Activities
            </h2>
          </div>
          {(contact.activities || []).length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-12 text-center">
              <Lightning size={28} className="text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.activities.map((activity) => {
                const typeColor = getStageColor(ACTIVITY_TYPES, activity.type)
                return (
                  <div
                    key={activity.id}
                    className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-4 ${activity.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge color={typeColor} dot>
                        {getStageLabel(ACTIVITY_TYPES, activity.type)}
                      </Badge>
                      {activity.due_date && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {formatRelativeDate(activity.due_date)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium text-zinc-950 dark:text-zinc-50 ${activity.completed ? 'line-through' : ''}`}>
                      {activity.subject}
                    </p>
                    {activity.deal_title && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Deal: {activity.deal_title}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
