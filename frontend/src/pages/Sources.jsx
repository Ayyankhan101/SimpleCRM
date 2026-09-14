import { useState, useEffect } from 'react'
import api from '../utils/api'

const SOURCE_TYPES = [
  { value: 'api', label: 'REST API', icon: '🔗' },
  { value: 'csv', label: 'CSV File', icon: '📄' },
  { value: 'webhook', label: 'Webhook', icon: '📡' },
  { value: 'manual', label: 'Manual', icon: '✏️' },
]

export default function Sources() {
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSource, setEditingSource] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    source_type: 'api',
    config: {}
  })
  const [syncing, setSyncing] = useState(null)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await api.get('/sources')
      setSources(response.data)
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSource) {
        await api.put(`/sources/${editingSource.id}`, formData)
      } else {
        await api.post('/sources', formData)
      }
      setShowModal(false)
      setEditingSource(null)
      resetForm()
      fetchSources()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save source')
    }
  }

  const handleSync = async (id) => {
    setSyncing(id)
    try {
      await api.post(`/sources/${id}/sync`)
      fetchSources()
    } catch (error) {
      alert(error.response?.data?.error || 'Sync failed')
    } finally {
      setSyncing(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this source?')) return
    try {
      await api.delete(`/sources/${id}`)
      fetchSources()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', source_type: 'api', config: {} })
  }

  const handleEdit = (source) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      source_type: source.source_type,
      config: source.config || {}
    })
    setShowModal(true)
  }

  if (loading) {
    return <div className="loading">Loading sources...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Sources</h1>
        <p className="page-subtitle">Connect external data feeds</p>
      </div>

      <div className="toolbar">
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setEditingSource(null); setShowModal(true) }}
        >
          + Add Source
        </button>
      </div>

      <div className="sources-grid">
        {sources.map(source => (
          <div key={source.id} className="source-card">
            <div className="source-header">
              <span className="source-icon">
                {SOURCE_TYPES.find(t => t.value === source.source_type)?.icon || '📁'}
              </span>
              <div>
                <h3 className="source-name">{source.name}</h3>
                <span className="source-type">{source.source_type.toUpperCase()}</span>
              </div>
            </div>
            <div className="source-status">
              <span className={`status-badge ${source.status}`}>{source.status}</span>
              {source.last_sync_at && (
                <span className="sync-time">
                  Last sync: {new Date(source.last_sync_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {source.sync_error && (
              <div className="source-error">{source.sync_error}</div>
            )}
            <div className="source-actions">
              {source.source_type !== 'manual' && source.source_type !== 'webhook' && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSync(source.id)}
                  disabled={syncing === source.id}
                >
                  {syncing === source.id ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              <button className="btn-icon" onClick={() => handleEdit(source)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="btn-icon" onClick={() => handleDelete(source.id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
            {source.source_type === 'webhook' && (
              <div className="webhook-url">
                <code>{`${window.location.origin}/api/webhooks/${source.id}/receive`}</code>
              </div>
            )}
          </div>
        ))}

        {sources.length === 0 && (
          <div className="empty-state">
            <h3>No data sources</h3>
            <p>Add a source to start importing data automatically</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingSource ? 'Edit Source' : 'New Source'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-input"
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                >
                  {SOURCE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {formData.source_type === 'api' && (
                <div className="form-group">
                  <label className="form-label">API URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.config.url || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, url: e.target.value }
                    })}
                    placeholder="https://api.example.com/data"
                  />
                </div>
              )}
              {formData.source_type === 'csv' && (
                <div className="form-group">
                  <label className="form-label">File Path</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.config.file_path || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, file_path: e.target.value }
                    })}
                    placeholder="/path/to/data.csv"
                  />
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingSource ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
