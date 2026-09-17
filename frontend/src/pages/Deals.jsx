import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, CurrencyCircleDollar, PencilSimple, Trash } from '@phosphor-icons/react'
import api from '../utils/api'
import { DEAL_STAGES, getStageColor, getStageLabel, formatCurrency } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
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

  const fetchDeals = useCallback(async () => {
    try {
      const params = filterStage ? { stage: filterStage } : {}
      const res = await api.get('/v1/deals', { params })
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
        await api.post('/v1/deals', payload)
      }
      setShowModal(false)
      setEditingDeal(null)
      setFormData(defaultForm)
      fetchDeals()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return
    try {
      await api.delete(`/v1/deals/${id}`)
      fetchDeals()
    } catch {
      // silent
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
  }

  if (loading) return <TableSkeleton rows={5} cols={5} />

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const wonDeals = deals.filter((d) => d.stage === 'closed_won')

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Deals</h1>
          <p className="text-sm text-zinc-500 mt-1">{deals.length} deals in pipeline</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" />
          New Deal
        </Button>
      </div>

      {/* Stats — border-top grouping */}
      <div className="grid grid-cols-3 gap-0 mb-8">
        <div className="p-5 border-t-2 border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Deals</div>
          <div className="text-2xl font-bold font-mono text-zinc-950">{deals.length}</div>
        </div>
        <div className="p-5 border-t-2 border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Value</div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatCurrency(totalValue)}</div>
        </div>
        <div className="p-5 border-t-2 border-zinc-100">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Won</div>
          <div className="text-2xl font-bold font-mono text-zinc-950">{wonDeals.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[160px]"
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
        <div className="bg-white rounded-4xl border border-slate-200/50 shadow-diffusion overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {deals.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-950">{d.title}</td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-700">{formatCurrency(d.value)}</td>
                    <td className="px-6 py-4">
                      <Badge color={getStageColor(DEAL_STAGES, d.stage)} dot>
                        {getStageLabel(DEAL_STAGES, d.stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Input
            label="Contact ID"
            type="number"
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
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
    </div>
  )
}
