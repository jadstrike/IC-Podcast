import LobbyView from '@/components/LobbyView'
import AuthGuard from '@/components/AuthGuard'

export default function LobbyPage() {
  return (
    <AuthGuard>
      <LobbyView />
    </AuthGuard>
  )
}
