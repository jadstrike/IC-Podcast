'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { getSupabase } from '@/lib/supabase'

type AuthTab = 'login' | 'register'

export default function LoginView() {
  const [tab, setTab] = useState<AuthTab>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Enter a valid email.'); return }

    const sb = getSupabase()
    if (!sb) { router.push('/lobby'); return }

    setLoading(true)
    setError('')
    const { error: authErr } = await sb.auth.signInWithPassword({ email, password })
    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }
    router.push('/lobby')
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    if (!name || !email || !password) { setError('Please fill in all fields.'); return }
    if (!email.includes('@')) { setError('Enter a valid email.'); return }
    if (password.length < 10) { setError('Password must be at least 10 characters.'); return }

    const sb = getSupabase()
    if (!sb) { router.push('/lobby'); return }

    setLoading(true)
    setError('')
    const { error: authErr } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (authErr) {
      setError(authErr.message)
      setLoading(false)
      return
    }
    router.push('/lobby')
  }

  function switchTab(next: AuthTab) {
    setTab(next)
    setError('')
  }

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <div className="mark">Record <i>together.</i></div>
        <div className="tag">Two hosts. One room. One mixed file.</div>
        <div className="tabs">
          <div className={`tab${tab === 'login' ? ' on' : ''}`} onClick={() => switchTab('login')}>Sign in</div>
          <div className={`tab${tab === 'register' ? ' on' : ''}`} onClick={() => switchTab('register')}>Create account</div>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <Field label="Email" id="li-email" name="email" type="text" placeholder="you@studio.fm" autoComplete="email" />
            <Field label="Password" id="li-pass" name="password" type="password" placeholder="••••••••••" autoComplete="current-password" />
            {error && <div className="error" role="alert" style={{ fontSize: '13px', color: 'var(--rec)', marginTop: '8px' }}>{error}</div>}
            <div className="submit-row">
              <Button type="submit" variant="primary" block disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in  →'}
              </Button>
            </div>
            <div className="login-alt">
              No account? <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => switchTab('register')}>Create one</span>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <Field label="Name" id="ri-name" name="name" type="text" placeholder="Your name" autoComplete="name" />
            <Field label="Email" id="ri-email" name="email" type="text" placeholder="you@studio.fm" autoComplete="email" />
            <Field label="Password" id="ri-pass" name="password" type="password" placeholder="••••••••••" autoComplete="new-password" />
            {error && <div className="error" role="alert" style={{ fontSize: '13px', color: 'var(--rec)', marginTop: '8px' }}>{error}</div>}
            <div className="submit-row">
              <Button type="submit" variant="primary" block disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
