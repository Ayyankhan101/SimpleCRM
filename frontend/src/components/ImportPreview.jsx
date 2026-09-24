import { useState, useEffect } from 'react'
import api from '../utils/api'
import Modal from './ui/Modal'
import Button from './ui/Button'

export default function ImportPreview({ file, onClose, onComplete }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) return
    loadPreview()
  }, [file])

  const loadPreview = async () => {
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/v1/contacts/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setPreview(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/v1/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onComplete(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const hasErrors = preview && preview.error_count > 0

  return (
    <Modal open={true} onClose={onClose} title="Import Contacts" maxWidth="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">Analyzing CSV...</div>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-mono rounded-xl">
            {error}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-glassfin-primary/8 dark:bg-glassfin-primary/12 text-center rounded-xl">
              <div className="text-lg font-display font-semibold text-glassfin-secondary dark:text-glassfin-neutral">{preview.total_rows}</div>
              <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">Total Rows</div>
            </div>
            <div className="p-3 bg-glassfin-tertiary/12 text-center rounded-xl">
              <div className="text-lg font-display font-semibold text-glassfin-secondary dark:text-glassfin-neutral">{preview.valid_rows.length}</div>
              <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">Valid</div>
            </div>
            <div className="p-3 bg-red-500/10 text-center rounded-xl">
              <div className="text-lg font-display font-semibold text-red-500">{preview.error_count}</div>
              <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">Errors</div>
            </div>
            <div className="p-3 bg-glassfin-primary/8 dark:bg-glassfin-primary/12 text-center rounded-xl">
              <div className="text-lg font-display font-semibold text-glassfin-secondary dark:text-glassfin-neutral">{preview.warnings.length}</div>
              <div className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">Warnings</div>
            </div>
          </div>

          {preview.unmapped_columns.length > 0 && (
            <div className="p-3 bg-glassfin-tertiary/10 text-xs text-glassfin-secondary dark:text-glassfin-neutral font-mono rounded-xl">
              Ignored columns: {preview.unmapped_columns.join(', ')}
            </div>
          )}

          {hasErrors && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="text-xs font-display font-medium text-red-500 mb-2 uppercase tracking-widest">Fix these errors:</div>
              <ul className="text-xs text-red-500/80 font-mono space-y-1">
                {preview.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.preview.length > 0 && (
            <div>
              <div className="text-xs font-display font-medium text-glassfin-secondary dark:text-glassfin-neutral mb-2 uppercase tracking-widest">Sample Data</div>
              <div className="overflow-x-auto border border-glassfin-secondary/10 dark:border-glassfin-neutral/10 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-glassfin-secondary/10 dark:border-glassfin-neutral/10">
                      {Object.keys(preview.preview[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left font-display font-medium text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-widest">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-b border-glassfin-secondary/5 dark:border-glassfin-neutral/5 last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-glassfin-secondary dark:text-glassfin-neutral font-mono">{val || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={importing}
              disabled={hasErrors || preview.valid_rows.length === 0}
            >
              {importing ? 'Importing...' : `Import ${preview.valid_rows.length} Contacts`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
