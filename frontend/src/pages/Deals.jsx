import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, CurrencyCircleDollar, PencilSimple, Trash, EnvelopeSimple } from '@phosphor-icons/react'
import api from '../utils/api'
import { DEAL_STAGES, getStageColor, getStageLabel, formatCurrency } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import ContactPicker from '../components/ContactPicker'
import { TableSkeleton } from '../components/ui/Skeleton'

const defaultForm = { title: '', value: '', stage: 'lead', contact_id: '', notes: '' }

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailDeal, setEmailDeal] = useState(null)
  const [emailContact, setEmailContact] = useState(null)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState('')

  const fetchDeals = useCallback(async () => {
    try {
      const params = filterStage ? { stage: filterStage } : {}
      const res = await api.get('/v1/deals/', { params })
      setDeals(res.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [filterStage])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: formData.title,
        value: parseFloat(formData.value) || 0,
        stage: formData.stage || 'lead',
        notes: formData.notes || null,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : null,
      }
      if (editingDeal) {
        await api.put(`/v1/deals/${editingDeal.id}`, payload)
      } else {
        await api.post('/v1/deals/', payload)
      }
      setShowModal(false)
      setEditingDeal(null)
      setFormData(defaultForm)
      fetchDeals()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save deal')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return
    try {
      await api.delete(`/v1/deals/${id}`)
      fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete deal')
    }
  }

  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setFormData({
      title: deal.title || '',
      value: deal.value || '',
      stage: deal.stage || 'lead',
      contact_id: deal.contact_id || '',
      notes: deal.notes || '',
    })
    setShowModal(true)
  }

  const openNew = () => {
    setEditingDeal(null)
    setFormData(defaultForm)
    setShowModal(true)
    setError('')
  }

  const openEmail = async (deal) => {
    if (!deal.contact_id) {
      alert('No contact linked to this deal. Add a contact first.')
      return
    }
    setEmailDeal(deal)
    setEmailForm({ subject: '', body: '' })
    setEmailError('')
    setEmailContact(null)
    setShowEmailModal(true)
    try {
      const res = await api.get(`/v1/contacts/${deal.contact_id}`)
      setEmailContact(res.data)
    } catch {
      setEmailContact({ first_name: 'Unknown', email: null })
    }
  }

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      setEmailError('Subject and body required')
      return
    }
    if (!emailContact?.email) {
      setEmailError('Contact has no email address')
      return
    }
    setSendingEmail(true)
    setEmailError('')
    try {
      await api.post('/v1/emails/send', {
        contact_id: emailDeal.contact_id,
        deal_id: emailDeal.id,
        subject: emailForm.subject,
        body: emailForm.body,
      })
      setShowEmailModal(false)
      setEmailForm({ subject: '', body: '' })
    } catch (err) {
      setEmailError(err.response?.data?.error || 'Failed to send')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) return <TableSkeleton rows={5} cols={5} />

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const wonDeals = deals.filter((d) => d.stage === 'closed_won')

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-carga-secondary dark:text-carga-primary tracking-tight">Deals</h1>
          <p className="text-sm text-carga-secondary/50 dark:text-carga-primary/50 mt-1">{deals.length} deals in pipeline</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" />
          New Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 mb-8">
        <div className="p-5 border-t-2 border-carga-secondary/10 dark:border-carga-primary/10">
          <div className="text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider mb-1">Total Deals</div>
          <div className="text-2xl font-bold font-mono text-carga-secondary dark:text-carga-primary">{deals.length}</div>
        </div>
        <div className="p-5 border-t-2 border-carga-secondary/10 dark:border-carga-primary/10">
          <div className="text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider mb-1">Total Value</div>
          <div className="text-2xl font-bold font-mono text-carga-secondary">{formatCurrency(totalValue)}</div>
        </div>
        <div className="p-5 border-t-2 border-carga-secondary/10 dark:border-carga-primary/10">
          <div className="text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider mb-1">Won</div>
          <div className="text-2xl font-bold font-mono text-carga-secondary dark:text-carga-primary">{wonDeals.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2.5 border border-carga-secondary/20 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary/70 dark:text-carga-primary/70 focus:outline-none focus:ring-2 focus:ring-carga-secondary/20 focus:border-carga-secondary transition-all min-w-[160px]"
        >
          <option value="">All Stages</option>
          {DEAL_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {deals.length === 0 ? (
        <EmptyState
          icon={CurrencyCircleDollar}
          title="No deals yet"
          description="Create your first deal to start tracking your pipeline."
          action={<Button onClick={openNew}><Plus size={16} weight="bold" />Add Deal</Button>}
        />
      ) : (
        <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary/30 dark:border-carga-primary/20 shadow-carga-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-carga-secondary/10 dark:border-carga-primary/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carga-secondary/5 dark:divide-carga-primary/5">
                {deals.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="hover:bg-carga-secondary/5 dark:hover:bg-carga-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-carga-secondary dark:text-carga-primary">{d.title}</td>
                    <td className="px-6 py-4 text-sm font-mono text-carga-secondary/70 dark:text-carga-primary/70">{formatCurrency(d.value)}</td>
                    <td className="px-6 py-4">
                      <Badge color={getStageColor(DEAL_STAGES, d.stage)} dot>
                        {getStageLabel(DEAL_STAGES, d.stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-carga-secondary/50 dark:text-carga-primary/50">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEmail(d)}
                          className="p-2 text-carga-secondary/40 hover:text-carga-secondary hover:bg-carga-secondary/10 dark:text-carga-primary/40 dark:hover:text-carga-primary dark:hover:bg-carga-primary/10 transition-colors"
                        >
                          <EnvelopeSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-2 text-carga-secondary/40 hover:text-carga-secondary hover:bg-carga-secondary/10 dark:text-carga-primary/40 dark:hover:text-carga-primary dark:hover:bg-carga-primary/10 transition-colors"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-carga-secondary/40 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingDeal ? 'Edit Deal' : 'New Deal'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Value"
              name="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-carga-secondary/70 dark:text-carga-primary/70">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2.5 border border-carga-secondary/20 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary focus:outline-none focus:ring-2 focus:ring-carga-secondary/20 focus:border-carga-secondary transition-all"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <ContactPicker
            value={formData.contact_id}
            onChange={(id) => setFormData({ ...formData, contact_id: id || '' })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-carga-secondary/70 dark:text-carga-primary/70">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-carga-secondary/20 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary placeholder:text-carga-secondary/40 dark:placeholder:text-carga-primary/40 focus:outline-none focus:ring-2 focus:ring-carga-secondary/20 focus:border-carga-secondary transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {editingDeal ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Email Modal */}
      <Modal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Send Email"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-carga-secondary/70 dark:text-carga-primary/70 mb-1">To</label>
            {emailContact ? (
              <p className="text-sm text-carga-secondary/60 dark:text-carga-primary/60">
                {emailContact.first_name} {emailContact.last_name} &lt;{emailContact.email || 'no email'}&gt;
              </p>
            ) : (
              <p className="text-sm text-carga-secondary/40 dark:text-carga-primary/40">Loading contact...</p>
            )}
          </div>
          {emailDeal && (
            <div>
              <label className="block text-sm font-medium text-carga-secondary/70 dark:text-carga-primary/70 mb-1">Deal</label>
              <p className="text-sm text-carga-secondary/60 dark:text-carga-primary/60">{emailDeal.title}</p>
            </div>
          )}
          <Input
            label="Subject"
            value={emailForm.subject}
            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            placeholder="Follow up on proposal"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-carga-secondary/70 dark:text-carga-primary/70">Body</label>
            <textarea
              rows={5}
              value={emailForm.body}
              onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
              placeholder="Write your email..."
              className="w-full px-4 py-2.5 border border-carga-secondary/20 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary placeholder:text-carga-secondary/40 dark:placeholder:text-carga-primary/40 focus:outline-none focus:ring-2 focus:ring-carga-secondary/20 focus:border-carga-secondary transition-all resize-none"
            />
          </div>
          {emailError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
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
    </div>
  )
}
