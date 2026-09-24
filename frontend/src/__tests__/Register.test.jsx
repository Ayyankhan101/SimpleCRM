import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '../pages/Register'
import api from '../utils/api'
import { renderWithProviders } from './test-utils'

vi.mock('../utils/api')

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockRejectedValue(new Error('Not logged in'))
})

describe('Register', () => {
  it('renders registration form', async () => {
    await act(async () => {
      renderWithProviders(<Register />, { initialEntries: ['/register'] })
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('renders login link', async () => {
    await act(async () => {
      renderWithProviders(<Register />, { initialEntries: ['/register'] })
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    })
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('updates form fields', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(<Register />, { initialEntries: ['/register'] })
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'new@test.com')
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/^password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    expect(screen.getByLabelText(/email/i)).toHaveValue('new@test.com')
    expect(screen.getByLabelText(/username/i)).toHaveValue('newuser')
    expect(screen.getByLabelText(/^password/i)).toHaveValue('Password123')
    expect(screen.getByLabelText(/confirm password/i)).toHaveValue('Password123')
  })

  it('calls register on form submit', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 1, email: 'new@test.com', username: 'newuser' }
    api.post.mockResolvedValue({ data: { user: mockUser } })

    await act(async () => {
      renderWithProviders(<Register />, { initialEntries: ['/register'] })
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'new@test.com')
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/^password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /create account/i }))
    })

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@test.com',
      password: 'Password123',
      username: 'newuser'
    })
  })

  it('displays error message on failed registration', async () => {
    const user = userEvent.setup()
    api.post.mockRejectedValue({ response: { data: { error: 'Email already registered' } } })

    await act(async () => {
      renderWithProviders(<Register />, { initialEntries: ['/register'] })
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/email/i), 'existing@test.com')
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/^password/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /create account/i }))
    })

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })
})
