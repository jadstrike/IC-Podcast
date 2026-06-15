'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function TopBar() {
  const { profile, session, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span>IC Podcast Recorder</span>
      </div>
      {session && profile && (
        <div className="topbar-right">
          <span className="user-name">{profile.name}</span>
          <span
            className="sign-out"
            role="button"
            tabIndex={0}
            onClick={handleSignOut}
            onKeyDown={e => { if (e.key === 'Enter') handleSignOut() }}
          >
            Sign out
          </span>
        </div>
      )}
    </header>
  )
}
