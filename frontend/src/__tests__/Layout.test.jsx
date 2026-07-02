import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

const renderLayout = (user = { id: 1, email: 'test@test.com', username: 'testuser' }) => {
  api.get.mockResolvedValue({ data: { user } })
  
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('renders sidebar logo', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('Data Analytics')).toBeInTheDocument()
    })
  })

  it('renders navigation links', async () => {
    renderLayout()
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    expect(screen.getByText('Data Entries')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
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
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  it('renders Outlet for child routes', async () => {
    renderLayout()
    await waitFor(() => {
      expect(document.querySelector('.main-content')).toBeInTheDocument()
    })
  })
})
