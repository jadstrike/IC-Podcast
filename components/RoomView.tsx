'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import RecordButton from '@/components/RecordButton'
import MicVisualizer from '@/components/MicVisualizer'
import Skeleton from '@/components/ui/Skeleton'

type RoomState = 'idle' | 'countdown' | 'recording' | 'saving' | 'ready'

function formatTime(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

function suggestedFilename(): string {
  return `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
}

const STATE_LABELS: Record<RoomState, string> = {
  idle: 'Idle',
  countdown: 'Get ready',
  recording: 'Recording',
  saving: 'Saving',
  ready: 'Saved',
}

const STATUS_LINE_TEXT: Record<RoomState, string> = {
  idle: 'Idle',
  countdown: 'Counting down…',
  recording: 'Recording…',
  saving: 'Saving recording…',
  ready: 'Recording saved',
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

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

  function startMediaRecorder() {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    mr.start(100)
    mediaRecorderRef.current = mr
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
            startMediaRecorder()
          }, 1000)
          cdTimeoutsRef.current.push(goT)
        }
      }, (idx + 1) * 1000)
      cdTimeoutsRef.current.push(t)
    })
  }

  function stopAndSave() {
    clearAllTimers()
    setRoomState('saving')

    const mr = mediaRecorderRef.current
    if (!mr) {
      setRoomState('ready')
      return
    }

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

      try {
        if (fileHandleRef.current) {
          const writable = await fileHandleRef.current.createWritable()
          await writable.write(blob)
          await writable.close()
        } else {
          // Fallback for browsers without File System Access API
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = suggestedFilename()
          a.click()
          URL.revokeObjectURL(url)
        }
      } catch (err) {
        console.error('Failed to save recording:', err)
      }

      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      mediaRecorderRef.current = null
      setRoomState('ready')
    }

    mr.stop()
  }

  async function onRecClick() {
    if (roomState === 'idle' || roomState === 'ready') {
      clearAllTimers()
      if (roomState === 'ready') {
        setSeconds(0)
        setRoomState('idle')
        return
      }

      // Request microphone access
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
      } catch {
        alert('Microphone access is required to record. Please allow microphone access and try again.')
        return
      }

      // Ask where to save (File System Access API — Chrome/Edge; others get auto-download)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as Window & { showSaveFilePicker: (o?: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: suggestedFilename(),
            types: [{ description: 'Audio Recording', accept: { 'audio/webm': ['.webm'] } }],
          })
          fileHandleRef.current = handle
        } catch {
          // User dismissed the save dialog — cancel recording
          stream.getTracks().forEach(t => t.stop())
          streamRef.current = null
          return
        }
      } else {
        fileHandleRef.current = null
      }

      runCountdown()
    } else if (roomState === 'recording') {
      stopAndSave()
    }
    // no-op for countdown, saving
  }

  useEffect(() => {
    return () => {
      clearAllTimers()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const outerClass = [
    'room',
    roomState === 'recording' ? 'recording' : '',
    roomState === 'saving' ? 'uploading' : '',
    roomState === 'ready' ? 'ready' : '',
  ].filter(Boolean).join(' ')

  const recLabel =
    roomState === 'recording' ? 'Stop' :
    roomState === 'saving' ? 'Saving' :
    'Start Recording'

  const recDisabled = roomState === 'saving' || roomState === 'countdown'

  const panelClass = roomState === 'recording' ? 'panel live' : 'panel muted'

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
        <div className={panelClass} id="panel-a">
          <Avatar initials={user.initials} status="online" size="sm" />
          <div className="nm">{user.name}</div>
          <div className="sub">Local</div>
          <MicVisualizer count={36} />
        </div>

        <div className="pillar">
          {roomState === 'saving' ? (
            <Skeleton width={100} height={40} className="timer-skel" />
          ) : (
            <div className="timer">{formatTime(seconds)}</div>
          )}
          <RecordButton label={recLabel} onClick={onRecClick} disabled={recDisabled} />
          <div className="state-label">{STATE_LABELS[roomState]}</div>
          <div className="cue">Press record when ready</div>
        </div>

        <div className={panelClass} id="panel-b">
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
