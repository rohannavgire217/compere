import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const platformColors = { Amazon: '#fb923c', Flipkart: '#60a5fa', Croma: '#4ade80', default: '#a78bfa' }

export default function ProductDetail() {
  const { id } = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ data: prod }, { data: hist }] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/prices/${id}/history`)
        ])
        setProduct(prod)
        setHistory(hist.history?.map(h => ({
          date: new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          price: h.price,
          platform: h.platform
        })) || [])
      } catch (err) {
        toast.error('Product not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetch()

    if (user) {
      api.get('/wishlist').then(({ data }) => {
        setIsWishlisted(data.some(p => p._id === id))
      }).catch(() => {})
    }
  }, [id, user])

  const handleBuy = async (platform, url) => {
    try {
      const { data } = await api.post(`/products/${id}/click`, { platform })
      if (data.pointsEarned > 0) {
        toast.success(`+${data.pointsEarned} points earned! 🎁`)
        refreshUser()
      }
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      window.open(url, '_blank', 'noopener')
    }
  }

  const toggleWishlist = async () => {
    if (!user) { toast.error('Login to save to wishlist'); return }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/wishlist/${id}`)
        setIsWishlisted(true)
        toast.success('Saved to wishlist ❤️')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!product) return null

  const bestPrice = product.prices?.reduce((a, b) => a.price < b.price ? a : b, product.prices[0])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-white mb-6 flex items-center gap-2 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Image + info */}
        <div>
          <div className="glass rounded-2xl overflow-hidden h-80 mb-4">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">{product.brand} · {product.category}</p>
            <h1 className="text-xl font-semibold text-white mb-2">{product.name}</h1>
            <p className="text-sm text-gray-400 mb-4">{product.description}</p>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500">Best price</p>
                <p className="text-2xl font-display font-bold text-green-400">₹{bestPrice?.price?.toLocaleString()}</p>
              </div>
              {product.lowestPriceEver && (
                <div className="ml-4 border-l border-gray-700 pl-4">
                  <p className="text-xs text-gray-500">Lowest ever</p>
                  <p className="text-lg font-bold text-blue-400">₹{product.lowestPriceEver?.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={toggleWishlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${isWishlisted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400'}`}
              >
                <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
              {user && <p className="text-xs text-gray-500 self-center">Click a store to earn +5 points 🎁</p>}
            </div>
          </div>
        </div>

        {/* Right: Price comparison + chart */}
        <div className="space-y-4">
          {/* Price comparison table */}
          <div className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4">Price Comparison</h2>
            <div className="space-y-3">
              {product.prices?.sort((a, b) => a.price - b.price).map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700/50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" style={{ color: platformColors[p.platform] || platformColors.default }}>
                        {p.platform}
                      </span>
                      {i === 0 && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Best Deal</span>}
                      {!p.inStock && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Out of Stock</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3 h-3 ${s <= Math.round(p.rating) ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{p.reviewCount?.toLocaleString()} reviews</span>
                      <span className="text-xs text-gray-500">🚚 {p.deliveryDays}d</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {p.originalPrice > p.price && (
                      <p className="text-xs text-gray-600 line-through">₹{p.originalPrice?.toLocaleString()}</p>
                    )}
                    <p className={`text-lg font-bold ${i === 0 ? 'text-green-400' : 'text-gray-200'}`}>₹{p.price?.toLocaleString()}</p>
                    {p.discount > 0 && <p className="text-xs text-green-500">{p.discount}% off</p>}
                    <button
                      onClick={() => handleBuy(p.platform, p.url)}
                      disabled={!p.inStock}
                      className={`mt-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${p.inStock ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                      {p.inStock ? 'Buy Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price history chart */}
          {history.length > 1 && (
            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-4">Price History</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                    formatter={v => [`₹${v.toLocaleString()}`, 'Price']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              {product.lowestPriceEver && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  🏆 Lowest ever: <span className="text-green-400 font-medium">₹{product.lowestPriceEver.toLocaleString()}</span>
                  {product.lowestPriceEverDate && ` on ${new Date(product.lowestPriceEverDate).toLocaleDateString('en-IN')}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
