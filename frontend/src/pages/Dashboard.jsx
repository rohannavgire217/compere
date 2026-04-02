import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/auth/notifications'),
      api.get('/auth/me')
    ]).then(([{ data: notifs }, { data: me }]) => {
      setNotifications(notifs.slice(0, 10))
      setHistory(me.searchHistory?.slice(-8).reverse() || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const markRead = async () => {
    await api.put('/auth/notifications/read')
    setNotifications(n => n.map(x => ({ ...x, read: true })))
    refreshUser()
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Reward Points', value: user?.rewardPoints || 0, icon: '⭐', color: 'text-yellow-400' },
          { label: 'Wallet (₹)', value: `₹${(user?.wallet || 0).toFixed(2)}`, icon: '💰', color: 'text-green-400' },
          { label: 'Wishlist', value: user?.wishlist?.length || 0, icon: '❤️', color: 'text-red-400' },
          { label: 'Searches', value: history.length, icon: '🔍', color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-4">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-xl font-bold font-display ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              Notifications
              {unread > 0 && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">{unread}</span>}
            </h2>
            {unread > 0 && (
              <button onClick={markRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />)}</div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!n.read ? 'bg-blue-500/10 border border-blue-500/20' : 'border border-transparent'}`}>
                  <span className="text-lg shrink-0">{n.type === 'reward' ? '🎁' : n.type === 'price_drop' ? '📉' : '🔔'}</span>
                  <div>
                    <p className="text-sm text-gray-200">{n.message}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">Recent Searches</h2>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-3">No searches yet</p>
              <Link to="/search" className="text-sm text-blue-400 hover:text-blue-300">Start searching →</Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <Link key={i} to={`/search?q=${encodeURIComponent(h.query)}`}
                  className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors">
                  🔍 {h.query}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { to: '/wishlist', icon: '❤️', label: 'My Wishlist' },
          { to: '/rewards', icon: '🎁', label: 'My Rewards' },
          { to: '/search', icon: '🔍', label: 'Search Products' },
        ].map(link => (
          <Link key={link.to} to={link.to} className="glass rounded-2xl p-4 text-center hover:border-blue-500/30 border border-transparent transition-colors card-hover">
            <div className="text-2xl mb-2">{link.icon}</div>
            <div className="text-sm font-medium text-gray-300">{link.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
