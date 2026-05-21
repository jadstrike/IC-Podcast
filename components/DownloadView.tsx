'use client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface Session {
  id: string
  title: string
  guest: string
  date: string
  duration: string
  sizeMB: string
}

interface DownloadViewProps {
  sessions?: Session[]
  onNewSession?: () => void
  onDownload?: (sessionId: string) => void
}

const DEFAULT_SESSIONS: Session[] = [
  { id: 's1', title: 'Orbit Drift, Ep. 17', guest: 'Mira Senna', date: 'May 21', duration: '01:08:42', sizeMB: '62.3 MB' },
  { id: 's2', title: 'Orbit Drift, Ep. 16', guest: 'Aki Tanaka', date: 'May 16', duration: '00:42:18', sizeMB: '38.7 MB' },
  { id: 's3', title: 'Late-night ramble', guest: 'solo', date: 'May 12', duration: '00:23:05', sizeMB: '21.1 MB' },
  { id: 's4', title: 'Pilot conversation', guest: 'Mira Senna', date: 'May 06', duration: '00:57:31', sizeMB: '52.0 MB' },
]

export default function DownloadView({ sessions, onNewSession, onDownload }: DownloadViewProps) {
  const router = useRouter()
  const rows = sessions && sessions.length > 0 ? sessions : DEFAULT_SESSIONS

  return (
    <div className="post-wrap">
      <div className="post-head">
        <div>
          <div className="ttl">Your <i>sessions.</i></div>
          <div className="sub">
            {sessions && sessions.length > 0
              ? `${sessions.length} takes`
              : '4 takes · 2h 11m total'}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (onNewSession) {
              onNewSession()
            } else {
              router.push('/lobby')
            }
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
              onClick={() => onDownload?.(s.id)}
              onKeyDown={e => { if (e.key === 'Enter') onDownload?.(s.id) }}
            >
              ↓ Download
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
