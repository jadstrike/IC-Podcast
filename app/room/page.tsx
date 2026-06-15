import RoomView from '@/components/RoomView'
import AuthGuard from '@/components/AuthGuard'

export default function RoomPage() {
  return (
    <AuthGuard>
      <RoomView />
    </AuthGuard>
  )
}
