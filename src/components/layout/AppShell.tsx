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
        className="sticky top-0 z-50 bg-ink-950/85 backdrop-blur-xl border-b border-white/5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-3">
            {/* Back button — more prominent on mobile */}
            {!isHome && (
              <Link
                to="/"
                className="flex items-center gap-1 text-white/60 hover:text-white transition-all duration-150 text-sm group press-scale -ml-1"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/6 hover:bg-white/10 border border-white/8 transition-all duration-150">
                  <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-px" />
                </div>
                <span className="hidden sm:inline ml-1 font-medium text-xs tracking-wide text-white/50 group-hover:text-white/80 transition-colors duration-150">Trips</span>
              </Link>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex-shrink-0">
                {/* Subtle glow behind logo icon */}
                <div className="absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)' }} />
                <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-white/18 to-white/6 border border-white/12 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10.5L3 13L4.5 8.5L1 5.5H5.5L7 1Z" fill="rgba(255,255,255,0.85)" />
                  </svg>
                </div>
              </div>
              <div className="flex items-baseline gap-0">
                <span className="font-display text-lg font-light italic text-white/85 tracking-wide group-hover:text-white transition-colors duration-200">
                  Borello
                </span>
                <span className="font-display text-lg font-semibold not-italic text-white tracking-wide group-hover:text-white transition-colors duration-200">
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
