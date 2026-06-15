'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { getSupabase } from '@/lib/supabase'

interface Session {
  id: string
  title: string
  guest: string
  date: string
  duration: string
  sizeMB: string
  storagePath?: string | null
}

function formatTime(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

const DEFAULT_SESSIONS: Session[] = [
  { id: 's1', title: 'Orbit Drift, Ep. 17', guest: 'Mira Senna', date: 'May 21', duration: '01:08:42', sizeMB: '62.3 MB' },
  { id: 's2', title: 'Orbit Drift, Ep. 16', guest: 'Aki Tanaka', date: 'May 16', duration: '00:42:18', sizeMB: '38.7 MB' },
  { id: 's3', title: 'Late-night ramble', guest: 'solo', date: 'May 12', duration: '00:23:05', sizeMB: '21.1 MB' },
  { id: 's4', title: 'Pilot conversation', guest: 'Mira Senna', date: 'May 06', duration: '00:57:31', sizeMB: '52.0 MB' },
]

interface DownloadViewProps {
  sessions?: Session[]
  onNewSession?: () => void
  onDownload?: (sessionId: string) => void
}

export default function DownloadView({ sessions: sessionsProp, onNewSession, onDownload }: DownloadViewProps) {
  const router = useRouter()
  const [liveRows, setLiveRows] = useState<Session[]>(DEFAULT_SESSIONS)

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return

    sb.from('recordings')
      .select('id, created_at, room_code, status, storage_path, duration_seconds')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!data || data.length === 0) return
        setLiveRows(
          data.map(r => {
            const d = new Date(r.created_at)
            return {
              id: r.id,
              title: `Session — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
              guest: 'co-host',
              date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              duration: r.duration_seconds ? formatTime(r.duration_seconds) : '—:—:—',
              sizeMB: '—',
              storagePath: r.storage_path,
            }
          })
        )
      })
  }, [])

  const rows = sessionsProp && sessionsProp.length > 0 ? sessionsProp : liveRows

  async function handleDownload(sessionId: string) {
    const session = rows.find(s => s.id === sessionId)
    if (!session?.storagePath) return

    const sb = getSupabase()
    if (!sb) return

    const { data } = await sb.storage.from('recordings').createSignedUrl(session.storagePath, 3600)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = `${session.title}.mp3`
      a.click()
    }
  }

  return (
    <div className="post-wrap">
      <div className="post-head">
        <div>
          <div className="ttl">Your <i>sessions.</i></div>
          <div className="sub">
            {liveRows !== DEFAULT_SESSIONS
              ? `${rows.length} take${rows.length !== 1 ? 's' : ''}`
              : '4 takes · 2h 11m total'}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (onNewSession) onNewSession()
            else router.push('/lobby')
          }}
        >
          + New session
        </Button>
      </div>

      <div className="rec-list">
        {rows.map(s => (
          <div className="rec-row" key={s.id}>
            <div className="ttle">{s.title}<span className="ep">with {s.guest} · {s.date}</span></div>
            <div className="cell hide-sm"><b>{s.duration}</b></div>
            <div className="cell hide-sm">{s.sizeMB}</div>
            <div
              className="dl"
              role="button"
              tabIndex={0}
              onClick={() => onDownload ? onDownload(s.id) : handleDownload(s.id)}
              onKeyDown={e => { if (e.key === 'Enter') { onDownload ? onDownload(s.id) : handleDownload(s.id) } }}
            >
              ↓ Download
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
