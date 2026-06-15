'use client'
import { useState, useRef, useEffect } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Mp3Encoder } from 'lamejs'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import RecordButton from '@/components/RecordButton'
import MicVisualizer from '@/components/MicVisualizer'
import Skeleton from '@/components/ui/Skeleton'

type RoomState = 'idle' | 'waiting' | 'countdown' | 'recording' | 'saving' | 'ready'

type PresencePayload = { peerId: string; ready: boolean }

function formatTime(s: number): string {
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
}

function suggestedFilename(): string {
  return `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp3`
}

function float32ToInt16(buf: Float32Array): Int16Array {
  const out = new Int16Array(buf.length)
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

async function encodeMp3(rawBlob: Blob): Promise<Blob> {
  const arrayBuffer = await rawBlob.arrayBuffer()
  const audioCtx = new AudioContext()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  await audioCtx.close()

  const channels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const encoder = new Mp3Encoder(channels, sampleRate, 128)

  const left = float32ToInt16(audioBuffer.getChannelData(0))
  const right = channels > 1 ? float32ToInt16(audioBuffer.getChannelData(1)) : left

  const mp3Parts: Int8Array[] = []
  const BLOCK = 1152
  for (let i = 0; i < left.length; i += BLOCK) {
    const chunk = encoder.encodeBuffer(left.subarray(i, i + BLOCK), right.subarray(i, i + BLOCK))
    if (chunk.length > 0) mp3Parts.push(chunk)
  }
  const tail = encoder.flush()
  if (tail.length > 0) mp3Parts.push(tail)

  return new Blob(mp3Parts.map(p => p.buffer as ArrayBuffer), { type: 'audio/mpeg' })
}

const STATE_LABELS: Record<RoomState, string> = {
  idle: 'Idle',
  waiting: 'Waiting',
  countdown: 'Get ready',
  recording: 'Recording',
  saving: 'Saving',
  ready: 'Saved',
}

const STATUS_LINE_TEXT: Record<RoomState, string> = {
  idle: 'Idle',
  waiting: 'Waiting for peer to be ready…',
  countdown: 'Counting down…',
  recording: 'Recording…',
  saving: 'Saving recording…',
  ready: 'Recording saved',
}

interface RoomViewProps {
  user?: { name: string; initials: string }
  peer?: { name: string; initials: string }
  roomCode?: string
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
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null)
  const [peerReady, setPeerReady] = useState(false)

  const cdTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Presence refs — stable across renders, no stale closure risk
  const localPeerIdRef = useRef(crypto.randomUUID())
  const channelRef = useRef<RealtimeChannel | null>(null)
  const localReadyRef = useRef(false)
  const countdownStartedRef = useRef(false)
  // "latest ref" pattern so the presence handler always calls the current runCountdown
  const runCountdownRef = useRef<() => void>(() => {})

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
    tickIntervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  function startMediaRecorder() {
    const stream = streamRef.current
    if (!stream) return
    chunksRef.current = []
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
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

  // Keep the ref pointing at the latest runCountdown (no deps = runs every render, cheap)
  useEffect(() => { runCountdownRef.current = runCountdown })

  // Subscribe to presence for this room
  useEffect(() => {
    const sb = getSupabase()
    if (!sb) return // no Supabase config: solo mode, recording starts immediately on click

    const channel = sb.channel(`room:${roomCode}`, {
      config: { presence: { key: localPeerIdRef.current } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresencePayload>()
      const others = Object.entries(state)
        .filter(([key]) => key !== localPeerIdRef.current)
        .map(([, [payload]]) => payload)

      setPeerReady(others.some(u => u?.ready))

      if (
        localReadyRef.current &&
        !countdownStartedRef.current &&
        others.length > 0 &&
        others.every(u => u?.ready)
      ) {
        countdownStartedRef.current = true
        runCountdownRef.current()
      }
    })

    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ peerId: localPeerIdRef.current, ready: false })
      }
    })

    channelRef.current = channel
    return () => { sb.removeChannel(channel); channelRef.current = null }
  }, [roomCode])

  // Reset presence flags when the user resets to idle
  useEffect(() => {
    if (roomState === 'idle') {
      localReadyRef.current = false
      countdownStartedRef.current = false
      channelRef.current
        ?.track({ peerId: localPeerIdRef.current, ready: false })
        .catch(() => {})
    }
  }, [roomState])

  function stopAndSave() {
    clearAllTimers()
    setRoomState('saving')

    const mr = mediaRecorderRef.current
    if (!mr) { setRoomState('ready'); return }

    mr.onstop = async () => {
      const rawBlob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
      try {
        const mp3Blob = await encodeMp3(rawBlob)
        if (fileHandleRef.current) {
          const writable = await fileHandleRef.current.createWritable()
          await writable.write(mp3Blob)
          await writable.close()
        } else {
          const url = URL.createObjectURL(mp3Blob)
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
      setLiveStream(null)
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

      // Mic permission — must come from user gesture before async chain breaks it
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        setLiveStream(stream)
      } catch {
        alert('Microphone access is required to record. Please allow microphone access and try again.')
        return
      }

      // File save location
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as Window & {
            showSaveFilePicker: (o?: object) => Promise<FileSystemFileHandle>
          }).showSaveFilePicker({
            suggestedName: suggestedFilename(),
            types: [{ description: 'MP3 Audio', accept: { 'audio/mpeg': ['.mp3'] } }],
          })
          fileHandleRef.current = handle
        } catch {
          stream.getTracks().forEach(t => t.stop())
          streamRef.current = null
          setLiveStream(null)
          return
        }
      } else {
        fileHandleRef.current = null
      }

      const channel = channelRef.current
      if (!channel) {
        // No Supabase — solo mode, start immediately
        runCountdown()
        return
      }

      // Signal ready and check if peer is already waiting
      localReadyRef.current = true
      await channel.track({ peerId: localPeerIdRef.current, ready: true })

      const state = channel.presenceState<PresencePayload>()
      const others = Object.entries(state)
        .filter(([key]) => key !== localPeerIdRef.current)
        .map(([, [payload]]) => payload)

      if (others.length > 0 && others.every(u => u?.ready)) {
        // Peer was already waiting — kick off immediately
        countdownStartedRef.current = true
        runCountdown()
      } else {
        setRoomState('waiting')
      }

    } else if (roomState === 'recording') {
      stopAndSave()
    }
    // no-op for waiting, countdown, saving
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
    roomState === 'waiting' ? 'Waiting…' :
    'Start Recording'

  const recDisabled = roomState === 'saving' || roomState === 'countdown' || roomState === 'waiting'

  const panelClass = roomState === 'recording' ? 'panel live' : 'panel muted'

  const cueText = roomState === 'waiting'
    ? `Waiting for ${peer.name} to be ready`
    : 'Press record when ready'

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
          <MicVisualizer count={36} stream={liveStream} />
        </div>

        <div className="pillar">
          {roomState === 'saving' ? (
            <Skeleton width={100} height={40} className="timer-skel" />
          ) : (
            <div className="timer">{formatTime(seconds)}</div>
          )}
          <RecordButton label={recLabel} onClick={onRecClick} disabled={recDisabled} />
          <div className="state-label">{STATE_LABELS[roomState]}</div>
          <div className="cue">{cueText}</div>
        </div>

        <div className={panelClass} id="panel-b">
          <Avatar initials={peer.initials} status="online" size="sm" />
          <div className="nm">{peer.name}</div>
          <div className="sub">{peerReady ? 'Ready' : 'Remote'}</div>
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
