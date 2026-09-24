import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import api from '../utils/api'
import { renderWithProviders } from './test-utils'

vi.mock('../utils/api')

describe('App', () => {
  it('shows loading state while checking auth', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    renderWithProviders(<App />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders login page for unauthenticated users', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderWithProviders(<App />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
    })
  })

  it('renders login page on /login route', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderWithProviders(<App />, { initialEntries: ['/login'] })

    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
    })
  })

  it('renders register page on /register route', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderWithProviders(<App />, { initialEntries: ['/register'] })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    })
  })

  it('redirects unauthenticated users from protected routes', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderWithProviders(<App />, { initialEntries: ['/data'] })

    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument()
    })
  })

  it('renders dashboard for authenticated users', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' }
    api.get.mockResolvedValueOnce({ data: { user: mockUser } })
    api.get.mockResolvedValue({ data: { total_entries: 10, total_confirmed: 100, countries_count: 5, top_countries: [] } })

    renderWithProviders(<App />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
