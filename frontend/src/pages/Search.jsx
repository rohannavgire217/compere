import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Search() {
  const [searchParams] = useSearchParams()
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const q = searchParams.get('q') || ''
  const navigate = useNavigate()

  useEffect(() => {
    const fetchComparison = async () => {
      if (!q) return
      setLoading(true)
      try {
        // Fetch matching platform data
        const { data } = await api.get(`/engine/compare?query=${encodeURIComponent(q)}`)
        setComparison(data)
      } catch (err) {
        toast.error('Could not find matches across platforms')
      } finally {
        setLoading(false)
      }
    }
    fetchComparison()
  }, [q])

  const handleBuy = (url) => {
    window.location.href = url
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up min-h-screen">
      <div className="flex flex-col items-center justify-center mb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4 text-center tracking-tight">
          Comparison Results for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600">
            "{q}"
          </span>
        </h1>
        <div className="w-24 h-1.5 bg-emerald-500/30 rounded-full blur-sm"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Scanning Amazon, Flipkart, Snapdeal...</p>
        </div>
      ) : !comparison || comparison.platforms?.length === 0 ? (
        <div className="text-center py-32 glass-panel rounded-3xl border border-dashed border-gray-700/50 flex flex-col items-center justify-center relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10"></div>
          <div className="text-6xl mb-6">🏝️</div>
          <h3 className="text-2xl font-bold text-white mb-3">No matching items found</h3>
          <p className="text-gray-400 text-sm max-w-sm">We couldn't find matches on the verified platforms. Try a different search.</p>
          <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold transition-all border border-white/10">
            Try Different Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {comparison.platforms.map((platform) => (
             <div 
                key={platform.name}
                className="relative glass-panel rounded-[2rem] p-8 border border-white/5 hover:border-emerald-500/20 shadow-2xl transition-all duration-500 flex flex-col items-center text-center group"
             >
                {/* No Images as per strict rule */}
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                  <span className="text-xl">🏪</span>
                </div>
                
                <h3 className={`text-2xl font-black mb-2 tracking-tight ${
                   platform.name === 'Amazon' ? 'text-yellow-500' : 
                   platform.name === 'Flipkart' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {platform.name}
                </h3>
                
                <div className="mt-auto pt-8 w-full">
                   <div className="mb-8">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Starting from</p>
                      <p className="text-4xl font-black text-white">₹{platform.price?.toLocaleString() || '---'}</p>
                   </div>

                   <button
                      onClick={() => handleBuy(platform.url)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 active:scale-95 group flex items-center justify-center gap-3"
                    >
                      Buy Now
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-20 border-t border-white/5 pt-10 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-[0.5em] font-medium italic">
          Aggregated Real-time Data • Verified Redirects • No Image Rendering Enabled
        </p>
      </div>
    </div>
  )
}
