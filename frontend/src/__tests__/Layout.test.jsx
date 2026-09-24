import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Layout from '../components/Layout'
import api from '../utils/api'
import { renderWithProviders } from './test-utils'

vi.mock('../utils/api')

const renderLayout = (user = { id: 1, email: 'test@test.com', username: 'testuser' }) => {
  api.get.mockResolvedValue({ data: { user } })

  return renderWithProviders(<Layout />)
}

describe('Layout', () => {
  it('renders sidebar logo', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getAllByText('SimpleCRM').length).toBeGreaterThan(0)
    })
  })

  it('renders navigation links', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    expect(screen.getByText('Contacts')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
  })

  it('displays user info after auth', async () => {
    renderLayout({ id: 1, email: 'user@test.com', username: 'john' })

    await waitFor(() => {
      expect(screen.getByText('john')).toBeInTheDocument()
    })

    expect(screen.getByText('user@test.com')).toBeInTheDocument()
  })

  it('shows user avatar as first letter of username', async () => {
    renderLayout({ id: 1, email: 'user@test.com', username: 'john' })

    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument()
    })
  })

  it('renders logout button', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument()
    })
  })

  it('renders Outlet for child routes', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})
