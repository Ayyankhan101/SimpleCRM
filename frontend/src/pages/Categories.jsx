import { useState, useEffect } from 'react'
import api from '../utils/api'

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'folder'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData)
      } else {
        await api.post('/categories', formData)
      }
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      alert(error.response?.data?.error || 'Error saving category')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? All associated data entries will lose their category.')) return
    try {
      await api.delete(`/categories/${id}`)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'folder'
    })
  }

  if (loading) {
    return <div className="loading">Loading categories...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Organize your data with categories</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingCategory(null); setShowModal(true); }}>
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories yet</h3>
          <p>Create your first category to organize your data</p>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map(category => (
            <div key={category.id} className="category-card" style={{ borderLeftColor: category.color }}>
              <div className="category-header">
                <span className="category-name">{category.name}</span>
                <div className="category-color" style={{ background: category.color }}></div>
              </div>
              <p className="category-description">{category.description || 'No description'}</p>
              <div className="category-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(category)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(category.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
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
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div className="color-picker">
                  {COLORS.map(color => (
                    <div
                      key={color}
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
