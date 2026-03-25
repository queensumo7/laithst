'use client'
import { useState, useEffect } from 'react'
import { CompetitionBooking, PACKAGE_LABELS, PACKAGE_PRICES } from '@/types'
import { format } from 'date-fns'

const statusColors: Record<string, string> = { pending: '#c9a96e', confirmed: '#1d9e75', cancelled: '#e24b4a', completed: '#8a8a7a' }
const labelStyle = { fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a8a7a', fontWeight: 300 }

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchBookings() }, [filter])

  async function fetchBookings() {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/bookings${params}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await fetchBookings()
    if (selected?.id === id) setSelected({ ...selected, status })
    setUpdating(false)
  }

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
  const total = bookings.reduce((s: number, b: any) => s + (b.package_price || 0), 0)

  return (
    <div style={{ padding: '2.5rem 3rem', color: '#f0ead8', fontFamily: "'Raleway', sans-serif", display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
          <p style={{ fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 200, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><span style={{ display: 'block', width: '1.2rem', height: '0.5px', background: '#c9a96e' }}></span>Admin</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.02em' }}>Booking <em style={{ fontWeight: 300, fontStyle: 'italic', color: '#e2c99a' }}>Requests</em></h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.6rem', fontWeight: 900, color: '#c9a96e', letterSpacing: '-0.02em' }}>AED {total.toLocaleString()}</div>
              <div style={{ ...labelStyle, fontSize: '0.48rem' }}>Total value shown</div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '0.5px solid rgba(201,169,110,0.12)', marginBottom: '1.5rem' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${filter === f ? '#c9a96e' : 'transparent'}`, color: filter === f ? '#c9a96e' : '#8a8a7a', padding: '0.8rem 1.2rem', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontWeight: 200, marginBottom: '-0.5px', transition: 'all 0.2s' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color: '#8a8a7a', fontSize: '0.7rem' }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <p style={{ color: '#8a8a7a', fontSize: '0.68rem', fontStyle: 'italic' }}>No {filter !== 'all' ? filter : ''} bookings found.</p>
        ) : (
          <div style={{ border: '0.5px solid rgba(201,169,110,0.18)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 90px 100px 90px 80px', padding: '0.7rem 1.2rem', background: '#1a1a18', gap: '1rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
              {['Client', 'Competition', 'Horse', 'Package', 'Price', 'Status'].map(h => (
                <span key={h} style={{ ...labelStyle, fontSize: '0.48rem' }}>{h}</span>
              ))}
            </div>
            {bookings.map((b: any) => (
              <div key={b.id} onClick={() => setSelected(selected?.id === b.id ? null : b)} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 90px 100px 90px 80px', padding: '1rem 1.2rem', borderBottom: '0.5px solid rgba(240,234,216,0.05)', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: selected?.id === b.id ? 'rgba(201,169,110,0.04)' : 'transparent', transition: 'background 0.2s' }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.88rem', fontWeight: 700, color: '#f0ead8' }}>{b.first_name} {b.last_name}</div>
                  <div style={{ fontSize: '0.56rem', color: '#8a8a7a', fontWeight: 200 }}>{b.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#f0ead8', fontWeight: 300 }}>{b.competition?.name || '—'}</div>
                  <div style={{ fontSize: '0.56rem', color: '#8a8a7a', fontWeight: 200 }}>{b.competition?.event_date ? format(new Date(b.competition.event_date), 'dd MMM yyyy') : ''}</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 200 }}>{b.horse_name}</div>
                <div style={{ fontSize: '0.62rem', color: '#f0ead8', fontWeight: 200 }}>{PACKAGE_LABELS[b.package as keyof typeof PACKAGE_LABELS]}</div>
                <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.9rem', fontWeight: 700, color: '#c9a96e' }}>AED {b.package_price}</div>
                <span style={{ fontSize: '0.46rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', border: `0.5px solid ${statusColors[b.status]}`, color: statusColors[b.status], fontWeight: 300, whiteSpace: 'nowrap' as const }}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ background: '#111110', border: '0.5px solid rgba(201,169,110,0.18)', padding: '2rem', position: 'sticky', top: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.01em' }}>{selected.first_name} {selected.last_name}</div>
              <div style={{ fontSize: '0.58rem', color: '#8a8a7a', marginTop: '0.2rem' }}>{format(new Date(selected.created_at), 'dd MMM yyyy, HH:mm')}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8a8a7a', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
            {[
              ['Email', selected.email],
              ['Competition', selected.competition?.name],
              ['Date', selected.competition?.event_date ? format(new Date(selected.competition.event_date), 'dd MMM yyyy') : '—'],
              ['Horse', selected.horse_name],
              ['Class/Round', selected.class_round || '—'],
              ['Package', PACKAGE_LABELS[selected.package as keyof typeof PACKAGE_LABELS]],
              ['Price', `AED ${selected.package_price}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ ...labelStyle, fontSize: '0.5rem' }}>{k}</span>
                <span style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 300 }}>{v}</span>
              </div>
            ))}
          </div>
          <p style={{ ...labelStyle, fontSize: '0.5rem', marginBottom: '0.6rem' }}>Update Status</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem' }}>
            {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating || selected.status === s} style={{ background: selected.status === s ? statusColors[s] : 'transparent', color: selected.status === s ? '#0a0a0a' : statusColors[s], border: `0.5px solid ${statusColors[s]}`, padding: '0.4rem 0.8rem', fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", opacity: updating ? 0.6 : 1 }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(201,169,110,0.18)' }}>
            <a href={`mailto:${selected.email}`} style={{ display: 'block', width: '100%', background: '#c9a96e', color: '#0a0a0a', textAlign: 'center', padding: '0.75rem', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 400, textDecoration: 'none', fontFamily: "'Raleway', sans-serif", boxSizing: 'border-box' as const }}>
              Reply by Email
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
