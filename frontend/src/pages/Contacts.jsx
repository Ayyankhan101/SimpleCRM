import { useState, useEffect, useCallback, useRef } from 'react'
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
import ImportPreview from '../components/ImportPreview'

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
  const [error, setError] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const fileInputRef = useRef(null)

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
    setError('')
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await api.delete(`/v1/contacts/${id}`)
      fetchContacts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete contact')
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
    alert(`Import complete: ${result.created} created, ${result.skipped} skipped`)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-carga-secondary dark:text-carga-primary tracking-tight">Contacts</h1>
          <p className="text-sm text-carga-secondary/50 dark:text-carga-primary/50 mt-1">{search ? `${contacts.length} matching contacts` : `${contacts.length} total contacts`}</p>
        </div>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Import CSV
        </Button>
        <Button onClick={openNew}>
          <Plus size={16} weight="bold" />
          New Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carga-secondary/50" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary placeholder:text-carga-secondary/40 dark:placeholder:text-carga-primary/40 focus:outline-none focus:ring-2 focus:ring-carga-primary/20 focus:border-carga-primary transition-all font-mono"
          />
        </div>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary focus:outline-none focus:ring-2 focus:ring-carga-primary/20 focus:border-carga-primary transition-all min-w-[160px] font-mono"
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
        <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-carga-secondary/10 dark:border-carga-primary/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Stage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Score</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider font-display">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carga-secondary/5 dark:divide-carga-primary/5">
                {contacts.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="hover:bg-carga-primary/5 dark:hover:bg-carga-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="text-sm font-medium text-carga-secondary dark:text-carga-primary hover:text-carga-primary dark:hover:text-carga-secondary transition-colors text-left font-display"
                      >
                        {c.first_name} {c.last_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-carga-secondary/50 dark:text-carga-primary/50 font-mono">{c.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-carga-secondary/50 dark:text-carga-primary/50">{c.company || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge color={getStageColor(CONTACT_STAGES, c.stage)} dot>
                        {getStageLabel(CONTACT_STAGES, c.stage)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-carga-secondary dark:text-carga-primary">{c.score || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-carga-secondary/40 hover:text-carga-secondary hover:bg-carga-primary/50 dark:hover:text-carga-primary dark:hover:bg-carga-primary/50 transition-colors"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
        title={editingContact ? 'Edit Contact' : 'New Contact'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
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
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-carga-secondary dark:text-carga-primary">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary focus:outline-none focus:ring-2 focus:ring-carga-primary/20 focus:border-carga-primary transition-all font-mono"
              >
                {CONTACT_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Score"
              name="score"
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-carga-secondary dark:text-carga-primary">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 bg-carga-surface dark:bg-carga-surface-dark text-sm text-carga-secondary dark:text-carga-primary placeholder:text-carga-secondary/40 dark:placeholder:text-carga-primary/40 focus:outline-none focus:ring-2 focus:ring-carga-primary/20 focus:border-carga-primary transition-all resize-none font-mono"
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
