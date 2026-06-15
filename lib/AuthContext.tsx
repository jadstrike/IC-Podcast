'use client'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

export type Profile = { id: string; name: string; initials: string }

type AuthCtx = {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const defaultCtx: AuthCtx = {
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
}

const Ctx = createContext<AuthCtx>(defaultCtx)

function toInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const loadProfile = useCallback(async (userId: string) => {
    const sb = getSupabase()
    if (!sb) { setLoading(false); return }
    const { data } = await sb.from('profiles').select('name').eq('id', userId).single()
    if (!mountedRef.current) return
    if (data?.name) {
      setProfile({ id: userId, name: data.name, initials: toInitials(data.name) })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const sb = getSupabase()
    if (!sb) { setLoading(false); return }

    sb.auth.getSession().then(({ data }) => {
      if (!mountedRef.current) return
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, s) => {
      if (!mountedRef.current) return
      setSession(s)
      if (s) loadProfile(s.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut()
  }, [])

  return (
    <Ctx.Provider value={{ session, profile, loading, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
