import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import TopBar from '@/components/TopBar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'IC Podcast Recorder',
  description: 'Two hosts. One room. One mixed file.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <div className="frame">
            <TopBar />
            <main className="stage">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
