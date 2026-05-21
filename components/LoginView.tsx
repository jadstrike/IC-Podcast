'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginView() {
  const [error, setError] = useState('')
  const router = useRouter()

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (!email.includes('@')) {
      setError('Enter a valid email.')
      return
    }
    if (password.length < 10) {
      setError('Password must be at least 10 characters.')
      return
    }
    router.push('/lobby')
  }

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <div className="mark">Record <i>together.</i></div>
        <div className="tag">Two hosts. One room. One mixed file.</div>
        <div className="tabs">
          <div className="tab on">Sign in</div>
          <div className="tab">Create account</div>
        </div>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="li-email">Email</label>
            <input
              id="li-email"
              name="email"
              type="email"
              placeholder="you@studio.fm"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="li-pass">Password</label>
            <input
              id="li-pass"
              name="password"
              type="password"
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="error" role="alert" style={{ fontSize: '13px', color: 'var(--rec)', marginTop: '8px' }}>{error}</div>}
          <div className="submit-row">
            <span className="helper">Forgot password?</span>
            <button type="submit" className="btn primary">Sign in &nbsp;→</button>
          </div>
          <div className="login-alt">
            No account? <a>Create one</a>
          </div>
        </form>
      </div>
    </div>
  )
}
