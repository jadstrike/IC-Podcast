'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import { getSupabase } from '@/lib/supabase'

const ROOM_CODE = 'MAIN-ROOM'

type LobbyPresence = { name: string; initials: string }

interface LobbyViewProps {
  user?: { name: string; initials: string }
  peer?: { name: string; initials: string }
  roomCode?: string
  peerStatus?: 'waiting' | 'connected'
  onJoinRoom?: () => void
  onLeave?: () => void
}

export default function LobbyView({
  user = { name: 'June Reyes', initials: 'JR' },
  peer: peerProp = { name: 'Co-host', initials: '?' },
  roomCode = ROOM_CODE,
  onJoinRoom,
  onLeave,
}: LobbyViewProps) {
  const { profile } = useAuth()
  const router = useRouter()
  const [livePeer, setLivePeer] = useState<LobbyPresence | null>(null)

  const displayUser = profile ?? user
  const peer = livePeer ?? peerProp
  const peerConnected = livePeer !== null

  useEffect(() => {
    if (!profile) return
    const sb = getSupabase()
    if (!sb) return

    const channel = sb.channel('lobby', {
      config: { presence: { key: profile.id } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<LobbyPresence>()
      const others = Object.entries(state)
        .filter(([key]) => key !== profile.id)
        .map(([, [p]]) => p)
      setLivePeer(others[0] ?? null)
    })

    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ name: profile.name, initials: profile.initials })
      }
    })

    return () => { sb.removeChannel(channel) }
  }, [profile])

  function handleJoinRoom() {
    if (onJoinRoom) onJoinRoom()
    else router.push('/room')
  }

  function handleLeave() {
    if (onLeave) onLeave()
    else router.push('/login')
  }

  return (
    <div className="lobby-wrap">
      <div className="lobby-inner">
        <div className="head">
          <h1>Waiting for your <i>co-host.</i></h1>
          <div className="sub">
            The room opens when both seats are filled
            <span className="dots"><span></span><span></span><span></span></span>
          </div>
        </div>
        <div className="seats">
          <div className="seat">
            <Avatar initials={displayUser.initials} status="online" />
            <div className="name">{displayUser.name}</div>
            <div className="stat">Connected</div>
          </div>
          <div className={peerConnected ? 'seat' : 'seat waiting'}>
            <Avatar
              initials={peerConnected ? peer.initials : '?'}
              empty={!peerConnected}
              status={peerConnected ? 'online' : 'pending'}
            />
            <div className="name">{peer.name}</div>
            <div className="stat">{peerConnected ? 'Connected' : 'Waiting…'}</div>
          </div>
        </div>
        <div className="lobby-actions">
          <div className="leave-link" onClick={handleLeave}>← Leave room</div>
          <div className="room-code">
            Share code <code>{roomCode}</code>
            <Button onClick={handleJoinRoom}>Both joined →</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
