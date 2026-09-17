import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Phone, EnvelopeSimple, CalendarBlank, Notepad, CheckSquare, PencilSimple, Trash, Lightning } from '@phosphor-icons/react'
import api from '../utils/api'
import { ACTIVITY_TYPES, getStageColor, getStageLabel, formatRelativeDate } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'

const typeIcons = {
  call: Phone,
  email: EnvelopeSimple,
  meeting: CalendarBlank,
  note: Notepad,
  task: CheckSquare,
}

const defaultForm = { type: 'call', subject: '', body: '', contact_id: '', deal_id: '', due_date: '' }

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchActivities = useCallback(async () => {
    try {
      const params = filterType ? { type: filterType } : {}
      const res = await api.get('/v1/activities', { params })
      setActivities(res.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        type: formData.type,
        subject: formData.subject,
        body: formData.body || null,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : null,
        deal_id: formData.deal_id ? parseInt(formData.deal_id) : null,
        due_date: formData.due_date || null,
      }
      if (editingActivity) {
        await api.put(`/v1/activities/${editingActivity.id}`, payload)
      } else {
        await api.post('/v1/activities', payload)
      }
      setShowModal(false)
      setEditingActivity(null)
      setFormData(defaultForm)
      fetchActivities()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return
    try {
      await api.delete(`/v1/activities/${id}`)
      fetchActivities()
    } catch {
      // silent
    }
  }

  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setFormData({
      type: activity.type || 'call',
      subject: activity.subject || '',
      body: activity.body || '',
      contact_id: activity.contact_id || '',
      deal_id: activity.deal_id || '',
      due_date: activity.due_date ? activity.due_date.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingActivity(null)
    setFormData(defaultForm)
    setShowModal(true)
  }

  if (loading) return <CardSkeleton count={4} />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Activities</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{activities.length} activities logged</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" />
          New Activity
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[160px]"
        >
          <option value="">All Types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Activity cards */}
      {activities.length === 0 ? (
        <EmptyState
          icon={Lightning}
          title="No activities yet"
          description="Log your first activity to start tracking interactions."
          action={<Button onClick={openNew}><Plus size={16} weight="bold" />Add Activity</Button>}
        />
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => {
            const Icon = typeIcons[a.type] || Lightning
            const color = getStageColor(ACTIVITY_TYPES, a.type)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-5 flex items-start gap-4 hover:shadow-diffusion-lg transition-shadow duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-${color}-50 dark:bg-${color}-900/30`}>
                  <Icon size={18} className={`text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={color} dot>
                      {getStageLabel(ACTIVITY_TYPES, a.type)}
                    </Badge>
                    {a.due_date && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatRelativeDate(a.due_date)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50 truncate">{a.subject}</h3>
                  {a.body && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{a.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {a.contact_id && <span>Contact #{a.contact_id}</span>}
                    {a.deal_id && <span>Deal #{a.deal_id}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingActivity ? 'Edit Activity' : 'New Activity'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-950 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Contact ID"
              type="number"
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
            />
            <Input
              label="Deal ID"
              type="number"
              value={formData.deal_id}
              onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
            />
          </div>
          <Input
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Body</label>
            <textarea
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {editingActivity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
