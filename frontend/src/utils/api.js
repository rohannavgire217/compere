import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim()
const hasPlaceholderApiUrl = /your-backend\.vercel\.app/i.test(rawApiUrl)

const normalizeBaseUrl = rawValue => {
  const raw = (rawValue || '').trim()
  if (!raw) return '/api'

  const withoutTrailingSlash = raw.replace(/\/+$/, '')
  if (withoutTrailingSlash.endsWith('/api')) return withoutTrailingSlash
  return `${withoutTrailingSlash}/api`
}

const api = axios.create({
  baseURL: normalizeBaseUrl(rawApiUrl),
  timeout: 15000
})

const apiKey = import.meta.env.VITE_API_KEY || ''

// Attach token to every request
api.interceptors.request.use(config => {
  if (hasPlaceholderApiUrl) {
    return Promise.reject(new Error('VITE_API_URL is still a placeholder. Set your real backend deployment domain.'))
  }

  const user = JSON.parse(localStorage.getItem('pricepulse_user') || 'null')
  config.headers = config.headers || {}
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  if (apiKey) config.headers['x-api-key'] = apiKey
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    const requestUrl = String(err?.config?.url || '')
    const isAuthFormRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

    if (err.response?.status === 401 && !isAuthFormRequest) {
      localStorage.removeItem('pricepulse_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
