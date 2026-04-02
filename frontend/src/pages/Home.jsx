import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const categories = ['Electronics', 'Smartphones', 'Tablets', 'Laptops', 'Monitors', 'Wearables', 'Kitchen', 'Footwear', 'Computer Accessories']

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => setFeatured(data)).catch(() => {}).finally(() => setLoading(false))
    if (user) {
      api.get('/wishlist').then(({ data }) => setWishlist(data.map(p => p._id))).catch(() => {})
    }
  }, [user])

  const handleSearch = e => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Login to save to wishlist'); return }
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${productId}`)
        setWishlist(w => w.filter(id => id !== productId))
        toast.success('Removed from wishlist')
      } else {
        await api.post(`/wishlist/${productId}`)
        setWishlist(w => [...w, productId])
        toast.success('Added to wishlist ❤️')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-gray-950 to-gray-950" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -top-10 -left-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-400 font-medium">Compare prices across 5+ platforms</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Stop overpaying.<br />
            <span className="text-blue-400">Start saving.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            PricePulse compares prices across Amazon, Flipkart & more — in real time. Earn rewards on every purchase.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Try: Sony headphones, iPhone 15, Nike shoes..."
              className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-5 py-3.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap">
              Search →
            </button>
          </form>

          {/* Quick stats */}
          <div className="flex justify-center gap-8 mt-10 text-center">
            {[['10+', 'Products'], ['5+', 'Platforms'], ['100%', 'Free']].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-2xl font-bold text-white">{val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => navigate(`/search?category=${cat}`)}
              className="shrink-0 text-xs border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 px-3 py-1.5 rounded-full transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-white">Trending Deals</h2>
          <button onClick={() => navigate('/search')} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all →</button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                onWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(p._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reward banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <h2 className="font-display text-3xl font-bold text-white mb-2">Earn while you shop 🎁</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Earn points every time you click an affiliate link. Redeem for real cashback — 10 points = ₹1</p>
          <button onClick={() => navigate(user ? '/rewards' : '/register')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            {user ? 'View My Rewards' : 'Sign Up & Start Earning'}
          </button>
        </div>
      </section>
    </main>
  )
}
