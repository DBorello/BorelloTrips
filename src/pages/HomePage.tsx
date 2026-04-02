import { useTripsIndex } from '../hooks/useTripsIndex'
import { TripCard } from '../components/home/TripCard'

export function HomePage() {
  const { index, loading, error } = useTripsIndex()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

      {/* Editorial header */}
      <div className="mb-12 sm:mb-16">
        <div className="text-[10px] font-medium tracking-[0.25em] uppercase text-white/25 mb-5">
          Your journeys
        </div>
        <h1 className="font-display text-6xl sm:text-8xl font-light leading-none text-white">
          My{' '}
          <span className="italic">Trips</span>
        </h1>
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

      {/* Trips grid */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {index.trips.map((trip, i) => (
                <div
                  key={trip.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}
                >
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
