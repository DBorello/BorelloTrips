import { MapPin, Calendar, Clock } from 'lucide-react'
import type { Trip } from '../../types/trip'
import { formatDateRange, getDayCount } from '../../utils/dates'

interface TripHeaderProps {
  trip: Trip
}

export function TripHeader({ trip }: TripHeaderProps) {
  const dayCount = getDayCount(trip.startDate, trip.endDate)

  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(340px, 55vh, 560px)' }}>
      {/* Cover image */}
      {trip.coverImage ? (
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-ink-950 to-sky-950" />
      )}

      {/* Multi-layer gradient for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

      {/* Content anchored to bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">

          {/* Destination label */}
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-white/35">
              {trip.destination}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light italic text-white leading-none mb-5">
            {trip.title}
          </h1>

          {/* Description */}
          {trip.description && (
            <p className="text-white/45 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
              {trip.description}
            </p>
          )}

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5">
              <Calendar className="w-3 h-3 text-white/40" />
              <span className="text-white/70 text-xs tracking-wide">{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/8 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1.5">
              <Clock className="w-3 h-3 text-white/40" />
              <span className="text-white/70 text-xs tracking-wide">{dayCount} {dayCount !== 1 ? 'days' : 'day'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
