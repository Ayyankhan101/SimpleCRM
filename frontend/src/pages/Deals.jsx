import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [formData, setFormData] = useState({
    title: '', value: '', stage: 'lead', contact_id: '', notes: ''
  })

  const fetchDeals = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (filterStage) params.append('stage', filterStage)
      const res = await api.get(`/v1/deals`, { params })
      setDeals(res.data)
    } catch (err) {
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [filterStage])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: formData.title,
        value: parseFloat(formData.value) || 0,
        stage: formData.stage || 'lead',
        notes: formData.notes || null,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : null
      }
      if (editingDeal) {
        await api.put(`/v1/deals/${editingDeal.id}`, payload)
      } else {
        await api.post('/v1/deals', payload)
      }
      setShowModal(false)
      setEditingDeal(null)
      resetForm()
      fetchDeals()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save deal')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return
    try {
      await api.delete(`/v1/deals/${id}`)
      fetchDeals()
    } catch (err) {
      setError('Failed to delete deal')
    }
  }

  const handleEdit = (deal) => {
    setEditingDeal(deal)
    setFormData({
      title: deal.title || '',
      value: deal.value || '',
      stage: deal.stage || 'discovery',
      contact_id: deal.contact_id || '',
      notes: deal.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({ title: '', value: '', stage: 'lead', contact_id: '', notes: '' })
  }

  const stageColor = (stage) => {
    const colors = { discovery: '#3b82f6', qualification: '#6366f1', proposal: '#a855f7', negotiation: '#f59e0b', closed_won: '#22c55e', closed_lost: '#ef4444' }
    return colors[stage] || '#6b7280'
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0)
  }

  if (loading) return <div className="loading">Loading deals...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Deals</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingDeal(null); setShowModal(true) }}>
          + New Deal
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="input">
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Deals</div>
          <div className="stat-value">{deals.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">{formatCurrency(deals.reduce((sum, d) => sum + (d.value || 0), 0))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Won Deals</div>
          <div className="stat-value">{deals.filter(d => d.stage === 'closed_won').length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr><td colSpan="5" className="empty">No deals found</td></tr>
            ) : deals.map(d => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{formatCurrency(d.value)}</td>
                <td>
                  <span className="badge" style={{ background: stageColor(d.stage) }}>
                    {d.stage?.replace('_', ' ')}
                  </span>
                </td>
                <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(d)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingDeal ? 'Edit Deal' : 'New Deal'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" className="input" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Stage</label>
                  <select className="input" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Contact ID</label>
                <input type="number" className="input" value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDeal ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
