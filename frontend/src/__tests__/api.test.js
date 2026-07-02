import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from '../utils/api'

describe('api utility', () => {
  let savedLocation

  beforeEach(() => {
    vi.clearAllMocks()
    savedLocation = window.location
    delete window.location
    window.location = { href: '' }
  })

  afterEach(() => {
    window.location = savedLocation
  })

  it('has withCredentials set to true', () => {
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('has Content-Type header set', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })

  it('redirects to /login on 401 response', async () => {
    const error = { response: { status: 401 } }
    try {
      await api.interceptors.response.handlers[0].rejected(error)
    } catch (e) {
      // expected
    }
    expect(window.location.href).toBe('/login')
  })

  it('rejects non-401 errors without redirect', async () => {
    const error = { response: { status: 500 } }
    let caught = false
    try {
      await api.interceptors.response.handlers[0].rejected(error)
    } catch (e) {
      caught = true
      expect(e).toBe(error)
    }
    expect(caught).toBe(true)
    expect(window.location.href).not.toBe('/login')
  })

  it('passes successful responses through', () => {
    const response = { data: 'test' }
    const result = api.interceptors.response.handlers[0].fulfilled(response)
    expect(result).toBe(response)
  })
})
