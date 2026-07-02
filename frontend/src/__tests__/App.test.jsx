import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

const renderApp = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('App', () => {
  it('shows loading state while checking auth', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    renderApp()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders login page for unauthenticated users', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderApp(['/'])
    
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })
  })

  it('renders login page on /login route', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderApp(['/login'])
    
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })
  })

  it('renders register page on /register route', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderApp(['/register'])
    
    await waitFor(() => {
      expect(screen.getByText('Create Account')).toBeInTheDocument()
    })
  })

  it('redirects unauthenticated users from protected routes', async () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    renderApp(['/data'])
    
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })
  })

  it('renders dashboard for authenticated users', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' }
    api.get.mockResolvedValueOnce({ data: { user: mockUser } })
    api.get.mockResolvedValue({ data: { total_entries: 10, total_confirmed: 100, countries_count: 5, top_countries: [] } })
    
    renderApp(['/'])
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })
})
