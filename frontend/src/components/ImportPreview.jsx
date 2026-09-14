import { useState } from 'react'
import api from '../utils/api'

export default function ImportPreview({ file, onImport, onCancel }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const handlePreview = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/data/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPreview(response.data)
    } catch (error) {
      alert('Failed to preview: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/data/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onImport(response.data)
    } catch (error) {
      alert('Import failed: ' + (error.response?.data?.error || error.message))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="import-preview">
      <h3>Import CSV: {file.name}</h3>
      
      {!preview ? (
        <div className="preview-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePreview} disabled={loading}>
            {loading ? 'Analyzing...' : 'Preview Data'}
          </button>
        </div>
      ) : (
        <div className="preview-results">
          <div className="preview-stats">
            <div className="stat">
              <span className="stat-label">Total Rows</span>
              <span className="stat-value">{preview.total_rows}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Valid Rows</span>
              <span className="stat-value success">{preview.valid_rows.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Errors</span>
              <span className="stat-value danger">{preview.errors.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Warnings</span>
              <span className="stat-value warning">{preview.warnings.length}</span>
            </div>
          </div>

          {preview.errors.length > 0 && (
            <div className="error-list">
              <h4>Errors (fix before importing)</h4>
              <ul>
                {preview.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>
                    {typeof err === 'string' ? err : `Row ${err.row}: ${err.errors.join(', ')}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="warning-list">
              <h4>Warnings (will import anyway)</h4>
              <ul>
                {preview.warnings.slice(0, 5).map((warn, i) => (
                  <li key={i}>Row {warn.row}: {warn.warnings.join(', ')}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.valid_rows.length > 0 && (
            <div className="preview-table">
              <h4>Sample Data (first 5 rows)</h4>
              <table>
                <thead>
                  <tr>
                    {Object.keys(preview.valid_rows[0]).slice(0, 6).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.valid_rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 6).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="import-actions">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={importing || preview.errors.length > 0 || preview.valid_rows.length === 0}
            >
              {importing ? 'Importing...' : `Import ${preview.valid_rows.length} Rows`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
