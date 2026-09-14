import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', notify_type: 'email', config: {} })
  const [testResult, setTestResult] = useState(null)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/notifications', form)
      setForm({ name: '', notify_type: 'email', config: {} })
      setShowForm(false)
      fetchNotifications()
    } catch (err) {
      alert('Failed to create: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return
    try {
      await api.delete(`/notifications/${id}`)
      fetchNotifications()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const handleTest = async (id) => {
    try {
      const res = await api.post(`/notifications/${id}/test`)
      setTestResult({ id, success: res.data.success })
      setTimeout(() => setTestResult(null), 3000)
    } catch (err) {
      setTestResult({ id, success: false })
      setTimeout(() => setTestResult(null), 3000)
    }
  }

  if (loading) return <div className="loading">Loading notifications...</div>

  return (
    <div className="page notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Notification'}
        </button>
      </div>

      {showForm && (
        <form className="notification-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Daily Report"
              required
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select
              value={form.notify_type}
              onChange={(e) => setForm({ ...form, notify_type: e.target.value })}
            >
              <option value="email">Email (SendGrid)</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>

          {form.notify_type === 'email' && (
            <>
              <div className="form-group">
                <label>To Email</label>
                <input type="email" onChange={(e) => setForm({
                  ...form, config: { ...form.config, to_email: e.target.value }
                })} required />
              </div>
              <div className="form-group">
                <label>From Email</label>
                <input type="email" onChange={(e) => setForm({
                  ...form, config: { ...form.config, from_email: e.target.value }
                })} required />
              </div>
              <div className="form-group">
                <label>SendGrid API Key</label>
                <input type="password" onChange={(e) => setForm({
                  ...form, config: { ...form.config, sendgrid_api_key: e.target.value }
                })} required />
              </div>
            </>
          )}

          {form.notify_type === 'webhook' && (
            <>
              <div className="form-group">
                <label>Webhook URL</label>
                <input type="url" onChange={(e) => setForm({
                  ...form, config: { ...form.config, webhook_url: e.target.value }
                })} required />
              </div>
              <div className="form-group">
                <label>Secret (optional)</label>
                <input type="text" onChange={(e) => setForm({
                  ...form, config: { ...form.config, webhook_secret: e.target.value }
                })} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      )}

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>No notifications configured. Create one to get started.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <div key={n.id} className="notification-card">
              <div className="notification-info">
                <h3>{n.name}</h3>
                <span className={`badge badge-${n.notify_type}`}>{n.notify_type}</span>
                <span className={`badge ${n.is_active ? 'badge-success' : 'badge-secondary'}`}>
                  {n.is_active ? 'Active' : 'Inactive'}
                </span>
                {n.last_sent_at && (
                  <span className="last-sent">Last sent: {new Date(n.last_sent_at).toLocaleString()}</span>
                )}
              </div>
              <div className="notification-actions">
                {testResult && testResult.id === n.id && (
                  <span className={testResult.success ? 'text-success' : 'text-danger'}>
                    {testResult.success ? 'Sent!' : 'Failed'}
                  </span>
                )}
                <button className="btn btn-sm btn-secondary" onClick={() => handleTest(n.id)}>
                  Test
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
