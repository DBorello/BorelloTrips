import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import type { TripSummary } from '../../types/trip'
import { formatDateRange, getDayCount, getTripStatus, getDaysUntil } from '../../utils/dates'

interface TripCardProps {
  trip: TripSummary
}

const FALLBACK_GRADIENTS = [
  'from-sky-900 via-blue-950 to-indigo-950',
  'from-violet-900 via-purple-950 to-slate-950',
  'from-emerald-900 via-teal-950 to-cyan-950',
  'from-rose-900 via-pink-950 to-slate-950',
  'from-amber-900 via-orange-950 to-slate-950',
]

function getFallbackGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length]
}

export function TripCard({ trip }: TripCardProps) {
  const dayCount = getDayCount(trip.startDate, trip.endDate)
  const hasCover = Boolean(trip.coverImage)
  const gradient = getFallbackGradient(trip.id)
  const status = getTripStatus(trip.startDate, trip.endDate)
  const daysUntil = status === 'upcoming' ? getDaysUntil(trip.startDate) : 0

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group block press-scale"
    >
      <div
        className="relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-ink-900 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_8px_24px_rgba(0,0,0,0.5)]"
        style={status === 'past' ? { opacity: 0.6 } : undefined}
      >
        {/* Background image or gradient */}
        {hasCover ? (
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-700 ease-out group-hover:scale-[1.04]`} />
        )}

        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent" />
        {/* Subtle vignette on all edges */}
        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]" />

        {/* Status pill — top right */}
        <div className="absolute top-4 right-4">
          {status === 'active' && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.15em] uppercase bg-emerald-500/20 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {/* Refined pulse with ring effect */}
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animation: 'pulseRing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              In Progress
            </span>
          )}
          {status === 'upcoming' && (
            <span className="flex items-baseline gap-1 bg-black/50 backdrop-blur-md text-white/70 pl-2.5 pr-3 py-1 rounded-full border border-white/12">
              {daysUntil === 1 ? (
                <span className="text-[10px] font-medium tracking-[0.15em] uppercase">Tomorrow</span>
              ) : (
                <>
                  <span className="font-display text-sm font-light leading-none" style={{ fontVariantNumeric: 'oldstyle-nums' }}>{daysUntil}</span>
                  <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-white/50">days away</span>
                </>
              )}
            </span>
          )}
          {status === 'past' && (
            <span className="flex items-baseline gap-1 bg-black/40 backdrop-blur-md text-white/30 pl-2.5 pr-3 py-1 rounded-full border border-white/8">
              <span className="font-display text-sm font-light leading-none">{dayCount}</span>
              <span className="text-[9px] font-medium tracking-[0.15em] uppercase">{dayCount === 1 ? 'day' : 'days'}</span>
            </span>
          )}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          {/* Destination */}
          <div className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/40 mb-2">
            {trip.destination}
          </div>

          {/* Title in display font */}
          <h3 className="font-display text-[1.65rem] sm:text-[1.85rem] font-light italic text-white leading-tight mb-2 group-hover:text-white transition-colors duration-200">
            {trip.title}
          </h3>

          {/* Description — show when available */}
          {trip.description && (
            <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2 group-hover:text-white/55 transition-colors duration-200">
              {trip.description}
            </p>
          )}

          {/* Date row */}
          <div className="flex items-center gap-1.5 text-white/35">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs tracking-wide">{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
