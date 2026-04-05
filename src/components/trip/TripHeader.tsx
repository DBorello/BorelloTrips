import { MapPin, Calendar, Clock } from 'lucide-react'
import type { Trip } from '../../types/trip'
import { formatDateRange, getDayCount } from '../../utils/dates'

interface TripHeaderProps {
  trip: Trip
}

export function TripHeader({ trip }: TripHeaderProps) {
  const dayCount = getDayCount(trip.startDate, trip.endDate)

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(360px, 58vh, 580px)' }}>
      {/* Cover image with Ken Burns */}
      {trip.coverImage ? (
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover ken-burns"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-ink-950 to-sky-950" />
      )}

      {/* Edge vignette — all sides */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-ink-950/20 to-transparent" />
      {/* Inner box shadow for edge softness */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(8,8,14,0.5)]" />

      {/* Content anchored to bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">

          {/* Destination label */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/40">
              {trip.destination}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light italic text-white leading-none mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {trip.title}
          </h1>

          {/* Description */}
          {trip.description && (
            <p className="text-white/50 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Stat pills — more refined */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Calendar className="w-3 h-3 text-white/35" />
              <span className="text-white/65 text-xs tracking-wide">{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Clock className="w-3 h-3 text-white/35" />
              <span className="font-display text-sm font-light text-white/70 leading-none">{dayCount}</span>
              <span className="text-white/50 text-[11px] tracking-wide">{dayCount !== 1 ? 'days' : 'day'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
