'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import RecordButton from '@/components/RecordButton'
import MicVisualizer from '@/components/MicVisualizer'

type RoomState = 'idle' | 'countdown' | 'recording' | 'uploading' | 'mixing' | 'ready'

function formatTime(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

const STATE_LABELS: Record<RoomState, string> = {
  idle: 'Idle',
  countdown: 'Get ready',
  recording: 'Recording',
  uploading: 'Uploading',
  mixing: 'Mixing',
  ready: 'Ready',
}

const STATUS_LINE_TEXT: Record<RoomState, string> = {
  idle: 'Idle',
  countdown: 'Counting down…',
  recording: 'Recording…',
  uploading: 'Uploading…',
  mixing: 'Mixing…',
  ready: 'Ready to download',
}

interface RoomViewProps {
  user?: { name: string; initials: string }
  peer?: { name: string; initials: string }
  roomCode?: string
  peerStatus?: 'waiting' | 'connected'
}

export default function RoomView({
  user = { name: 'June Reyes', initials: 'JR' },
  peer = { name: 'Mira Senna', initials: 'MS' },
  roomCode = 'ORBIT-7F2K',
}: RoomViewProps) {
  const router = useRouter()
  const [roomState, setRoomState] = useState<RoomState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [cdNum, setCdNum] = useState('3')
  const [cdKey, setCdKey] = useState(0)

  const cdTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearAllTimers() {
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
    cdTimeoutsRef.current.forEach(clearTimeout)
    cdTimeoutsRef.current = []
  }

  function startTick() {
    setSeconds(0)
    tickIntervalRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
  }

  function runCountdown() {
    setRoomState('countdown')
    setCdNum('3')
    setCdKey(k => k + 1)

    const steps = ['2', '1', 'GO']
    steps.forEach((num, idx) => {
      const t = setTimeout(() => {
        setCdNum(num)
        setCdKey(k => k + 1)
        if (num === 'GO') {
          const goT = setTimeout(() => {
            setRoomState('recording')
            startTick()
          }, 1000)
          cdTimeoutsRef.current.push(goT)
        }
      }, (idx + 1) * 1000)
      cdTimeoutsRef.current.push(t)
    })
  }

  function runPostRecording() {
    clearAllTimers()
    setRoomState('uploading')
    const t1 = setTimeout(() => {
      setRoomState('mixing')
      const t2 = setTimeout(() => {
        setRoomState('ready')
      }, 1500)
      cdTimeoutsRef.current.push(t2)
    }, 1500)
    cdTimeoutsRef.current.push(t1)
  }

  function onRecClick() {
    if (roomState === 'idle' || roomState === 'ready') {
      clearAllTimers()
      if (roomState === 'ready') {
        setSeconds(0)
        setRoomState('idle')
        return
      }
      runCountdown()
    } else if (roomState === 'recording') {
      runPostRecording()
    }
    // no-op for countdown, uploading, mixing
  }

  useEffect(() => {
    return () => clearAllTimers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const outerClass = [
    'room',
    roomState === 'recording' ? 'recording' : '',
    roomState === 'uploading' ? 'uploading' : '',
    roomState === 'mixing' ? 'mixing' : '',
    roomState === 'ready' ? 'ready' : '',
  ].filter(Boolean).join(' ')

  const recLabel =
    roomState === 'recording' ? 'Stop' :
    roomState === 'uploading' ? 'Uploading' :
    roomState === 'mixing' ? 'Mixing' :
    'Start Recording'

  const recDisabled = roomState === 'uploading' || roomState === 'mixing' || roomState === 'countdown'

  return (
    <div className={outerClass}>
      <div className="room-head">
        <div className="left">
          <span className="room-name">Room {roomCode}</span>
          <span>·</span>
          <span className="status-idle">2 hosts present</span>
          <span className="live"><span className="pip" />Recording live</span>
        </div>
        <div>
          <Button variant="ghost" onClick={() => router.push('/lobby')}>Back to lobby</Button>
          <Button variant="ghost" onClick={() => router.push('/download')}>End session</Button>
        </div>
      </div>

      <div className="room-body">
        <div className="panel live" id="panel-a">
          <Avatar initials={user.initials} status="online" size="sm" />
          <div className="nm">{user.name}</div>
          <div className="sub">Local</div>
          <MicVisualizer count={36} />
        </div>

        <div className="pillar">
          <div className="timer">{formatTime(seconds)}</div>
          <RecordButton label={recLabel} onClick={onRecClick} disabled={recDisabled} />
          <div className="state-label">{STATE_LABELS[roomState]}</div>
          <div className="cue">Press record when ready</div>
        </div>

        <div className="panel live" id="panel-b">
          <Avatar initials={peer.initials} status="online" size="sm" />
          <div className="nm">{peer.name}</div>
          <div className="sub">Remote</div>
          <MicVisualizer count={36} />
        </div>
      </div>

      <div className="progress-row">
        <div className="status-line">{STATUS_LINE_TEXT[roomState]}</div>
      </div>

      <div className={`countdown${roomState === 'countdown' ? ' show' : ''}`}>
        <div key={cdKey} className={`num${cdNum === 'GO' ? ' go' : ''}`}>{cdNum}</div>
      </div>
    </div>
  )
}
