import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'
import api from '../utils/api'

vi.mock('../utils/api')

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws when useAuth used outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider')
  })

  it('starts with loading true and user null', () => {
    api.get.mockRejectedValue(new Error('Not logged in'))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('sets user after successful checkAuth', async () => {
    const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' }
    api.get.mockResolvedValue({ data: { user: mockUser } })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.loading).toBe(false)
  })

  it('sets user to null when checkAuth fails', async () => {
    api.get.mockRejectedValue(new Error('Unauthorized'))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('login calls API and sets user', async () => {
    const mockUser = { id: 1, email: 'test@test.com' }
    api.post.mockResolvedValue({ data: { user: mockUser } })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.login('test@test.com', 'password123')
    })
    
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password123' })
    expect(result.current.user).toEqual(mockUser)
  })

  it('register calls API and sets user', async () => {
    const mockUser = { id: 1, email: 'new@test.com', username: 'newuser' }
    api.post.mockResolvedValue({ data: { user: mockUser } })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.register('new@test.com', 'password123', 'newuser')
    })
    
    expect(api.post).toHaveBeenCalledWith('/auth/register', { email: 'new@test.com', password: 'password123', username: 'newuser' })
    expect(result.current.user).toEqual(mockUser)
  })

  it('logout calls API and clears user', async () => {
    api.post.mockResolvedValue({})
    api.get.mockResolvedValue({ data: { user: { id: 1 } } })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
    
    await act(async () => {
      await result.current.logout()
    })
    
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(result.current.user).toBeNull()
  })

  it('googleLogin calls API and sets user', async () => {
    const mockUser = { id: 1, email: 'google@test.com' }
    api.post.mockResolvedValue({ data: { user: mockUser } })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.googleLogin('google-id-token')
    })
    
    expect(api.post).toHaveBeenCalledWith('/auth/google/mobile', { id_token: 'google-id-token' })
    expect(result.current.user).toEqual(mockUser)
  })
})
