import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  if (config.url && config.url.startsWith('/v1/') && !config.url.endsWith('/') && !config.url.includes('.')) {
    config.url += '/'
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
