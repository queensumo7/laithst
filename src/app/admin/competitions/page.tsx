'use client'
import { useState, useEffect } from 'react'
import { Competition } from '@/types'
import { format } from 'date-fns'

const inputStyle = { width: '100%', background: '#1a1a18', border: '0.5px solid rgba(240,234,216,0.1)', color: '#f0ead8', padding: '0.65rem 0.9rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.72rem', fontWeight: 200, outline: 'none', boxSizing: 'border-box' as const }
const labelStyle = { fontSize: '0.52rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a8a7a', display: 'block', marginBottom: '0.4rem', fontWeight: 300 }
const selectStyle = { ...inputStyle, appearance: 'none' as const, cursor: 'pointer' }
const statusColors: Record<string, string> = { open: '#1d9e75', soon: '#c9a96e', closed: '#8a8a7a', past: '#444' }

const emptyForm = { name: '', location: '', country: '', region: 'uae', event_date: '', status: 'soon', event_type: 'Show Jumping', notes: '' }

export default function AdminCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchCompetitions() }, [])

  async function fetchCompetitions() {
    setLoading(true)
    const res = await fetch('/api/competitions')
    const data = await res.json()
    setCompetitions(data.competitions || [])
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const method = editId ? 'PATCH' : 'POST'
    const url = editId ? `/api/competitions/${editId}` : '/api/competitions'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { await fetchCompetitions(); setShowForm(false); setEditId(null); setForm(emptyForm) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this competition? This will also delete all related bookings.')) return
    setDeleting(id)
    await fetch(`/api/competitions/${id}`, { method: 'DELETE' })
    await fetchCompetitions()
    setDeleting(null)
  }

  function startEdit(c: Competition) {
    setForm({ name: c.name, location: c.location, country: c.country, region: c.region, event_date: c.event_date, status: c.status, event_type: c.event_type, notes: c.notes || '' })
    setEditId(c.id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  return (
    <div style={{ padding: '2.5rem 3rem', color: '#f0ead8', fontFamily: "'Raleway', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
        <div>
          <p style={{ fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 200, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><span style={{ display: 'block', width: '1.2rem', height: '0.5px', background: '#c9a96e' }}></span>Admin</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.02em' }}>Competition <em style={{ fontWeight: 300, fontStyle: 'italic', color: '#e2c99a' }}>Schedule</em></h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm) }} style={{ background: showForm ? 'transparent' : '#c9a96e', color: showForm ? '#c9a96e' : '#0a0a0a', border: '0.5px solid #c9a96e', padding: '0.65rem 1.5rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 300 }}>
          {showForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#111110', border: '0.5px solid rgba(201,169,110,0.18)', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0ead8', marginBottom: '1.5rem' }}>{editId ? 'Edit Competition' : 'New Competition'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={labelStyle}>Event Name</label><input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Abu Dhabi Equestrian Club" /></div>
            <div><label style={labelStyle}>Event Type</label><input style={inputStyle} value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} placeholder="Show Jumping" /></div>
            <div><label style={labelStyle}>Location / City</label><input style={inputStyle} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Abu Dhabi" /></div>
            <div><label style={labelStyle}>Country</label><input style={inputStyle} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="UAE" /></div>
            <div><label style={labelStyle}>Region</label><select style={selectStyle} value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}><option value="uae">UAE</option><option value="europe">Europe</option><option value="qatar">Qatar</option><option value="other">Other</option></select></div>
            <div><label style={labelStyle}>Event Date</label><input type="date" style={inputStyle} value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /></div>
            <div><label style={labelStyle}>Status</label><select style={selectStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="soon">Coming Soon</option><option value="open">Booking Open</option><option value="closed">Closed</option><option value="past">Past</option></select></div>
            <div><label style={labelStyle}>Notes (internal)</label><input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional internal notes" /></div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ background: '#c9a96e', color: '#0a0a0a', border: 'none', padding: '0.8rem 2rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 400, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editId ? 'Update Competition' : 'Create Competition'}
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: '#8a8a7a', fontSize: '0.7rem', letterSpacing: '0.08em' }}>Loading competitions...</p>
      ) : (
        <div style={{ border: '0.5px solid rgba(201,169,110,0.18)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 130px 100px 120px', padding: '0.8rem 1.5rem', background: '#1a1a18', fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a8a7a', fontWeight: 300, borderBottom: '0.5px solid rgba(201,169,110,0.18)', gap: '1rem' }}>
            <span>Event</span><span>Location</span><span>Date</span><span>Type</span><span>Status</span><span>Actions</span>
          </div>
          {competitions.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 130px 100px 120px', padding: '1.1rem 1.5rem', borderBottom: '0.5px solid rgba(240,234,216,0.05)', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.9rem', fontWeight: 700, color: '#f0ead8' }}>{c.name}</div>
              <div style={{ fontSize: '0.65rem', color: '#8a8a7a', fontWeight: 200 }}>{c.location}, {c.country}</div>
              <div style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 200 }}>{format(new Date(c.event_date), 'dd MMM yyyy')}</div>
              <div style={{ fontSize: '0.62rem', color: '#8a8a7a', fontWeight: 200 }}>{c.event_type}</div>
              <div><span style={{ fontSize: '0.48rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', border: `0.5px solid ${statusColors[c.status]}`, color: statusColors[c.status], fontWeight: 300 }}>{c.status}</span></div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => startEdit(c)} style={{ background: 'none', border: '0.5px solid rgba(201,169,110,0.3)', color: '#c9a96e', padding: '0.3rem 0.7rem', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif" }}>Edit</button>
                <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} style={{ background: 'none', border: '0.5px solid rgba(226,75,74,0.3)', color: '#e24b4a', padding: '0.3rem 0.7rem', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", opacity: deleting === c.id ? 0.5 : 1 }}>Del</button>
              </div>
            </div>
          ))}
          {competitions.length === 0 && <div style={{ padding: '2rem 1.5rem', fontSize: '0.65rem', color: '#8a8a7a', fontStyle: 'italic' }}>No competitions yet. Add your first event above.</div>}
        </div>
      )}
    </div>
  )
}
