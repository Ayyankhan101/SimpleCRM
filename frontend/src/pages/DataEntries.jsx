import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function DataEntries() {
  const [entries, setEntries] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    country: '',
    region: '',
    confirmed_cases: 0,
    deaths: 0,
    recovered: 0,
    active_cases: 0,
    population: 0,
    category_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [page, search, filterCategory])

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({ page, per_page: 20 })
      if (search) params.append('search', search)
      if (filterCategory) params.append('category_id', filterCategory)
      
      const [entriesRes, categoriesRes] = await Promise.all([
        api.get(`/api/data?${params}`),
        api.get('/api/categories')
      ])
      
      setEntries(entriesRes.data.entries)
      setTotalPages(entriesRes.data.pages)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEntry) {
        await api.put(`/api/data/${editingEntry.id}`, formData)
      } else {
        await api.post('/api/data', formData)
      }
      setShowModal(false)
      setEditingEntry(null)
      resetForm()
      fetchData()
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      date: entry.date,
      country: entry.country || '',
      region: entry.region || '',
      confirmed_cases: entry.confirmed_cases,
      deaths: entry.deaths,
      recovered: entry.recovered,
      active_cases: entry.active_cases,
      population: entry.population,
      category_id: entry.category_id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    try {
      await api.delete(`/api/data/${id}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      country: '',
      region: '',
      confirmed_cases: 0,
      deaths: 0,
      recovered: 0,
      active_cases: 0,
      population: 0,
      category_id: ''
    })
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/api/data/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_export.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      await api.post('/api/data/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchData()
      alert('Data imported successfully!')
    } catch (error) {
      alert('Error importing data: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) {
    return <div className="loading">Loading data entries...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Data Entries</h1>
        <p className="page-subtitle">Manage your data entries</p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filters">
          <select
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={handleExport}>Export CSV</button>
          <label className="btn btn-secondary">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-primary" onClick={() => { resetForm(); setEditingEntry(null); setShowModal(true); }}>
            + Add Entry
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Country</th>
              <th>Confirmed</th>
              <th>Deaths</th>
              <th>Recovered</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.title}</td>
                <td>{entry.date}</td>
                <td>{entry.country}</td>
                <td>{entry.confirmed_cases?.toLocaleString()}</td>
                <td>{entry.deaths?.toLocaleString()}</td>
                <td>{entry.recovered?.toLocaleString()}</td>
                <td>
                  <span style={{ 
                    background: entry.category?.color || '#ccc',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {entry.category?.name || 'None'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(entry)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(entry.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <div className="empty-state">
            <h3>No entries found</h3>
            <p>Add your first data entry to get started</p>
          </div>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? 'active' : ''}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Region</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Confirmed Cases</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.confirmed_cases}
                    onChange={(e) => setFormData({ ...formData, confirmed_cases: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deaths</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.deaths}
                    onChange={(e) => setFormData({ ...formData, deaths: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Recovered</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.recovered}
                    onChange={(e) => setFormData({ ...formData, recovered: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Population</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingEntry ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
