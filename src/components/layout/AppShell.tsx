import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isOnline = useOnlineStatus()

  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <header
        className="sticky top-0 z-50 bg-ink-950/80 backdrop-blur-xl border-b border-white/5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            {/* Back button */}
            {!isHome && (
              <Link
                to="/"
                className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Trips</span>
              </Link>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10.5L3 13L4.5 8.5L1 5.5H5.5L7 1Z" fill="rgba(255,255,255,0.8)" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-0">
                <span className="font-display text-lg font-light italic text-white/90 tracking-wide group-hover:text-white transition-colors">
                  Borello
                </span>
                <span className="font-display text-lg font-semibold not-italic text-white tracking-wide group-hover:text-white transition-colors">
                  Trips
                </span>
              </div>
            </Link>

            {/* Offline indicator */}
            {!isOnline && (
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-medium tracking-[0.12em] uppercase text-amber-400/70 bg-amber-500/8 border border-amber-500/15 rounded-full px-2.5 py-1">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
