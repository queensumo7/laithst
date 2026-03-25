'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { PortfolioItem } from '@/types'

const inputStyle = { width: '100%', background: '#1a1a18', border: '0.5px solid rgba(240,234,216,0.1)', color: '#f0ead8', padding: '0.65rem 0.9rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.72rem', fontWeight: 200, outline: 'none', boxSizing: 'border-box' as const }
const labelStyle = { fontSize: '0.52rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a8a7a', display: 'block', marginBottom: '0.4rem', fontWeight: 300 }
const catColors = { competition: '#c9a96e', private: '#378add', reel: '#1d9e75' }

const emptyForm = { title: '', category: 'competition', alt_text: '', is_featured: false, sort_order: 0 }

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploadedPath, setUploadedPath] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { fetchItems() }, [filterCat])

  async function fetchItems() {
    setLoading(true)
    const params = filterCat !== 'all' ? `?category=${filterCat}` : ''
    const res = await fetch(`/api/portfolio${params}`)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', form.category)
    const res = await fetch('/api/portfolio', { method: 'PUT', body: fd })
    const data = await res.json()
    if (data.url) { setUploadedUrl(data.url); setUploadedPath(data.path) }
    setUploading(false)
  }, [form.category])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] }, maxFiles: 1 })

  async function handleSave() {
    if (!form.title) return
    setSaving(true)
    const payload = {
      ...form,
      image_url: uploadedUrl || form.image_url || null,
      storage_path: uploadedPath || form.storage_path || null,
      is_featured: Boolean(form.is_featured),
      sort_order: Number(form.sort_order),
    }
    const method = editId ? 'PATCH' : 'POST'
    const url = editId ? `/api/portfolio/${editId}` : '/api/portfolio'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) { await fetchItems(); resetForm() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return
    setDeleting(id)
    await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
    await fetchItems()
    setDeleting(null)
  }

  async function toggleFeatured(id: string, current: boolean) {
    await fetch(`/api/portfolio/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_featured: !current }) })
    await fetchItems()
  }

  function resetForm() { setForm(emptyForm); setUploadedUrl(''); setUploadedPath(''); setEditId(null); setShowForm(false) }

  function startEdit(item: PortfolioItem) {
    setForm({ title: item.title, category: item.category, alt_text: item.alt_text || '', is_featured: item.is_featured, sort_order: item.sort_order, image_url: item.image_url || '' })
    setUploadedUrl(item.image_url || ''); setUploadedPath(item.storage_path || ''); setEditId(item.id); setShowForm(true); window.scrollTo(0, 0)
  }

  const filtered = filterCat === 'all' ? items : items.filter(i => i.category === filterCat)

  return (
    <div style={{ padding: '2.5rem 3rem', color: '#f0ead8', fontFamily: "'Raleway', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
        <div>
          <p style={{ fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 200, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><span style={{ display: 'block', width: '1.2rem', height: '0.5px', background: '#c9a96e' }}></span>Admin</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.02em' }}>Portfolio <em style={{ fontWeight: 300, fontStyle: 'italic', color: '#e2c99a' }}>Manager</em></h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }} style={{ background: showForm ? 'transparent' : '#c9a96e', color: showForm ? '#c9a96e' : '#0a0a0a', border: '0.5px solid #c9a96e', padding: '0.65rem 1.5rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 300 }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div style={{ background: '#111110', border: '0.5px solid rgba(201,169,110,0.18)', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0ead8', marginBottom: '1.5rem' }}>{editId ? 'Edit Item' : 'Upload New Item'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
            <div><label style={labelStyle}>Title</label><input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Abu Dhabi Grand Prix" /></div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={{ ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="competition">Competition</option>
                <option value="private">Private Shoot</option>
                <option value="reel">Reel</option>
              </select>
            </div>
            <div><label style={labelStyle}>Alt Text (accessibility)</label><input style={inputStyle} value={form.alt_text} onChange={e => setForm({ ...form, alt_text: e.target.value })} placeholder="Horse jumping at Abu Dhabi" /></div>
            <div><label style={labelStyle}>Sort Order (lower = first)</label><input type="number" style={inputStyle} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} placeholder="0" /></div>
          </div>

          {/* Featured toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} style={{ accentColor: '#c9a96e', width: '16px', height: '16px' }} />
            <label htmlFor="featured" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#8a8a7a', cursor: 'pointer', fontWeight: 300 }}>Feature this item (shown on homepage)</label>
          </div>

          {/* Dropzone */}
          <div {...getRootProps()} style={{ border: `0.5px dashed ${isDragActive ? '#c9a96e' : 'rgba(201,169,110,0.3)'}`, padding: '2rem', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(201,169,110,0.04)' : 'transparent', transition: 'all 0.2s', marginBottom: '1.2rem' }}>
            <input {...getInputProps()} />
            {uploading ? (
              <p style={{ fontSize: '0.65rem', color: '#c9a96e', letterSpacing: '0.1em' }}>Uploading...</p>
            ) : uploadedUrl ? (
              <div>
                <div style={{ width: '80px', height: '60px', background: `url(${uploadedUrl}) center/cover`, margin: '0 auto 0.6rem', border: '0.5px solid rgba(201,169,110,0.3)' }}></div>
                <p style={{ fontSize: '0.6rem', color: '#1d9e75', letterSpacing: '0.1em' }}>✓ Uploaded — drag another to replace</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.68rem', color: '#8a8a7a', marginBottom: '0.3rem' }}>Drag & drop an image or video here</p>
                <p style={{ fontSize: '0.56rem', color: 'rgba(138,138,122,0.5)', letterSpacing: '0.1em' }}>or click to browse · JPG, PNG, MP4, MOV</p>
              </div>
            )}
          </div>

          {/* External URL fallback */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={labelStyle}>Or paste an image URL directly</label>
            <input style={inputStyle} value={form.image_url || ''} onChange={e => { setForm({ ...form, image_url: e.target.value }); setUploadedUrl(e.target.value) }} placeholder="https://..." />
          </div>

          <button onClick={handleSave} disabled={saving || !form.title} style={{ background: '#c9a96e', color: '#0a0a0a', border: 'none', padding: '0.8rem 2rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 400, opacity: (saving || !form.title) ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Item' : 'Save to Portfolio'}
          </button>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '0.5px solid rgba(201,169,110,0.12)', marginBottom: '1.5rem' }}>
        {['all', 'competition', 'private', 'reel'].map(f => (
          <button key={f} onClick={() => setFilterCat(f)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${filterCat === f ? '#c9a96e' : 'transparent'}`, color: filterCat === f ? '#c9a96e' : '#8a8a7a', padding: '0.8rem 1.2rem', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontWeight: 200, marginBottom: '-0.5px' }}>
            {f === 'all' ? 'All' : f === 'private' ? 'Private Shoots' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: '#8a8a7a', fontSize: '0.7rem' }}>Loading portfolio...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#8a8a7a', fontSize: '0.68rem', fontStyle: 'italic' }}>No items yet. Upload your first image above.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(201,169,110,0.12)' }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
              {/* Thumbnail */}
              <div style={{ aspectRatio: '3/4', background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(160deg,#1e1c16,#2a2518)', position: 'relative' }}>
                {item.category === 'reel' && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(10,10,10,0.8)', fontSize: '0.44rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', padding: '0.18rem 0.4rem', border: '0.5px solid rgba(201,169,110,0.3)', fontFamily: "'Raleway', sans-serif" }}>Reel</div>
                )}
                {item.is_featured && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: '#c9a96e', fontSize: '0.44rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0a0a0a', padding: '0.18rem 0.4rem', fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}>★</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '0.9rem' }}>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.82rem', fontWeight: 700, color: '#f0ead8', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.46rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.18rem 0.45rem', border: `0.5px solid ${catColors[item.category]}`, color: catColors[item.category], fontWeight: 300, fontFamily: "'Raleway', sans-serif" }}>{item.category}</span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => toggleFeatured(item.id, item.is_featured)} title={item.is_featured ? 'Unfeature' : 'Feature'} style={{ background: 'none', border: '0.5px solid rgba(201,169,110,0.2)', color: item.is_featured ? '#c9a96e' : '#8a8a7a', padding: '0.2rem 0.4rem', fontSize: '0.55rem', cursor: 'pointer' }}>★</button>
                    <button onClick={() => startEdit(item)} style={{ background: 'none', border: '0.5px solid rgba(201,169,110,0.2)', color: '#c9a96e', padding: '0.2rem 0.45rem', fontSize: '0.46rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} style={{ background: 'none', border: '0.5px solid rgba(226,75,74,0.25)', color: '#e24b4a', padding: '0.2rem 0.45rem', fontSize: '0.46rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif', opacity: deleting === item.id ? 0.5 : 1" }}>Del</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
