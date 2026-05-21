'use client'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

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
  peer = { name: 'Co-host', initials: '?' },
  roomCode = 'ORBIT-7F2K',
  peerStatus = 'waiting',
  onJoinRoom,
  onLeave,
}: LobbyViewProps) {
  const router = useRouter()

  function handleJoinRoom() {
    if (onJoinRoom) {
      onJoinRoom()
    } else {
      router.push('/room')
    }
  }

  function handleLeave() {
    if (onLeave) {
      onLeave()
    } else {
      router.push('/login')
    }
  }

  const peerConnected = peerStatus === 'connected'

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
            <Avatar initials={user.initials} status="online" />
            <div className="name">{user.name}</div>
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
