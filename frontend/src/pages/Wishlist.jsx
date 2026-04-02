import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => setWishlist(data))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (productId) => {
    await api.delete(`/wishlist/${productId}`)
    setWishlist(w => w.filter(p => p._id !== productId))
    toast.success('Removed from wishlist')
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">{wishlist.length} saved products</p>
        </div>
        <Link to="/search" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">+ Add more</Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save products to track their prices</p>
          <Link to="/search" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map(p => (
            <ProductCard
              key={p._id}
              product={p}
              onWishlist={remove}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
