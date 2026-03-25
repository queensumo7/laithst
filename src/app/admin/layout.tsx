'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▤' },
  { href: '/admin/competitions', label: 'Competitions', icon: '⬡' },
  { href: '/admin/bookings', label: 'Bookings', icon: '◎' },
  { href: '/admin/enquiries', label: 'Enquiries', icon: '◉' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: '▨' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: "'Raleway', sans-serif", fontWeight: 200 }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', flexShrink: 0, background: '#111110', borderRight: '0.5px solid rgba(201,169,110,0.18)', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '2rem 1.5rem 1.5rem', borderBottom: '0.5px solid rgba(201,169,110,0.18)' }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase', color: '#f0ead8' }}>
            Laith<span style={{ fontWeight: 300, fontStyle: 'italic', color: '#c9a96e' }}>ST</span>
          </div>
          <div style={{ fontSize: '0.45rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c9a96e', marginTop: '0.2rem', fontWeight: 200 }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1.2rem 0' }}>
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                color: active ? '#c9a96e' : '#8a8a7a',
                textDecoration: 'none',
                background: active ? 'rgba(201,169,110,0.06)' : 'transparent',
                borderLeft: active ? '2px solid #c9a96e' : '2px solid transparent',
                transition: 'all 0.2s',
                fontWeight: active ? 300 : 200,
              }}>
                <span style={{ fontSize: '14px', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1.2rem 1.5rem', borderTop: '0.5px solid rgba(201,169,110,0.18)' }}>
          <Link href="/" target="_blank" style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8a7a', textDecoration: 'none', marginBottom: '0.7rem' }}>
            View Site ↗
          </Link>
          <button onClick={handleLogout} disabled={loggingOut} style={{ background: 'none', border: 'none', fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8a7a', cursor: 'pointer', padding: 0 }}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
