import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Categories from '../pages/Categories'
import { AuthProvider } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

const mockCategories = [
  { id: 1, name: 'COVID-19', description: 'Pandemic data', color: '#EF4444', icon: 'virus' },
  { id: 2, name: 'Healthcare', description: 'Health stats', color: '#10B981', icon: 'heart' }
]

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue({ data: mockCategories })
  })

  it('shows loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('Loading categories...')).toBeInTheDocument()
  })

  it('renders categories after loading', async () => {
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('COVID-19')).toBeInTheDocument()
    })

    expect(screen.getByText('Healthcare')).toBeInTheDocument()
    expect(screen.getByText('Pandemic data')).toBeInTheDocument()
    expect(screen.getByText('Health stats')).toBeInTheDocument()
  })

  it('renders Add Category button', async () => {
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('+ Add Category')).toBeInTheDocument()
    })
  })

  it('opens create modal when clicking Add Category', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('+ Add Category')).toBeInTheDocument()
    })

    await user.click(screen.getByText('+ Add Category'))

    await waitFor(() => {
      expect(screen.getByText('New Category')).toBeInTheDocument()
    })
  })

  it('opens edit modal when clicking Edit', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('COVID-19')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByText('Edit')
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit Category')).toBeInTheDocument()
    })
  })

  it('renders empty state when no categories', async () => {
    api.get.mockResolvedValue({ data: [] })

    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('No categories yet')).toBeInTheDocument()
    })
  })

  it('displays category color swatches', async () => {
    render(<MemoryRouter><AuthProvider><Categories /></AuthProvider></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('COVID-19')).toBeInTheDocument()
    })

    const colorSwatches = document.querySelectorAll('.category-color')
    expect(colorSwatches.length).toBeGreaterThan(0)
  })
})
