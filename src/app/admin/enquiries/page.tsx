'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useSearchParams } from 'next/navigation'

const statusColors: Record<string, string> = {
  new: '#c9a96e', contacted: '#378add', confirmed: '#1d9e75',
  completed: '#8a8a7a', declined: '#e24b4a', onboarded: '#1d9e75',
  unread: '#c9a96e', read: '#8a8a7a', replied: '#1d9e75',
}

const labelStyle = { fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#8a8a7a', fontWeight: 300 }

type TabType = 'shoots' | 'brands' | 'messages'

export default function AdminEnquiries() {
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as TabType) || 'shoots'
  const [tab, setTab] = useState<TabType>(defaultTab)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchItems() }, [tab])

  async function fetchItems() {
    setLoading(true)
    setSelected(null)
    let url = ''
    if (tab === 'shoots') url = '/api/enquiries?type=shoot'
    else if (tab === 'brands') url = '/api/enquiries?type=brand'
    else url = '/api/contact'
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.enquiries || data.messages || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    const table = tab === 'shoots' ? 'shoot' : tab === 'brands' ? 'brand' : 'contact'
    await fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, type: table }),
    })
    await fetchItems()
    setUpdating(false)
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'shoots', label: 'Private Shoots' },
    { key: 'brands', label: 'Brand Enquiries' },
    { key: 'messages', label: 'Contact Messages' },
  ]

  const shootStatuses = ['new', 'contacted', 'confirmed', 'completed', 'declined']
  const brandStatuses = ['new', 'contacted', 'onboarded', 'declined']
  const messageStatuses = ['unread', 'read', 'replied']
  const currentStatuses = tab === 'shoots' ? shootStatuses : tab === 'brands' ? brandStatuses : messageStatuses

  return (
    <div style={{ padding: '2.5rem 3rem', color: '#f0ead8', fontFamily: "'Raleway', sans-serif", display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '2rem', alignItems: 'start' }}>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
          <p style={{ fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 200, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><span style={{ display: 'block', width: '1.2rem', height: '0.5px', background: '#c9a96e' }}></span>Admin</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.02em' }}>Enquiries & <em style={{ fontWeight: 300, fontStyle: 'italic', color: '#e2c99a' }}>Messages</em></h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '0.5px solid rgba(201,169,110,0.12)', marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? '#c9a96e' : 'transparent'}`, color: tab === t.key ? '#c9a96e' : '#8a8a7a', padding: '0.8rem 1.4rem', fontSize: '0.56rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontWeight: 200, marginBottom: '-0.5px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <p style={{ color: '#8a8a7a', fontSize: '0.7rem' }}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ color: '#8a8a7a', fontSize: '0.68rem', fontStyle: 'italic' }}>No {tab} yet.</p>
        ) : (
          <div style={{ border: '0.5px solid rgba(201,169,110,0.18)' }}>
            {items.map((item: any) => (
              <div key={item.id} onClick={() => setSelected(selected?.id === item.id ? null : item)} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '1.1rem 1.4rem', borderBottom: '0.5px solid rgba(240,234,216,0.05)', gap: '1.5rem', alignItems: 'center', cursor: 'pointer', background: selected?.id === item.id ? 'rgba(201,169,110,0.04)' : 'transparent', transition: 'background 0.2s' }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '0.92rem', fontWeight: 700, color: '#f0ead8' }}>{item.first_name} {item.last_name}</div>
                  <div style={{ fontSize: '0.58rem', color: '#8a8a7a', fontWeight: 200, marginTop: '0.15rem' }}>{item.email}</div>
                </div>
                <div>
                  {tab === 'shoots' && <div style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 300 }}>{item.shoot_type}</div>}
                  {tab === 'brands' && <div style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 300 }}>{item.brand_name} · {item.service_interest}</div>}
                  {tab === 'messages' && <div style={{ fontSize: '0.65rem', color: '#f0ead8', fontWeight: 300 }}>{item.subject}</div>}
                  <div style={{ fontSize: '0.54rem', color: '#8a8a7a', fontWeight: 200, marginTop: '0.15rem' }}>{format(new Date(item.created_at), 'dd MMM yyyy')}</div>
                </div>
                <span style={{ fontSize: '0.46rem', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', border: `0.5px solid ${statusColors[item.status]}`, color: statusColors[item.status], fontWeight: 300, whiteSpace: 'nowrap' as const }}>{item.status}</span>
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
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.15rem', fontWeight: 900, color: '#f0ead8' }}>{selected.first_name} {selected.last_name}</div>
              <div style={{ fontSize: '0.56rem', color: '#8a8a7a', marginTop: '0.2rem' }}>{format(new Date(selected.created_at), 'dd MMM yyyy, HH:mm')}</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#8a8a7a', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Email</span><a href={`mailto:${selected.email}`} style={{ fontSize: '0.63rem', color: '#c9a96e', fontWeight: 300 }}>{selected.email}</a></div>

            {tab === 'shoots' && <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Looking for</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.shoot_type}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Date</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.preferred_date || '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Location</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.location || '—'}</span></div>
              {selected.vision && <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(201,169,110,0.04)', border: '0.5px solid rgba(201,169,110,0.18)' }}><p style={{ fontSize: '0.63rem', color: '#8a8a7a', lineHeight: 1.7, fontStyle: 'italic' }}>"{selected.vision}"</p></div>}
            </>}

            {tab === 'brands' && <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Brand</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.brand_name}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Instagram</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.instagram_handle || '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Service</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.service_interest}</span></div>
              {selected.message && <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(201,169,110,0.04)', border: '0.5px solid rgba(201,169,110,0.18)' }}><p style={{ fontSize: '0.63rem', color: '#8a8a7a', lineHeight: 1.7, fontStyle: 'italic' }}>"{selected.message}"</p></div>}
            </>}

            {tab === 'messages' && <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Subject</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.subject}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={labelStyle}>Source</span><span style={{ fontSize: '0.63rem', color: '#f0ead8', fontWeight: 300 }}>{selected.source || '—'}</span></div>
              <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'rgba(201,169,110,0.04)', border: '0.5px solid rgba(201,169,110,0.18)' }}><p style={{ fontSize: '0.63rem', color: '#8a8a7a', lineHeight: 1.7, fontStyle: 'italic' }}>"{selected.message}"</p></div>
            </>}
          </div>

          <p style={{ ...labelStyle, fontSize: '0.5rem', marginBottom: '0.6rem' }}>Update Status</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem', marginBottom: '1.5rem' }}>
            {currentStatuses.map(s => (
              <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating || selected.status === s} style={{ background: selected.status === s ? statusColors[s] : 'transparent', color: selected.status === s ? '#0a0a0a' : statusColors[s], border: `0.5px solid ${statusColors[s]}`, padding: '0.38rem 0.75rem', fontSize: '0.48rem', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Raleway', sans-serif", fontWeight: 300, opacity: updating ? 0.6 : 1 }}>
                {s}
              </button>
            ))}
          </div>

          <a href={`mailto:${selected.email}`} style={{ display: 'block', width: '100%', background: '#c9a96e', color: '#0a0a0a', textAlign: 'center', padding: '0.75rem', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 400, textDecoration: 'none', fontFamily: "'Raleway', sans-serif", boxSizing: 'border-box' as const }}>
            Reply by Email
          </a>
        </div>
      )}
    </div>
  )
}
