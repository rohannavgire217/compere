import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Compare() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([null, null])
  const [search, setSearch] = useState(['', ''])
  const [results, setResults] = useState([[], []])
  const [loading, setLoading] = useState([false, false])

  const searchProduct = async (index, q) => {
    if (!q.trim()) return
    setLoading(l => { const n = [...l]; n[index] = true; return n })
    try {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(q)}`)
      setResults(r => { const n = [...r]; n[index] = data.slice(0, 5); return n })
    } catch (_) {
      toast.error('Search failed')
    } finally {
      setLoading(l => { const n = [...l]; n[index] = false; return n })
    }
  }

  const selectProduct = (index, product) => {
    setProducts(p => { const n = [...p]; n[index] = product; return n })
    setResults(r => { const n = [...r]; n[index] = []; return n })
    setSearch(s => { const n = [...s]; n[index] = product.name; return n })
  }

  const getBestPlatform = (product) => product?.prices?.reduce((a, b) => a.price < b.price ? a : b, product.prices[0])

  const attrs = [
    { label: 'Brand', get: p => p.brand },
    { label: 'Category', get: p => p.category },
    { label: 'Best Price', get: p => `₹${getBestPlatform(p)?.price?.toLocaleString()}`, highlight: true },
    { label: 'Best Platform', get: p => getBestPlatform(p)?.platform },
    { label: 'Highest Price', get: p => `₹${p.prices?.reduce((a, b) => a.price > b.price ? a : b, p.prices[0])?.price?.toLocaleString()}` },
    { label: 'Rating', get: p => `${getBestPlatform(p)?.rating} ⭐` },
    { label: 'Reviews', get: p => getBestPlatform(p)?.reviewCount?.toLocaleString() },
    { label: 'Delivery', get: p => `${getBestPlatform(p)?.deliveryDays} days` },
    { label: 'Platforms', get: p => `${p.prices?.length} stores` },
    { label: 'Lowest Ever', get: p => p.lowestPriceEver ? `₹${p.lowestPriceEver?.toLocaleString()}` : 'N/A' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Compare Products</h1>
        <p className="text-gray-400 text-sm">Search and select two products to compare side by side</p>
      </div>

      {/* Search bars */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {[0, 1].map(i => (
          <div key={i} className="relative">
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Product {i + 1}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search[i]}
                onChange={e => { const n = [...search]; n[i] = e.target.value; setSearch(n) }}
                onKeyDown={e => e.key === 'Enter' && searchProduct(i, search[i])}
                placeholder={`Search product ${i + 1}...`}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => searchProduct(i, search[i])}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                {loading[i] ? '...' : '→'}
              </button>
            </div>

            {/* Dropdown results */}
            {results[i].length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-gray-700 z-20 overflow-hidden">
                {results[i].map(p => (
                  <button
                    key={p._id}
                    onClick={() => selectProduct(i, p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/80 transition-colors text-left"
                  >
                    <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm text-gray-200 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-green-400">₹{p.lowestPrice?.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {products.some(Boolean) && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Product headers */}
          <div className="grid grid-cols-3 border-b border-gray-800">
            <div className="p-4 border-r border-gray-800">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Attribute</span>
            </div>
            {[0, 1].map(i => (
              <div key={i} className={`p-4 ${i === 0 ? 'border-r border-gray-800' : ''}`}>
                {products[i] ? (
                  <div className="flex items-center gap-3">
                    <img src={products[i].imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs text-gray-400">{products[i].brand}</p>
                      <p className="text-sm font-medium text-white line-clamp-2">{products[i].name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">Select product {i + 1}</p>
                )}
              </div>
            ))}
          </div>

          {/* Attribute rows */}
          {attrs.map((attr, rowIdx) => {
            const vals = products.map(p => p ? attr.get(p) : '—')
            const prices = attr.highlight && products.every(Boolean)
              ? products.map(p => getBestPlatform(p)?.price)
              : null

            return (
              <div key={rowIdx} className={`grid grid-cols-3 border-b border-gray-800/50 ${rowIdx % 2 === 0 ? 'bg-gray-900/20' : ''}`}>
                <div className="p-4 border-r border-gray-800">
                  <span className="text-xs text-gray-500">{attr.label}</span>
                </div>
                {[0, 1].map(i => {
                  const isBetter = prices && prices[i] !== null && prices[i] < prices[1 - i]
                  return (
                    <div key={i} className={`p-4 ${i === 0 ? 'border-r border-gray-800' : ''} ${isBetter ? 'bg-green-500/5' : ''}`}>
                      <span className={`text-sm font-medium ${attr.highlight && isBetter ? 'text-green-400' : 'text-gray-200'}`}>
                        {products[i] ? vals[i] : <span className="text-gray-700">—</span>}
                      </span>
                      {isBetter && <span className="ml-2 text-xs text-green-500">✓ Cheaper</span>}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* All platform prices */}
          {products.every(Boolean) && (
            <div className="grid grid-cols-3 p-4 gap-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide pt-2">All Prices</div>
              {[0, 1].map(i => (
                <div key={i} className="space-y-2">
                  {products[i]?.prices?.sort((a, b) => a.price - b.price).map((p, j) => (
                    <div key={j} className="flex justify-between text-xs">
                      <span className="text-gray-400">{p.platform}</span>
                      <span className={j === 0 ? 'text-green-400 font-semibold' : 'text-gray-300'}>₹{p.price?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Buy buttons */}
          {products.every(Boolean) && (
            <div className="grid grid-cols-3 p-4 border-t border-gray-800">
              <div />
              {[0, 1].map(i => (
                <div key={i}>
                  <Link
                    to={`/product/${products[i]._id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-500 text-white text-sm py-2.5 rounded-xl font-medium transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!products.some(Boolean) && (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="text-5xl mb-4">⚖️</div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No products selected</h3>
          <p className="text-gray-500 text-sm">Search for two products above to compare them</p>
        </div>
      )}
    </div>
  )
}
