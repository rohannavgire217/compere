import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

const getAuthErrorMessage = err => {
  const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim()
  if (/your-backend\.vercel\.app/i.test(rawApiUrl)) {
    return 'VITE_API_URL is still a placeholder. Update it to your real backend domain and redeploy frontend.'
  }

  const data = err?.response?.data

  if (typeof data === 'object' && data?.message) {
    return data.message
  }

  if (typeof data === 'string' && data.toLowerCase().includes('vercel authentication')) {
    return 'Deployment is protected by Vercel Authentication. Disable protection or use a public API URL.'
  }

  if (typeof data === 'string' && data.toUpperCase().includes('NOT_FOUND')) {
    return 'Backend URL is invalid or deployment is missing. Check VITE_API_URL and test /api/health directly.'
  }

  if (!err?.response) {
    return 'Cannot reach API. Check VITE_API_URL and backend deployment status.'
  }

  return 'Authentication failed. Check backend URL and deployment settings.'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pricepulse_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('pricepulse_user', JSON.stringify(data))
      setUser(data)
      return { success: true }
    } catch (err) {
      return { success: false, message: getAuthErrorMessage(err) }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('pricepulse_user', JSON.stringify(data))
      setUser(data)
      return { success: true }
    } catch (err) {
      return { success: false, message: getAuthErrorMessage(err) }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('pricepulse_user')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      const updated = { ...user, ...data }
      localStorage.setItem('pricepulse_user', JSON.stringify(updated))
      setUser(updated)
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
