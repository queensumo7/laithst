'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: '100%', background: '#1a1a18', border: '0.5px solid rgba(240,234,216,0.1)',
    color: '#f0ead8', padding: '0.75rem 1rem', fontFamily: "'Raleway', sans-serif",
    fontSize: '0.8rem', fontWeight: 200, outline: 'none', letterSpacing: '0.03em',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = { fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase' as const, color: '#8a8a7a', display: 'block', marginBottom: '0.45rem', fontWeight: 300 }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Raleway', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', fontWeight: 900, color: '#f0ead8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Laith<span style={{ fontWeight: 300, fontStyle: 'italic', color: '#c9a96e' }}>ST</span>
          </div>
          <div style={{ fontSize: '0.5rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c9a96e', marginTop: '0.3rem', fontWeight: 200 }}>Admin Access</div>
        </div>

        {/* Form */}
        <div style={{ background: '#111110', border: '0.5px solid rgba(201,169,110,0.18)', padding: '2.5rem 2rem' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="laith@laithstphotography.com" required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" required />
            </div>
            {error && <p style={{ fontSize: '0.62rem', color: '#e24b4a', marginBottom: '1rem', letterSpacing: '0.08em' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#c9a96e', color: '#0a0a0a', border: 'none',
              padding: '0.95rem', fontFamily: "'Raleway', sans-serif", fontSize: '0.62rem',
              letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 400, cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.56rem', letterSpacing: '0.12em', color: 'rgba(138,138,122,0.5)' }}>
          LaithST Photography © 2026
        </p>
      </div>
    </div>
  )
}
