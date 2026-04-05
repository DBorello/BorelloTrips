import { useTripsIndex } from '../hooks/useTripsIndex'
import { TripCard } from '../components/home/TripCard'
import { getTripStatus } from '../utils/dates'
import type { TripSummary } from '../types/trip'

export function HomePage() {
  const { index, loading, error } = useTripsIndex()

  const upcoming: TripSummary[] = []
  const past: TripSummary[] = []

  if (index) {
    for (const trip of index.trips) {
      const status = getTripStatus(trip.startDate, trip.endDate)
      if (status === 'past') {
        past.push(trip)
      } else {
        upcoming.push(trip)
      }
    }
    // Sort upcoming: active first, then by start date ascending
    upcoming.sort((a, b) => {
      const sa = getTripStatus(a.startDate, a.endDate)
      const sb = getTripStatus(b.startDate, b.endDate)
      if (sa === 'active' && sb !== 'active') return -1
      if (sb === 'active' && sa !== 'active') return 1
      return a.startDate.localeCompare(b.startDate)
    })
    // Sort past: most recent first
    past.sort((a, b) => b.startDate.localeCompare(a.startDate))
  }

  const TripGrid = ({ trips, delay = 0 }: { trips: TripSummary[]; delay?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {trips.map((trip, i) => (
        <div
          key={trip.id}
          className="animate-slide-up"
          style={{ animationDelay: `${(i + delay) * 0.08}s`, animationFillMode: 'both' }}
        >
          <TripCard trip={trip} />
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

      {/* Editorial header */}
      <div className="mb-12 sm:mb-16">
        <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/22 mb-5">
          Your journeys
        </div>
        <h1 className="font-display font-light leading-none text-white" style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)' }}>
          My{' '}
          <span className="italic" style={{ color: 'rgba(255,255,255,0.75)' }}>Trips</span>
        </h1>
        {/* Hairline rule */}
        <div className="mt-6 h-px w-16 bg-gradient-to-r from-white/20 to-transparent" />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-ink-900 overflow-hidden aspect-[3/4] animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-2xl bg-rose-500/8 border border-rose-500/20 p-8 text-center">
          <p className="text-rose-400/80 text-sm">{error}</p>
        </div>
      )}

      {/* Trips */}
      {!loading && !error && index && (
        <>
          {index.trips.length === 0 ? (
            <div className="text-center py-24">
              <div className="font-display text-4xl italic text-white/10 mb-4">No trips yet</div>
              <p className="text-white/25 text-sm tracking-wide">
                Add a trip JSON file to get started
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {upcoming.length > 0 && <TripGrid trips={upcoming} delay={0} />}

              {past.length > 0 && (
                <div>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="text-[10px] font-medium tracking-[0.3em] uppercase text-white/18">
                      Past trips
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
                  </div>
                  <TripGrid trips={past} delay={upcoming.length} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
