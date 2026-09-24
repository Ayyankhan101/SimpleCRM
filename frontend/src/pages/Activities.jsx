import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { AddCircleIcon, PhoneIcon, LetterIcon, CalendarIcon, NotesIcon, CheckSquareIcon, PenIcon, TrashBinMinimalisticIcon, LightningIcon, CheckCircleIcon, EyeIcon, MouseCircleIcon } from '@solar-icons/react/linear'
import api from '../utils/api'
import { ACTIVITY_TYPES, getStageColor, getStageLabel, formatRelativeDate } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import ContactPicker from '../components/ContactPicker'
import DealPicker from '../components/DealPicker'
import { useToast } from '../components/ui/Toast'

const typeIcons = {
  call: PhoneIcon,
  email: LetterIcon,
  meeting: CalendarIcon,
  note: NotesIcon,
  task: CheckSquareIcon,
}

const typeColors = {
  zinc: { bg: 'bg-zinc-50 dark:bg-zinc-900/30', text: 'text-zinc-600 dark:text-zinc-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
}

const defaultForm = { type: 'call', subject: '', body: '', contact_id: '', deal_id: '', due_date: '' }

export default function Activities() {
  const { toast } = useToast()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchActivities = useCallback(async () => {
    try {
      const params = filterType ? { type: filterType } : {}
      const res = await api.get('/v1/activities/', { params })
      setActivities(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [filterType, toast])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
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
        await api.post('/v1/activities/', payload)
      }
      setShowModal(false)
      setEditingActivity(null)
      setFormData(defaultForm)
      fetchActivities()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save activity')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/v1/activities/${id}`)
      fetchActivities()
      toast.success('Activity deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete activity')
    }
  }

  const handleToggleComplete = async (activity) => {
    try {
      await api.put(`/v1/activities/${activity.id}`, { completed: !activity.completed })
      fetchActivities()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update activity')
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
    setError('')
  }

  const openNew = () => {
    setEditingActivity(null)
    setFormData(defaultForm)
    setShowModal(true)
    setError('')
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="glass p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 w-1/3 rounded-lg" />
              <div className="h-3 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 w-1/2 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-glassfin-secondary dark:text-glassfin-neutral tracking-tight">Activities</h1>
          <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">{activities.length} activities logged</p>
        </div>
        <Button onClick={openNew}>
          <AddCircleIcon size={16} />
          New Activity
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          placeholder="All Types"
          className="min-w-[160px]"
        />
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={LightningIcon}
          title="No activities yet"
          description="Log your first activity to start tracking interactions."
          action={<Button onClick={openNew}><AddCircleIcon size={16} />Add Activity</Button>}
        />
      ) : (
        <div className="space-y-3">
          {activities.map((a, i) => {
            const Icon = typeIcons[a.type] || LightningIcon
            const colorKey = getStageColor(ACTIVITY_TYPES, a.type)
            const colors = typeColors[colorKey] || typeColors.zinc
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`glass p-5 flex items-start gap-4 hover:shadow-glass-lg transition-shadow duration-200 border-l-4 ${
                  a.is_overdue ? 'border-l-red-500' : a.is_due_today ? 'border-l-amber-500' : 'border-l-transparent'
                } ${a.completed ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => handleToggleComplete(a)}
                  aria-label={a.completed ? 'Mark incomplete' : 'Mark complete'}
                  className={`mt-0.5 w-6 h-6 border-2 flex items-center justify-center flex-shrink-0 transition-colors rounded-full ${
                    a.completed
                      ? 'bg-glassfin-secondary border-glassfin-secondary text-glassfin-neutral'
                      : 'border-glassfin-secondary/30 dark:border-glassfin-neutral/30 hover:border-glassfin-secondary dark:hover:border-glassfin-neutral'
                  }`}
                >
                  {a.completed && <CheckCircleIcon size={12} />}
                </button>
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${colors.bg} rounded-xl`}>
                  <Icon size={18} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={colorKey} dot>
                      {getStageLabel(ACTIVITY_TYPES, a.type)}
                    </Badge>
                    {a.is_overdue && !a.completed && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full">OVERDUE</span>
                    )}
                    {a.is_due_today && !a.completed && !a.is_overdue && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full">DUE TODAY</span>
                    )}
                    {a.due_date && (
                      <span className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">
                        {formatRelativeDate(a.due_date)}
                      </span>
                    )}
                  </div>
                  <h3 className={`text-sm font-medium font-display text-glassfin-secondary dark:text-glassfin-neutral truncate ${a.completed ? 'line-through' : ''}`}>{a.subject}</h3>
                  {a.body && (
                    <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1 line-clamp-2">{a.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">
                    {a.contact_name && <span>Contact: {a.contact_name}</span>}
                    {a.deal_title && <span>Deal: {a.deal_title}</span>}
                    {a.type === 'email' && a.email_opened_at && (
                      <span className="inline-flex items-center gap-1 text-glassfin-secondary dark:text-glassfin-neutral">
                        <EyeIcon size={12} />
                        Opened
                      </span>
                    )}
                    {a.type === 'email' && a.email_clicked_at && (
                      <span className="inline-flex items-center gap-1 text-glassfin-primary">
                        <MouseCircleIcon size={12} />
                        Clicked
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2 text-glassfin-secondary/50 hover:text-glassfin-secondary dark:text-glassfin-neutral/50 dark:hover:text-glassfin-neutral hover:bg-glassfin-neutral/40 dark:hover:bg-glassfin-secondary/40 transition-colors rounded-full"
                  >
                    <PenIcon size={15} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(a)}
                    className="p-2 text-glassfin-secondary/50 hover:text-red-600 hover:bg-red-50 dark:text-glassfin-neutral/50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors rounded-full"
                  >
                    <TrashBinMinimalisticIcon size={15} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingActivity ? 'Edit Activity' : 'New Activity'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 rounded-xl">
              {error}
            </div>
          )}
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <Input
            label="Due Date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <ContactPicker
            value={formData.contact_id}
            onChange={(id) => setFormData({ ...formData, contact_id: id || '' })}
          />
          <DealPicker
            value={formData.deal_id}
            onChange={(id) => setFormData({ ...formData, deal_id: id || '' })}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase">Body</label>
            <textarea
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-sm text-glassfin-secondary dark:text-glassfin-neutral placeholder:text-glassfin-secondary/30 dark:placeholder:text-glassfin-neutral/30 focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary transition-all resize-none font-mono rounded-xl"
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

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null) }}
        title="Delete Activity"
        message={`Delete "${confirmDelete?.subject}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
