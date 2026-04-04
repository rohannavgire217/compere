import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function UnifiedSearch() {
  const [activeTab, setActiveTab] = useState('keyword') // 'keyword', 'link', 'image'
  const [query, setQuery] = useState('')
  const [link, setLink] = useState('')
  const [image, setImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (activeTab === 'keyword' && query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      } 
      else if (activeTab === 'link' && link.trim()) {
        toast.loading('Analyzing product link...', { id: 'link-load' })
        const { data: extracted } = await api.post('/engine/extract', { url: link.trim() })
        
        toast.success(`Identified: ${extracted.product_name}`, { id: 'link-load' })
        navigate(`/search?q=${encodeURIComponent(extracted.product_name)}`)
      } 
      else if (activeTab === 'image' && image) {
        toast.loading('Scanning image for product details...', { id: 'img-load' })
        const { data: imgData } = await api.post('/engine/image-search', { fileName: image.name })
        
        toast.success(`Detected: ${imgData.product_name}`, { id: 'img-load' })
        navigate(`/search?q=${encodeURIComponent(imgData.product_name)}`)
      }
    } catch (err) {
      toast.dismiss('link-load')
      toast.dismiss('img-load')
      toast.error('Could not process this input. Try keyword search.')
    } finally {
      setLoading(false)
    }
  }

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      toast.success(`Product image selected!`)
    } else {
      toast.error('Please drop an image file.')
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      toast.success(`Product image selected!`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto relative group px-4">
      {/* Background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      
      <div className="relative glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Modal-style Tabs */}
        <div className="flex border-b border-white/5 bg-white/5">
          {[
            { id: 'keyword', label: 'By Keyword', icon: '🔍' },
            { id: 'link', label: 'Paste URL', icon: '🔗' },
            { id: 'image', label: 'Visual Scan', icon: '📸' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-xs sm:text-sm font-bold tracking-tight transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                  ? 'text-white bg-white/5 border-b-2 border-emerald-500' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Inputs */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {activeTab === 'keyword' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter product or model i.e. Sony WH-1000XM5"
                  className="flex-1 bg-gray-950/50 border border-gray-700/50 rounded-2xl px-6 py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-lg transition-all"
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Compare'}
                </button>
              </div>
            )}

            {activeTab === 'link' && (
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste URL from Amazon, Flipkart, or Snapdeal"
                  disabled={loading}
                  className="flex-1 bg-gray-950/50 border border-gray-700/50 rounded-2xl px-6 py-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-lg transition-all disabled:opacity-50"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                   {loading ? 'Analyzing...' : 'Find Same Item'}
                </button>
              </div>
            )}

            {activeTab === 'image' && (
              <div 
                className={`relative border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer group/drop flex items-center justify-center ${
                  isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900/40'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                onDragOver={!loading ? onDragOver : null}
                onDragLeave={!loading ? onDragLeave : null}
                onDrop={!loading ? onDrop : null}
                onClick={() => !loading && document.getElementById('image-upload').click()}
              >
                <input 
                  type="file" 
                  id="image-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                  disabled={loading}
                />
                
                <div className="text-center">
                  {image ? (
                    <div className="animate-fade-in-up">
                      <p className="text-emerald-400 font-bold text-lg">✅ Scanned File: {image.name}</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImage(null); }}
                        className="text-xs text-red-400 hover:text-red-300 underline mt-2"
                        disabled={loading}
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover/drop:scale-110 transition-transform">
                        <span className="text-2xl text-emerald-400">📤</span>
                      </div>
                      <h4 className="text-white font-medium mb-1 uppercase tracking-widest text-xs">Drag & Drop Image Scan</h4>
                      <p className="text-gray-500 text-sm">Convert image to product keyword search</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'image' && image && (
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg animate-fade-in-up disabled:opacity-50 mt-2"
              >
                {loading ? 'Identifying product...' : 'Search Matching Item'}
              </button>
            )}
          </form>

          {/* Verification Indicators */}
          <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-white/5 pt-6">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full"></span> Multi-Platform Search (Amazon, Flipkart, Snapdeal)
            </p>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 animate-pulse rounded-full"></span> Real-time Price Comparisons
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
