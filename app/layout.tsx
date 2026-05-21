import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

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
        <div className="frame">
          <header className="topbar">
            <div className="brand">
              <span>IC Podcast Recorder</span>
            </div>
            {/* topbar-right: hidden by default in Phase 1; Phase 2 wires session */}
            <div className="topbar-right" style={{ display: 'none' }}>
              <span className="user-name"></span>
              <span className="sign-out">Sign out</span>
            </div>
          </header>
          <main className="stage">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
