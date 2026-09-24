import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import api from '../utils/api'
import Dashboard from '../pages/Dashboard'
import { renderWithProviders } from './test-utils'

vi.mock('../utils/api')

const mockStatsResponse = {
  contacts: 100,
  deals: 50,
  activities: 30,
  pipeline: [
    { stage: 'lead', count: 10 },
    { stage: 'qualified', count: 15 }
  ],
  revenue_trend: [],
  email_engagement: { total: 200, opened: 80, clicked: 30 },
  activity_breakdown: [
    { type: 'call', count: 20 },
    { type: 'email', count: 10 }
  ],
  overdue_activities: [],
  due_today_activities: [],
  upcoming_activities: [],
}

describe('Dashboard', () => {
  const originalConsoleError = console.error
  beforeEach(() => {
    console.error = vi.fn()
    api.get.mockImplementation((url) => {
      if (url === '/v1/stats') return Promise.resolve({ data: mockStatsResponse })
      if (url === '/v1/reminders/check') return Promise.resolve({ data: { email_configured: false } })
      return Promise.reject(new Error('Unknown URL'))
    })
  })
  afterEach(() => {
    console.error = originalConsoleError
  })

  it('shows loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    const { container } = renderWithProviders(<Dashboard />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('fetches data on mount', async () => {
    renderWithProviders(<Dashboard />)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
  })

  it('renders stats cards after loading', async () => {
    renderWithProviders(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Contacts')).toBeInTheDocument()
    })

    expect(screen.getByText('Deals')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    api.get.mockRejectedValue(new Error('API Error'))
    renderWithProviders(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('retry button is clickable and shows in error state', async () => {
    const user = userEvent.setup()
    api.get.mockRejectedValue(new Error('API Error'))
    renderWithProviders(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })

    const retryBtn = screen.getByText('Retry')
    expect(retryBtn).toBeInTheDocument()
    expect(retryBtn.tagName).toBe('BUTTON')
  })
})
