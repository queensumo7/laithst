import { createSupabaseServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

async function getStats() {
  const supabase = createSupabaseServerClient()

  const [bookings, shoots, brands, messages, competitions, portfolio] = await Promise.all([
    supabase.from('competition_bookings').select('status', { count: 'exact' }),
    supabase.from('shoot_enquiries').select('status', { count: 'exact' }),
    supabase.from('brand_enquiries').select('status', { count: 'exact' }),
    supabase.from('contact_messages').select('status', { count: 'exact' }).eq('status', 'unread'),
    supabase.from('competitions').select('status', { count: 'exact' }).eq('status', 'open'),
    supabase.from('portfolio_items').select('id', { count: 'exact' }),
  ])

  const pendingBookings = bookings.data?.filter(b => b.status === 'pending').length || 0
  const newShoots = shoots.data?.filter(s => s.status === 'new').length || 0
  const newBrands = brands.data?.filter(b => b.status === 'new').length || 0
  const unreadMessages = messages.count || 0
  const openCompetitions = competitions.count || 0
  const portfolioCount = portfolio.count || 0

  return { pendingBookings, newShoots, newBrands, unreadMessages, openCompetitions, portfolioCount }
}

async function getRecentBookings() {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('competition_bookings')
    .select('*, competition:competitions(name, event_date)')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getRecentEnquiries() {
  const supabase = createSupabaseServerClient()
  const [shoots, brands] = await Promise.all([
    supabase.from('shoot_enquiries').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('brand_enquiries').select('*').order('created_at', { ascending: false }).limit(3),
  ])
  return {
    shoots: shoots.data || [],
    brands: brands.data || [],
  }
}

const cardStyle = { background: '#1a1a18', border: '0.5px solid rgba(201,169,110,0.18)', padding: '1.5rem' }
const labelStyle = { fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#8a8a7a', fontWeight: 300, marginBottom: '0.5rem', display: 'block' }
const numStyle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.4rem', fontWeight: 900, color: '#c9a96e', lineHeight: 1, letterSpacing: '-0.02em' }
const sectionTitle = { fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.2rem', fontWeight: 700, color: '#f0ead8', marginBottom: '1.2rem', letterSpacing: '-0.01em' }
const badge = (color: string) => ({ display: 'inline-block', fontSize: '0.48rem', letterSpacing: '0.14em', textTransform: 'uppercase' as const, padding: '0.2rem 0.55rem', border: `0.5px solid ${color}`, color, fontWeight: 300 })

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const stats = await getStats()
  const recentBookings = await getRecentBookings()
  const { shoots, brands } = await getRecentEnquiries()

  return (
    <div style={{ padding: '2.5rem 3rem', color: '#f0ead8', fontFamily: "'Raleway', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
        <p style={{ fontSize: '0.52rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 200, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ display: 'block', width: '1.5rem', height: '0.5px', background: '#c9a96e' }}></span>Admin Dashboard
        </p>
        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2.2rem', fontWeight: 900, color: '#f0ead8', letterSpacing: '-0.02em' }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, <em style={{ fontWeight: 300, fontStyle: 'italic', color: '#e2c99a' }}>Laith.</em>
        </h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(201,169,110,0.18)', marginBottom: '2.5rem' }}>
        {[
          { label: 'Pending Bookings', value: stats.pendingBookings, link: '/admin/bookings', alert: stats.pendingBookings > 0 },
          { label: 'New Shoot Enquiries', value: stats.newShoots, link: '/admin/enquiries?tab=shoots', alert: stats.newShoots > 0 },
          { label: 'New Brand Enquiries', value: stats.newBrands, link: '/admin/enquiries?tab=brands', alert: stats.newBrands > 0 },
          { label: 'Unread Messages', value: stats.unreadMessages, link: '/admin/enquiries?tab=messages', alert: stats.unreadMessages > 0 },
          { label: 'Open Competitions', value: stats.openCompetitions, link: '/admin/competitions', alert: false },
          { label: 'Portfolio Items', value: stats.portfolioCount, link: '/admin/portfolio', alert: false },
        ].map(stat => (
          <a key={stat.label} href={stat.link} style={{ ...cardStyle, textDecoration: 'none', display: 'block', transition: 'background 0.3s' }}>
            <span style={labelStyle}>{stat.label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <span style={{ ...numStyle, color: stat.alert ? '#c9a96e' : '#f0ead8' }}>{stat.value}</span>
              {stat.alert && <span style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c9a96e', fontWeight: 300 }}>New →</span>}
            </div>
          </a>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Recent bookings */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={sectionTitle}>Recent Bookings</h2>
            <a href="/admin/bookings" style={{ fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c9a96e', textDecoration: 'none', fontWeight: 300 }}>View all →</a>
          </div>
          {recentBookings.length === 0 ? (
            <p style={{ fontSize: '0.65rem', color: '#8a8a7a', fontStyle: 'italic' }}>No bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {recentBookings.map((b: any) => (
                <a key={b.id} href={`/admin/bookings`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '0.9rem 0', borderBottom: '0.5px solid rgba(240,234,216,0.06)', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: '#f0ead8', marginBottom: '0.15rem' }}>{b.first_name} {b.last_name}</div>
                    <div style={{ fontSize: '0.58rem', color: '#8a8a7a', fontWeight: 200 }}>{b.competition?.name} · {b.package}</div>
                  </div>
                  <span style={badge(b.status === 'pending' ? '#c9a96e' : b.status === 'confirmed' ? '#1d9e75' : '#8a8a7a')}>{b.status}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Recent enquiries */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h2 style={sectionTitle}>Recent Enquiries</h2>
            <a href="/admin/enquiries" style={{ fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c9a96e', textDecoration: 'none', fontWeight: 300 }}>View all →</a>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ ...labelStyle, marginBottom: '0.6rem' }}>Private Shoots</p>
            {shoots.length === 0 ? <p style={{ fontSize: '0.62rem', color: '#8a8a7a', fontStyle: 'italic', marginBottom: '1rem' }}>None yet.</p> : shoots.map((s: any) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '0.5px solid rgba(240,234,216,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 400, color: '#f0ead8' }}>{s.first_name} {s.last_name}</div>
                  <div style={{ fontSize: '0.56rem', color: '#8a8a7a', fontWeight: 200 }}>{s.shoot_type}</div>
                </div>
                <span style={badge(s.status === 'new' ? '#c9a96e' : '#8a8a7a')}>{s.status}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: '0.6rem', marginTop: '0.8rem' }}>Brand Enquiries</p>
            {brands.length === 0 ? <p style={{ fontSize: '0.62rem', color: '#8a8a7a', fontStyle: 'italic' }}>None yet.</p> : brands.map((b: any) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '0.5px solid rgba(240,234,216,0.06)' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 400, color: '#f0ead8' }}>{b.brand_name}</div>
                  <div style={{ fontSize: '0.56rem', color: '#8a8a7a', fontWeight: 200 }}>{b.service_interest}</div>
                </div>
                <span style={badge(b.status === 'new' ? '#c9a96e' : '#8a8a7a')}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
