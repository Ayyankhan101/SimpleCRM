export const CONTACT_STAGES = [
  { value: 'lead', label: 'Lead', color: '#64748b' },
  { value: 'prospect', label: 'Prospect', color: '#123029' },
  { value: 'proposal', label: 'Proposal', color: '#E0714A' },
  { value: 'negotiation', label: 'Negotiation', color: '#2F9078' },
  { value: 'closed_won', label: 'Won', color: '#2F9078' },
  { value: 'closed_lost', label: 'Lost', color: '#ef4444' },
]

export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: '#64748b' },
  { value: 'qualified', label: 'Qualified', color: '#123029' },
  { value: 'proposal', label: 'Proposal', color: '#E0714A' },
  { value: 'negotiation', label: 'Negotiation', color: '#2F9078' },
  { value: 'closed_won', label: 'Won', color: '#2F9078' },
  { value: 'closed_lost', label: 'Lost', color: '#ef4444' },
]

export const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', color: '#123029' },
  { value: 'email', label: 'Email', color: '#2F9078' },
  { value: 'meeting', label: 'Meeting', color: '#E0714A' },
  { value: 'note', label: 'Note', color: '#71717a' },
  { value: 'task', label: 'Task', color: '#2F9078' },
  { value: 'follow_up', label: 'Follow Up', color: '#ef4444' },
]

export const GLASSFIN_COLORS = {
  primary: '#E0714A',
  secondary: '#123029',
  tertiary: '#2F9078',
  neutral: '#FFF6F1',
  danger: '#ef4444',
  muted: '#64748b',
  subtle: '#a8a29e',
}

export function getStageColor(stages, value) {
  return stages.find(s => s.value === value)?.color || '#71717a'
}

export function getStageLabel(stages, value) {
  return stages.find(s => s.value === value)?.label || value
}

export function formatStage(stage) {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
