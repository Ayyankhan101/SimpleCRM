import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    
    try {
      const response = await api.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', 'logged_in')
    setUser(response.data.user)
    return response.data
  }

  const register = async (email, password, username) => {
    const response = await api.post('/api/auth/register', { email, password, username })
    localStorage.setItem('token', 'logged_in')
    setUser(response.data.user)
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const googleLogin = async (idToken) => {
    const response = await api.post('/api/auth/google/mobile', { id_token: idToken })
    localStorage.setItem('token', 'logged_in')
    setUser(response.data.user)
    return response.data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
