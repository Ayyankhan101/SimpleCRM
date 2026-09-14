import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const TYPES = ['call', 'email', 'meeting', 'note', 'task']

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [filterType, setFilterType] = useState('')
  const [formData, setFormData] = useState({
    type: 'call', subject: '', body: '', contact_id: '', deal_id: ''
  })

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterType) params.append('type', filterType)
      const res = await api.get(`/api/v1/activities?${params}`)
      setActivities(res.data)
    } catch (err) {
      setError('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...formData }
      if (payload.contact_id) payload.contact_id = parseInt(payload.contact_id)
      if (payload.deal_id) payload.deal_id = parseInt(payload.deal_id)
      if (editingActivity) {
        await api.put(`/api/v1/activities/${editingActivity.id}`, payload)
      } else {
        await api.post('/api/v1/activities', payload)
      }
      setShowModal(false)
      setEditingActivity(null)
      resetForm()
      fetchActivities()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save activity')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity?')) return
    try {
      await api.delete(`/api/v1/activities/${id}`)
      fetchActivities()
    } catch (err) {
      setError('Failed to delete activity')
    }
  }

  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setFormData({
      type: activity.type || 'call',
      subject: activity.subject || '',
      body: activity.body || '',
      contact_id: activity.contact_id || '',
      deal_id: activity.deal_id || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({ type: 'call', subject: '', body: '', contact_id: '', deal_id: '' })
  }

  const typeIcon = (type) => {
    const icons = { call: '📞', email: '📧', meeting: '🤝', note: '📝', task: '✅' }
    return icons[type] || '📋'
  }

  const typeColor = (type) => {
    const colors = { call: '#3b82f6', email: '#8b5cf6', meeting: '#f59e0b', note: '#6b7280', task: '#22c55e' }
    return colors[type] || '#6b7280'
  }

  if (loading) return <div className="loading">Loading activities...</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Activities</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingActivity(null); setShowModal(true) }}>
          + New Activity
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty">No activities found</div>
        ) : activities.map(a => (
          <div key={a.id} className="activity-card">
            <div className="activity-icon" style={{ background: typeColor(a.type) }}>
              {typeIcon(a.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-type badge" style={{ background: typeColor(a.type) }}>{a.type}</span>
                <span className="activity-subject">{a.subject}</span>
              </div>
              {a.body && <p className="activity-body">{a.body}</p>}
              <div className="activity-meta">
                {a.contact_id && <span>Contact #{a.contact_id}</span>}
                {a.deal_id && <span>Deal #{a.deal_id}</span>}
                {a.occurred_at && <span>{new Date(a.occurred_at).toLocaleString()}</span>}
              </div>
            </div>
            <div className="activity-actions">
              <button className="btn btn-sm" onClick={() => handleEdit(a)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingActivity ? 'Edit Activity' : 'New Activity'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact ID</label>
                  <input type="number" className="input" value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Deal ID</label>
                  <input type="number" className="input" value={formData.deal_id} onChange={e => setFormData({...formData, deal_id: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" className="input" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea className="input" rows="4" value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingActivity ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
