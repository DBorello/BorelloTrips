import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { List, Calendar, Map } from 'lucide-react'
import { useTrip } from '../hooks/useTrip'
import { TripHeader } from '../components/trip/TripHeader'
import { ItineraryView } from '../components/trip/ItineraryView'
import { CalendarView } from '../components/trip/CalendarView'
import { MapView } from '../components/trip/MapView'

type TabId = 'itinerary' | 'calendar' | 'map'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'itinerary', label: 'Itinerary', icon: <List className="w-3.5 h-3.5" /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'map', label: 'Map', icon: <Map className="w-3.5 h-3.5" /> },
]

export function TripPage() {
  const { id } = useParams<{ id: string }>()
  const { trip, loading, error } = useTrip(id)
  const [activeTab, setActiveTab] = useState<TabId>('itinerary')

  if (loading) {
    return (
      <div>
        <div className="animate-pulse bg-ink-900" style={{ height: 'clamp(340px, 55vh, 560px)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="h-6 bg-ink-800 rounded-full w-1/3" />
          <div className="h-4 bg-ink-800 rounded-full w-1/2" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="rounded-2xl bg-rose-500/8 border border-rose-500/20 p-10 inline-block">
          <p className="font-display text-2xl italic text-rose-400/70">{error ?? 'Trip not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TripHeader trip={trip} />

      {/* Tab bar — refined underline style */}
      <div className="sticky z-20 bg-ink-950/92 backdrop-blur-xl border-b border-white/6" style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-200 press-scale ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/75'
                }`}
              >
                <span className={`transition-colors duration-200 ${activeTab === tab.id ? 'text-white' : 'text-white/50'}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {/* Active indicator — thin colored underline with glow */}
                {activeTab === tab.id && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.6) 100%)',
                      boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'itinerary' && <ItineraryView trip={trip} />}
        {activeTab === 'calendar' && <CalendarView trip={trip} />}
        {activeTab === 'map' && <MapView trip={trip} />}
      </div>
    </div>
  )
}
