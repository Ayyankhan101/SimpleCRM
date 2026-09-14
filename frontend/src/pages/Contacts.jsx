import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const STAGES = ['lead', 'prospect', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    company: '', role: '', stage: 'lead', score: 0, notes: ''
  })

  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterStage) params.append('stage', filterStage)
      const res = await api.get(`/api/v1/contacts?${params}`)
      let data = res.data
      if (search) {
        const q = search.toLowerCase()
        data = data.filter(c =>
          c.first_name?.toLowerCase().includes(q) ||
          c.last_name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
        )
      }
      setContacts(data)
    } catch (err) {
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [filterStage, search])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingContact) {
        await api.put(`/api/v1/contacts/${editingContact.id}`, formData)
      } else {
        await api.post('/api/v1/contacts', formData)
      }
      setShowModal(false)
      setEditingContact(null)
      resetForm()
      fetchContacts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save contact')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await api.delete(`/api/v1/contacts/${id}`)
      fetchContacts()
    } catch (err) {
      setError('Failed to delete contact')
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
      notes: contact.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '', company: '', role: '', stage: 'lead', score: 0, notes: '' })
  }

  const stageColor = (stage) => {
    const colors = { lead: '#6366f1', prospect: '#8b5cf6', proposal: '#a855f7', negotiation: '#d946ef', closed_won: '#22c55e', closed_lost: '#ef4444' }
    return colors[stage] || '#6b7280'
  }

  if (loading) return <div className="loading">Loading contacts...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Contacts</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingContact(null); setShowModal(true) }}>
          + New Contact
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="input" />
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="input">
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr><td colSpan="6" className="empty">No contacts found</td></tr>
            ) : contacts.map(c => (
              <tr key={c.id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.email || '-'}</td>
                <td>{c.company || '-'}</td>
                <td>
                  <span className="badge" style={{ background: stageColor(c.stage) }}>
                    {c.stage?.replace('_', ' ')}
                  </span>
                </td>
                <td>{c.score || 0}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingContact ? 'Edit Contact' : 'New Contact'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" className="input" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" className="input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" className="input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" className="input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stage</label>
                  <select className="input" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Score</label>
                  <input type="number" className="input" value={formData.score} onChange={e => setFormData({...formData, score: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingContact ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
