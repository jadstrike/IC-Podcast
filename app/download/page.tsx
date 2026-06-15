import DownloadView from '@/components/DownloadView'
import AuthGuard from '@/components/AuthGuard'

export default function DownloadPage() {
  return (
    <AuthGuard>
      <DownloadView />
    </AuthGuard>
  )
}
