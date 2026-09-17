import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, MagnifyingGlass, Users, PencilSimple, Trash } from '@phosphor-icons/react'
import api from '../utils/api'
import { CONTACT_STAGES, getStageColor, getStageLabel } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'

const defaultForm = {
  first_name: '', last_name: '', email: '', phone: '',
  company: '', role: '', stage: 'lead', score: 0, notes: '',
}

export default function Contacts() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchContacts = useCallback(async () => {
    try {
      const params = filterStage ? { stage: filterStage } : {}
      const res = await api.get('/v1/contacts', { params })
      let data = res.data
      if (search) {
        const q = search.toLowerCase()
        data = data.filter((c) =>
          c.first_name?.toLowerCase().includes(q) ||
          c.last_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
        )
      }
      setContacts(data)
    } catch {
      // error handled silently
    } finally {
      setLoading(false)
    }
  }, [filterStage, search])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingContact) {
        await api.put(`/v1/contacts/${editingContact.id}`, formData)
      } else {
        await api.post('/v1/contacts', formData)
      }
      setShowModal(false)
      setEditingContact(null)
      setFormData(defaultForm)
      fetchContacts()
    } catch {
      // error handled silently
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await api.delete(`/v1/contacts/${id}`)
      fetchContacts()
    } catch {
      // error handled silently
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
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
    setShowModal(true)
  }

  const openNew = () => {
    setEditingContact(null)
    setFormData(defaultForm)
    setShowModal(true)
  }

  if (loading) return <TableSkeleton rows={5} cols={5} />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Contacts</h1>
          <p className="text-sm text-zinc-500 mt-1">{contacts.length} total contacts</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" />
          New Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[160px]"
        >
          <option value="">All Stages</option>
          {CONTACT_STAGES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add your first contact to get started with SimpleCRM."
          action={<Button onClick={openNew}><Plus size={16} weight="bold" />Add Contact</Button>}
        />
      ) : (
        <div className="bg-white rounded-4xl border border-slate-200/50 shadow-diffusion overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {contacts.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="text-sm font-medium text-zinc-950 hover:text-emerald-600 transition-colors text-left"
                      >
                        {c.first_name} {c.last_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{c.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{c.company || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge color={getStageColor(CONTACT_STAGES, c.stage)} dot>
                        {getStageLabel(CONTACT_STAGES, c.stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-zinc-700">{c.score || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
        title={editingContact ? 'Edit Contact' : 'New Contact'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {CONTACT_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Score"
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
            />
          </div>
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
              {editingContact ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
