export const CONTACT_STAGES = [
  { value: 'lead', label: 'Lead', color: 'zinc' },
  { value: 'prospect', label: 'Prospect', color: 'sky' },
  { value: 'proposal', label: 'Proposal', color: 'amber' },
  { value: 'negotiation', label: 'Negotiation', color: 'orange' },
  { value: 'closed_won', label: 'Won', color: 'emerald' },
  { value: 'closed_lost', label: 'Lost', color: 'red' },
]

export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'zinc' },
  { value: 'qualified', label: 'Qualified', color: 'sky' },
  { value: 'proposal', label: 'Proposal', color: 'amber' },
  { value: 'negotiation', label: 'Negotiation', color: 'orange' },
  { value: 'closed_won', label: 'Won', color: 'emerald' },
  { value: 'closed_lost', label: 'Lost', color: 'red' },
]

export const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', color: 'blue' },
  { value: 'email', label: 'Email', color: 'sky' },
  { value: 'meeting', label: 'Meeting', color: 'amber' },
  { value: 'note', label: 'Note', color: 'zinc' },
  { value: 'task', label: 'Task', color: 'emerald' },
]

export function getStageColor(stages, value) {
  return stages.find(s => s.value === value)?.color || 'zinc'
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
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
