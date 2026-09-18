import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRedirecting = false

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !isRedirecting) {
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        isRedirecting = true
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
