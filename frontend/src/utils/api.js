import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let lastRedirect = 0

api.interceptors.response.use(
  response => {
    lastRedirect = 0
    return response
  },
  error => {
    if (error.response?.status === 401) {
      const now = Date.now()
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register' && now - lastRedirect > 2000) {
        lastRedirect = now
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
