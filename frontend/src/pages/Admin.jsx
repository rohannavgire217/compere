import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const emptyProduct = {
  name: '', brand: '', category: '', description: '', imageUrl: '',
  tags: '',
  prices: [{ platform: 'Amazon', price: '', originalPrice: '', discount: 0, url: '', rating: 4.0, reviewCount: 0, deliveryDays: 3, inStock: true }]
}

export default function Admin() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data)).catch(() => {})
    if (tab === 'products') api.get('/products/search?').then(({ data }) => setProducts(data)).catch(() => {})
  }, [tab])

  const handleProductSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        prices: form.prices.map(p => ({ ...p, price: Number(p.price), originalPrice: Number(p.originalPrice), reviewCount: Number(p.reviewCount), deliveryDays: Number(p.deliveryDays) }))
      }
      if (editId) {
        await api.put(`/admin/products/${editId}`, payload)
        toast.success('Product updated!')
      } else {
        await api.post('/admin/products', payload)
        toast.success('Product created!')
      }
      setForm(emptyProduct)
      setEditId(null)
      const { data } = await api.get('/products/search?')
      setProducts(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async id => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/admin/products/${id}`)
    setProducts(p => p.filter(x => x._id !== id))
    toast.success('Deleted')
  }

  const editProduct = p => {
    setForm({ ...p, tags: p.tags?.join(', ') || '' })
    setEditId(p._id)
    setTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updatePrice = (idx, field, val) => {
    setForm(f => {
      const prices = [...f.prices]
      prices[idx] = { ...prices[idx], [field]: val }
      return { ...f, prices }
    })
  }

  const addPriceRow = () => setForm(f => ({
    ...f,
    prices: [...f.prices, { platform: '', price: '', originalPrice: '', discount: 0, url: '', rating: 4.0, reviewCount: 0, deliveryDays: 3, inStock: true }]
  }))

  const removePriceRow = idx => setForm(f => ({ ...f, prices: f.prices.filter((_, i) => i !== idx) }))

  const tabs = [
    { id: 'stats', label: '📊 Stats' },
    { id: 'products', label: '📦 Products' },
    { id: 'add', label: editId ? '✏️ Edit Product' : '➕ Add Product' },
    { id: 'users', label: '👥 Users' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🛡️</span>
        <h1 className="font-display text-3xl font-bold text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-blue-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats ? [
            { label: 'Total Users', value: stats.users, icon: '👥' },
            { label: 'Products', value: stats.products, icon: '📦' },
            { label: 'Reward Transactions', value: stats.rewards, icon: '🎁' },
            { label: 'Total Clicks', value: stats.totalClicks, icon: '🖱️' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-display font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          )) : <div className="col-span-4 text-center py-10 text-gray-500">Loading stats...</div>}
        </div>
      )}

      {/* Products list */}
      {tab === 'products' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-500 font-medium">Product</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left p-4 text-gray-500 font-medium">Best Price</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Platforms</th>
                <th className="text-left p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
                      <div>
                        <p className="text-gray-200 line-clamp-1 font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 hidden sm:table-cell">{p.category}</td>
                  <td className="p-4 text-green-400 font-semibold">₹{p.lowestPrice?.toLocaleString()}</td>
                  <td className="p-4 text-gray-400 hidden sm:table-cell">{p.prices?.length}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(p)} className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">Edit</button>
                      <button onClick={() => deleteProduct(p._id)} className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center text-gray-500 py-10">No products yet. Add one!</p>}
        </div>
      )}

      {/* Add/Edit product form */}
      {tab === 'add' && (
        <form onSubmit={handleProductSubmit} className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-white text-lg">{editId ? 'Edit Product' : 'Add New Product'}</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Product Name', field: 'name', required: true },
              { label: 'Brand', field: 'brand', required: true },
              { label: 'Category', field: 'category', required: true },
              { label: 'Image URL', field: 'imageUrl' },
            ].map(({ label, field, required }) => (
              <div key={field}>
                <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
                <input
                  required={required}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="earbuds, wireless, sony"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
          </div>

          {/* Platform prices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Platform Prices</label>
              <button type="button" onClick={addPriceRow} className="text-xs text-blue-400 hover:text-blue-300">+ Add Platform</button>
            </div>
            <div className="space-y-3">
              {form.prices.map((p, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      { label: 'Platform', field: 'platform', placeholder: 'Amazon' },
                      { label: 'Price (₹)', field: 'price', type: 'number', placeholder: '9999' },
                      { label: 'Original Price', field: 'originalPrice', type: 'number', placeholder: '12999' },
                      { label: 'Delivery (days)', field: 'deliveryDays', type: 'number', placeholder: '3' },
                    ].map(({ label, field, type, placeholder }) => (
                      <div key={field}>
                        <label className="text-xs text-gray-600 block mb-1">{label}</label>
                        <input type={type || 'text'} value={p[field]} placeholder={placeholder}
                          onChange={e => updatePrice(i, field, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Affiliate URL</label>
                      <input value={p.url} placeholder="https://amazon.in/..."
                        onChange={e => updatePrice(i, 'url', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={p.inStock} onChange={e => updatePrice(i, 'inStock', e.target.checked)} id={`stock-${i}`} className="rounded" />
                        <label htmlFor={`stock-${i}`} className="text-xs text-gray-400">In Stock</label>
                      </div>
                      {form.prices.length > 1 && (
                        <button type="button" onClick={() => removePriceRow(i)} className="text-xs text-red-400 hover:text-red-300 ml-auto">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {loading ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(emptyProduct); setEditId(null) }}
                className="glass text-gray-400 hover:text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-500 font-medium">User</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Role</th>
                <th className="text-left p-4 text-gray-500 font-medium">Points</th>
                <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-800/50">
                  <td className="p-4">
                    <div>
                      <p className="text-gray-200 font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-yellow-400 font-semibold">{u.rewardPoints}</td>
                  <td className="p-4 text-gray-500 text-xs hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-gray-500 py-10">No users found</p>}
        </div>
      )}
    </div>
  )
}
