import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Rewards() {
  const { user, refreshUser } = useAuth()
  const [data, setData] = useState({ rewards: [], rewardPoints: 0, wallet: 0 })
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemAmount, setRedeemAmount] = useState(100)

  useEffect(() => {
    api.get('/rewards')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load rewards'))
      .finally(() => setLoading(false))
  }, [])

  const handleRedeem = async () => {
    if (redeemAmount < 100) { toast.error('Minimum 100 points'); return }
    if (redeemAmount > data.rewardPoints) { toast.error('Insufficient points'); return }
    setRedeeming(true)
    try {
      const { data: res } = await api.post('/rewards/redeem', { points: redeemAmount })
      toast.success(res.message)
      setData(d => ({ ...d, rewardPoints: res.rewardPoints, wallet: res.wallet }))
      refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed')
    } finally {
      setRedeeming(false)
    }
  }

  const typeIcon = { earned_click: '🖱️', earned_purchase: '🛒', redeemed_cashback: '💸', redeemed_coupon: '🎟️' }
  const typeLabel = { earned_click: 'Link Click', earned_purchase: 'Purchase', redeemed_cashback: 'Cashback', redeemed_coupon: 'Coupon' }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Rewards</h1>

      {/* Wallet cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl" />
          <p className="text-xs text-yellow-400/80 uppercase tracking-wide mb-2">Reward Points</p>
          <p className="font-display text-4xl font-bold text-yellow-400">{data.rewardPoints.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">= ₹{(data.rewardPoints * 0.1).toFixed(2)} cashback value</p>
          <p className="text-xs text-gray-600 mt-1">Earn 5 pts per affiliate click</p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
          <p className="text-xs text-green-400/80 uppercase tracking-wide mb-2">Wallet Balance</p>
          <p className="font-display text-4xl font-bold text-green-400">₹{data.wallet.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Redeemed cashback</p>
        </div>
      </div>

      {/* Redeem */}
      <div className="glass rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-white mb-4">Redeem Points</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-2">Points to redeem (min. 100, 10 pts = ₹1)</label>
            <input
              type="number" min={100} max={data.rewardPoints} step={100}
              value={redeemAmount}
              onChange={e => setRedeemAmount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 mb-2">You'll get</p>
            <p className="text-lg font-bold text-green-400">₹{(redeemAmount * 0.1).toFixed(2)}</p>
          </div>
          <button
            onClick={handleRedeem}
            disabled={redeeming || data.rewardPoints < 100}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {redeeming ? 'Redeeming...' : 'Redeem'}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Transaction History</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}</div>
        ) : data.rewards.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No transactions yet. Click affiliate links to earn points!</p>
        ) : (
          <div className="space-y-2">
            {data.rewards.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeIcon[r.type] || '📋'}</span>
                  <div>
                    <p className="text-sm text-gray-200">{r.description}</p>
                    <p className="text-xs text-gray-600">{typeLabel[r.type]} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${r.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {r.points > 0 ? '+' : ''}{r.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
