import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'relevance'
  })
  const { user } = useAuth()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (filters.category) params.set('category', filters.category)
        if (filters.minPrice) params.set('minPrice', filters.minPrice)
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
        if (filters.sort !== 'relevance') params.set('sort', filters.sort)
        const { data } = await api.get(`/products/search?${params}`)
        setProducts(data)
      } catch (err) {
        toast.error('Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [q, filters])

  useEffect(() => {
    if (user) {
      api.get('/wishlist').then(({ data }) => setWishlist(data.map(p => p._id))).catch(() => {})
    }
  }, [user])

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Login to save to wishlist'); return }
    try {
      if (wishlist.includes(productId)) {
        await api.delete(`/wishlist/${productId}`)
        setWishlist(w => w.filter(id => id !== productId))
      } else {
        await api.post(`/wishlist/${productId}`)
        setWishlist(w => [...w, productId])
        toast.success('Added to wishlist ❤️')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const categories = ['Electronics', 'Smartphones', 'Tablets', 'Laptops', 'Monitors', 'Wearables', 'Kitchen', 'Footwear', 'Computer Accessories']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="glass rounded-2xl p-4 space-y-6 sticky top-20">
            <h3 className="font-semibold text-white">Filters</h3>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Price Range (₹)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.minPrice}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
                <input type="number" placeholder="Max" value={filters.maxPrice}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Sort By</label>
              <select
                value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'relevance' })}
              className="w-full text-xs text-gray-500 hover:text-red-400 transition-colors py-1"
            >
              Clear filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              {q && <h1 className="text-xl font-semibold text-white">Results for "<span className="text-blue-400">{q}</span>"</h1>}
              {!q && filters.category && <h1 className="text-xl font-semibold text-white">{filters.category}</h1>}
              {!q && !filters.category && <h1 className="text-xl font-semibold text-white">All Products</h1>}
              <p className="text-sm text-gray-500 mt-0.5">{products.length} results found</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl h-64 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm">Try different keywords or clear your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(p._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
