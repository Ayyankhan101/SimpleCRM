import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AltArrowLeftIcon, PenIcon, TrashBinMinimalisticIcon, AddCircleIcon, DollarIcon, LightningIcon, LetterIcon, PhoneIcon, BuildingsIcon, CalendarIcon, CheckCircleIcon, CloseIcon, EyeIcon, MouseCircleIcon } from '@solar-icons/react/linear'
import api from '../utils/api'
import { CONTACT_STAGES, DEAL_STAGES, ACTIVITY_TYPES, getStageColor, getStageLabel, formatCurrency, formatRelativeDate } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../components/ui/Toast'

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
  const { toast } = useToast()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      setEmailError('Subject and body required')
      return
    }
    setSendingEmail(true)
    setEmailError('')
    try {
      await api.post('/v1/emails/send', {
        contact_id: contact.id,
        subject: emailForm.subject,
        body: emailForm.body,
      })
      setShowEmailModal(false)
      setEmailForm({ subject: '', body: '' })
      fetchContact()
      toast.success('Email sent')
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Failed to send')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/v1/contacts/${id}`)
      toast.success('Contact deleted')
      navigate('/contacts')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete contact')
    }
  }

  const openEdit = () => {
    setFormData({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      role: contact.role || '',
      stage: contact.stage || 'lead',
      score: contact.score || 0,
      notes: contact.notes || '',
    })
    setEditing(true)
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/v1/contacts/${id}`, formData)
      await fetchContact()
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">Loading...</div>
      </div>
    )
  }

  if (!contact) return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mb-4">Contact not found</p>
      <a href="/contacts" className="text-sm font-medium text-glassfin-secondary dark:text-glassfin-neutral hover:underline">
        Back to Contacts
      </a>
    </div>
  )

  const totalDealValue = (contact.deals || []).reduce((sum, d) => sum + (d.value || 0), 0)
  const wonDealValue = (contact.deals || [])
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.value || 0), 0)
  const openDeals = (contact.deals || []).filter(d => !['closed_won', 'closed_lost'].includes(d.stage))

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <Link
          to="/contacts"
          className="flex items-center gap-2 text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 hover:text-glassfin-secondary dark:hover:text-glassfin-neutral transition-colors"
        >
          <AltArrowLeftIcon size={16} />
          Contacts
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmailModal(true)}
            className="p-2 text-glassfin-secondary/50 hover:text-glassfin-secondary hover:bg-glassfin-tertiary/15 dark:hover:text-glassfin-neutral dark:hover:bg-glassfin-primary/12 transition-colors rounded-full"
          >
            <LetterIcon size={16} />
          </button>
          <button
            onClick={openEdit}
            className="p-2 text-glassfin-secondary/50 hover:text-glassfin-secondary hover:bg-glassfin-secondary/8 dark:hover:text-glassfin-neutral dark:hover:bg-glassfin-primary/12 transition-colors rounded-full"
          >
            <PenIcon size={16} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 text-glassfin-secondary/50 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors rounded-full"
          >
            <TrashBinMinimalisticIcon size={16} />
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="glass p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-16 h-16 bg-glassfin-secondary flex items-center justify-center flex-shrink-0 rounded-2xl">
            <span className="text-glassfin-neutral text-2xl font-bold">
              {contact.first_name?.[0]}{contact.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold font-display text-glassfin-secondary dark:text-glassfin-neutral tracking-tight">
                {contact.first_name} {contact.last_name}
              </h1>
              <Badge color={getStageColor(CONTACT_STAGES, contact.stage)} dot>
                {getStageLabel(CONTACT_STAGES, contact.stage)}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
              {contact.email && (
                <span className="flex items-center gap-1.5">
                  <LetterIcon size={14} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1.5">
                  <PhoneIcon size={14} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />
                  {contact.phone}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1.5">
                  <BuildingsIcon size={14} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />
                  {contact.company}
                </span>
              )}
              {contact.role && (
                <span className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50">{contact.role}</span>
              )}
            </div>
            {contact.notes && (
              <p className="mt-3 text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 leading-relaxed">{contact.notes}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-display text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider mb-1">Score</div>
            <div className="text-2xl font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">{contact.score || 0}</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass p-5">
          <div className="text-xs font-display font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider mb-1">Total Deals</div>
          <div className="text-xl font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">{(contact.deals || []).length}</div>
          <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">{formatCurrency(totalDealValue)} pipeline</div>
        </div>
        <div className="glass p-5">
          <div className="text-xs font-display font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider mb-1">Won Value</div>
          <div className="text-xl font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">{formatCurrency(wonDealValue)}</div>
          <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">{(contact.deals || []).filter(d => d.stage === 'closed_won').length} deals closed</div>
        </div>
        <div className="glass p-5">
          <div className="text-xs font-display font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider mb-1">Activities</div>
          <div className="text-xl font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">{(contact.activities || []).length}</div>
          <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">{(contact.activities || []).filter(a => !a.completed).length} pending</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div variants={item} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral flex items-center gap-2">
              <DollarIcon size={16} className="text-glassfin-secondary dark:text-glassfin-neutral" />
              Deals ({openDeals.length} open)
            </h2>
          </div>
          {(contact.deals || []).length === 0 ? (
            <div className="glass p-12 text-center">
              <DollarIcon size={28} className="text-glassfin-secondary/30 dark:text-glassfin-neutral/30 mx-auto mb-3" />
              <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">No deals yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.deals.map((deal) => (
                <div
                  key={deal.id}
                  className="glass p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium font-display text-glassfin-secondary dark:text-glassfin-neutral">{deal.title}</span>
                    <Badge color={getStageColor(DEAL_STAGES, deal.stage)} dot>
                      {getStageLabel(DEAL_STAGES, deal.stage)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono font-semibold text-glassfin-secondary dark:text-glassfin-neutral">{formatCurrency(deal.value)}</span>
                    {deal.expected_close_date && (
                      <span className="flex items-center gap-1 text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
                        <CalendarIcon size={12} />
                        {formatRelativeDate(deal.expected_close_date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral flex items-center gap-2">
              <LightningIcon size={16} className="text-glassfin-primary" />
              Activities
            </h2>
          </div>
          {(contact.activities || []).length === 0 ? (
            <div className="glass p-12 text-center">
              <LightningIcon size={28} className="text-glassfin-secondary/30 dark:text-glassfin-neutral/30 mx-auto mb-3" />
              <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">No activities yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.activities.map((activity) => {
                const typeColor = getStageColor(ACTIVITY_TYPES, activity.type)
                return (
                  <div
                    key={activity.id}
                    className={`glass p-4 ${activity.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge color={typeColor} dot>
                        {getStageLabel(ACTIVITY_TYPES, activity.type)}
                      </Badge>
                      {activity.due_date && (
                        <span className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
                          {formatRelativeDate(activity.due_date)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-medium font-display text-glassfin-secondary dark:text-glassfin-neutral ${activity.completed ? 'line-through' : ''}`}>
                      {activity.subject}
                    </p>
                    {activity.deal_title && (
                      <p className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">Deal: {activity.deal_title}</p>
                    )}
                    {activity.type === 'email' && (activity.email_opened_at || activity.email_clicked_at) && (
                      <div className="flex items-center gap-3 mt-2">
                        {activity.email_opened_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-glassfin-tertiary">
                            <EyeIcon size={12} />
                            Opened {formatRelativeDate(activity.email_opened_at)}
                          </span>
                        )}
                        {activity.email_clicked_at && (
                          <span className="inline-flex items-center gap-1 text-xs text-glassfin-primary">
                            <MouseCircleIcon size={12} />
                            Clicked {formatRelativeDate(activity.email_clicked_at)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <Modal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Send Email"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase mb-1">To</label>
            <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">{contact.email || 'No email address'}</p>
          </div>
          <Input
            label="Subject"
            value={emailForm.subject}
            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            placeholder="Follow up on proposal"
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase">Body</label>
            <textarea
              rows={5}
              value={emailForm.body}
              onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
              placeholder="Write your email..."
              className="w-full px-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-sm text-glassfin-secondary dark:text-glassfin-neutral placeholder:text-glassfin-secondary/30 dark:placeholder:text-glassfin-neutral/30 focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary transition-all resize-none font-mono rounded-xl"
            />
          </div>
          {emailError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 rounded-xl">
              {emailError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            <Button type="button" onClick={handleSendEmail} loading={sendingEmail}>
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit Contact"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 rounded-xl">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              options={CONTACT_STAGES.map((s) => ({ value: s.value, label: s.label }))}
            />
            <Input
              label="Score"
              name="score"
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral tracking-widest uppercase">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-sm text-glassfin-secondary dark:text-glassfin-neutral placeholder:text-glassfin-secondary/30 dark:placeholder:text-glassfin-neutral/30 focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary transition-all resize-none font-mono rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message={`Delete ${contact.first_name} ${contact.last_name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </motion.div>
  )
}
