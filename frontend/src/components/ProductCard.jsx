import { Link } from 'react-router-dom'

const platformColors = {
  Amazon: 'text-orange-400',
  Flipkart: 'text-blue-400',
  Croma: 'text-green-400',
  'Mi Store': 'text-orange-300',
  'Reliance Digital': 'text-blue-300',
  'Samsung Store': 'text-cyan-400',
  'Nike Store': 'text-gray-300',
}

export default function ProductCard({ product, onWishlist, isWishlisted }) {
  const bestPrice = product.prices?.reduce((a, b) => a.price < b.price ? a : b, product.prices[0])
  const worstPrice = product.prices?.reduce((a, b) => a.price > b.price ? a : b, product.prices[0])
  const savings = worstPrice?.price - bestPrice?.price

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group">
      <Link to={`/product/${product._id}`}>
        <div className="relative h-44 bg-gray-800 overflow-hidden">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-gray-900/80 backdrop-blur text-gray-300 px-2 py-1 rounded-lg">{product.category}</span>
          </div>
          {savings > 0 && (
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg font-medium">
                Save ₹{savings.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-sm font-medium text-gray-100 line-clamp-2 mb-3 hover:text-blue-400 transition-colors">{product.name}</h3>
        </Link>

        {/* Platform prices */}
        <div className="space-y-1.5 mb-3">
          {product.prices?.slice(0, 3).map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className={`text-xs font-medium ${platformColors[p.platform] || 'text-gray-400'}`}>{p.platform}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${p.price === bestPrice?.price ? 'text-green-400' : 'text-gray-200'}`}>
                  ₹{p.price.toLocaleString()}
                </span>
                {p.price === bestPrice?.price && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Best</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stars */}
        {bestPrice?.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3 h-3 ${s <= Math.round(bestPrice.rating) ? 'text-yellow-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500">{bestPrice.rating} ({bestPrice.reviewCount?.toLocaleString()})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link to={`/product/${product._id}`} className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 rounded-lg font-medium transition-colors">
            Compare Prices
          </Link>
          {onWishlist && (
            <button
              onClick={() => onWishlist(product._id)}
              className={`p-2 rounded-lg border transition-colors ${isWishlisted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'border-gray-700 text-gray-500 hover:border-red-500/50 hover:text-red-400'}`}
            >
              <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
