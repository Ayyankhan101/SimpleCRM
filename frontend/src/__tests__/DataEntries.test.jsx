import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DataEntries from '../pages/DataEntries'
import { AuthProvider } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

const mockEntries = {
  entries: [
    { id: 1, title: 'Entry 1', date: '2024-01-15', country: 'USA', confirmed_cases: 100, deaths: 5, recovered: 90, category_id: 1, category: { id: 1, name: 'COVID-19', color: '#EF4444' } },
    { id: 2, title: 'Entry 2', date: '2024-01-16', country: 'India', confirmed_cases: 200, deaths: 10, recovered: 180, category_id: 1, category: { id: 1, name: 'COVID-19', color: '#EF4444' } }
  ],
  total: 2,
  pages: 1,
  current_page: 1
}

const mockCategories = [
  { id: 1, name: 'COVID-19', color: '#EF4444' },
  { id: 2, name: 'Healthcare', color: '#10B981' }
]

describe('DataEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockImplementation((url) => {
      if (url.includes('/data')) return Promise.resolve({ data: mockEntries })
      if (url.includes('/categories')) return Promise.resolve({ data: mockCategories })
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  it('shows loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('Loading data entries...')).toBeInTheDocument()
  })

  it('renders data table after loading', async () => {
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Entry 1')).toBeInTheDocument()
    })

    expect(screen.getByText('Entry 2')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
    expect(screen.getByText('India')).toBeInTheDocument()
  })

  it('renders toolbar with search and filters', async () => {
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search entries...')).toBeInTheDocument()
    })

    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('+ Add Entry')).toBeInTheDocument()
  })

  it('renders category filter dropdown', async () => {
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument()
    })

    const options = screen.getAllByRole('option')
    const optionTexts = options.map(o => o.textContent)
    expect(optionTexts).toContain('COVID-19')
    expect(optionTexts).toContain('Healthcare')
  })

  it('opens create modal when clicking Add Entry', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('+ Add Entry')).toBeInTheDocument()
    })

    await user.click(screen.getByText('+ Add Entry'))

    await waitFor(() => {
      expect(screen.getByText('New Entry')).toBeInTheDocument()
    })
  })

  it('shows error state when API fails', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Failed to load data entries')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('renders pagination controls', async () => {
    render(<MemoryRouter><AuthProvider><DataEntries /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    expect(screen.getByText('Next')).toBeInTheDocument()
  })
})
