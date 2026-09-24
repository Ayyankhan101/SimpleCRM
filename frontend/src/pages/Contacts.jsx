import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AddCircleIcon, MagnifierIcon, UsersGroupRoundedIcon, PenIcon, TrashBinMinimalisticIcon } from '@solar-icons/react/linear'
import api from '../utils/api'
import { CONTACT_STAGES, getStageColor, getStageLabel } from '../lib/constants'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import EmptyState from '../components/ui/EmptyState'
import { TableSkeleton } from '../components/ui/Skeleton'
import ImportPreview from '../components/ImportPreview'
import { useToast } from '../components/ui/Toast'

const defaultForm = {
  first_name: '', last_name: '', email: '', phone: '',
  company: '', role: '', stage: 'lead', score: 0, notes: '',
}

export default function Contacts() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const fileInputRef = useRef(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchContacts = useCallback(async () => {
    try {
      const params = filterStage ? { stage: filterStage } : {}
      const res = await api.get('/v1/contacts/', { params })
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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [filterStage, search])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingContact) {
        await api.put(`/v1/contacts/${editingContact.id}`, formData)
      } else {
        await api.post('/v1/contacts/', formData)
      }
      setShowModal(false)
      setEditingContact(null)
      setFormData(defaultForm)
      fetchContacts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/v1/contacts/${id}`)
      fetchContacts()
      toast.success('Contact deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete contact')
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
    setError('')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setShowImport(true)
    }
    e.target.value = ''
  }

  const handleImportComplete = (result) => {
    setShowImport(false)
    setImportFile(null)
    fetchContacts()
    toast.success(`Import complete: ${result.created} created, ${result.skipped} skipped`)
  }

  if (loading) return <TableSkeleton rows={5} cols={5} />

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-glassfin-secondary dark:text-glassfin-neutral tracking-tight">Contacts</h1>
          <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">{search ? `${contacts.length} matching contacts` : `${contacts.length} total contacts`}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </Button>
          <Button onClick={openNew}>
            <AddCircleIcon size={16} />
            New Contact
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search contacts..."
            aria-label="Search contacts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MagnifierIcon size={16} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />}
            className="w-full"
          />
        </div>
        <Select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          options={CONTACT_STAGES.map((s) => ({ value: s.value, label: s.label }))}
          placeholder="All Stages"
          className="min-w-[160px]"
        />
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={UsersGroupRoundedIcon}
          title="No contacts yet"
          description="Add your first contact to get started with SimpleCRM."
          action={<Button onClick={openNew}><AddCircleIcon size={16} />Add Contact</Button>}
        />
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glassfin-secondary/10 dark:border-glassfin-neutral/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Score</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassfin-secondary/5 dark:divide-glassfin-neutral/5">
                {contacts.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="hover:bg-glassfin-primary/5 dark:hover:bg-glassfin-primary/8 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="text-sm font-medium text-glassfin-secondary dark:text-glassfin-neutral hover:text-glassfin-primary dark:hover:text-glassfin-primary transition-colors text-left font-display"
                      >
                        {c.first_name} {c.last_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">{c.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50">{c.company || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge color={getStageColor(CONTACT_STAGES, c.stage)} dot>
                        {getStageLabel(CONTACT_STAGES, c.stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-glassfin-secondary dark:text-glassfin-neutral">{c.score || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-glassfin-secondary/40 hover:text-glassfin-secondary hover:bg-glassfin-primary/10 dark:text-glassfin-neutral/40 dark:hover:text-glassfin-neutral dark:hover:bg-glassfin-primary/15 transition-colors rounded-full"
                        >
                          <PenIcon size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          className="p-2 text-glassfin-secondary/40 hover:text-red-600 hover:bg-red-50 dark:text-glassfin-neutral/40 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors rounded-full"
                        >
                          <TrashBinMinimalisticIcon size={15} />
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingContact ? 'Edit Contact' : 'New Contact'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2.5 border border-glassfin-secondary/15 dark:border-glassfin-neutral/12 bg-glassfin-neutral/40 dark:bg-glassfin-secondary/40 text-sm text-glassfin-secondary dark:text-glassfin-neutral placeholder:text-glassfin-secondary/40 dark:placeholder:text-glassfin-neutral/35 focus:outline-none focus:ring-2 focus:ring-glassfin-primary/20 focus:border-glassfin-primary transition-all resize-none font-mono rounded-xl"
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

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null) }}
        title="Delete Contact"
        message={`Delete ${confirmDelete?.first_name} ${confirmDelete?.last_name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      {showImport && importFile && (
        <ImportPreview
          file={importFile}
          onClose={() => { setShowImport(false); setImportFile(null) }}
          onComplete={handleImportComplete}
        />
      )}
    </div>
  )
}
