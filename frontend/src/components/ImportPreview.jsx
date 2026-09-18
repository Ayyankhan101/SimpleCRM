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
          <div className="text-sm text-zinc-500">Analyzing CSV...</div>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-center">
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{preview.total_rows}</div>
              <div className="text-xs text-zinc-500">Total Rows</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{preview.valid_rows.length}</div>
              <div className="text-xs text-zinc-500">Valid</div>
            </div>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">{preview.error_count}</div>
              <div className="text-xs text-zinc-500">Errors</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">{preview.warnings.length}</div>
              <div className="text-xs text-zinc-500">Warnings</div>
            </div>
          </div>

          {/* Unmapped columns */}
          {preview.unmapped_columns.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-600 dark:text-blue-400">
              Ignored columns: {preview.unmapped_columns.join(', ')}
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
              <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Fix these errors:</div>
              <ul className="text-xs text-red-500 dark:text-red-400 space-y-1">
                {preview.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          {preview.preview.length > 0 && (
            <div>
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Sample Data</div>
              <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      {Object.keys(preview.preview[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{val || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
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
