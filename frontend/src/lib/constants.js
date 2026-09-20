export const CONTACT_STAGES = [
  { value: 'lead', label: 'Lead', color: '#71717a' },
  { value: 'prospect', label: 'Prospect', color: '#332B1C' },
  { value: 'proposal', label: 'Proposal', color: '#a8a29e' },
  { value: 'negotiation', label: 'Negotiation', color: '#E2F4CB' },
  { value: 'closed_won', label: 'Won', color: '#E2F4CB' },
  { value: 'closed_lost', label: 'Lost', color: '#ef4444' },
]

export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: '#71717a' },
  { value: 'qualified', label: 'Qualified', color: '#332B1C' },
  { value: 'proposal', label: 'Proposal', color: '#a8a29e' },
  { value: 'negotiation', label: 'Negotiation', color: '#E2F4CB' },
  { value: 'closed_won', label: 'Won', color: '#E2F4CB' },
  { value: 'closed_lost', label: 'Lost', color: '#ef4444' },
]

export const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', color: '#332B1C' },
  { value: 'email', label: 'Email', color: '#E2F4CB' },
  { value: 'meeting', label: 'Meeting', color: '#a8a29e' },
  { value: 'note', label: 'Note', color: '#71717a' },
  { value: 'task', label: 'Task', color: '#E2F4CB' },
  { value: 'follow_up', label: 'Follow Up', color: '#ef4444' },
]

export const CARGA_COLORS = {
  primary: '#F0E5C5',
  secondary: '#332B1C',
  tertiary: '#E2F4CB',
  neutral: '#121212',
  danger: '#ef4444',
  muted: '#71717a',
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
