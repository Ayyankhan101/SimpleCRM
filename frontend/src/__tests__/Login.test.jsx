import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockRejectedValue(new Error('Not logged in'))
})

describe('Login', () => {
  it('renders login form', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders Google login button', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    })
  })

  it('renders register link', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Sign up')).toBeInTheDocument()
    })
  })

  it('calls login on form submit', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 1, email: 'test@test.com' }
    api.post.mockResolvedValue({ data: { user: mockUser } })

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /login/i }))
    })

    expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@test.com',
      password: 'password123'
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    api.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } })

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    api.post.mockImplementation(() => new Promise(() => {}))

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'test@test.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /login/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument()
    })
  })
})
