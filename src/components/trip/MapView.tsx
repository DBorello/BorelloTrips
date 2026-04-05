import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Trip, TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent, Coordinates } from '../../types/trip'
import { getEventColor, EVENT_LABELS } from '../../utils/eventColors'
import { formatTime, formatDate } from '../../utils/dates'

// Known IATA airport coordinates for common airports
const AIRPORT_COORDS: Record<string, Coordinates> = {
  SFO: { lat: 37.6213, lng: -122.379 },
  LAX: { lat: 33.9425, lng: -118.408 },
  JFK: { lat: 40.6413, lng: -73.7781 },
  EWR: { lat: 40.6895, lng: -74.1745 },
  LGA: { lat: 40.7773, lng: -73.8726 },
  ORD: { lat: 41.9742, lng: -87.9073 },
  ATL: { lat: 33.6407, lng: -84.4277 },
  DFW: { lat: 32.8998, lng: -97.0403 },
  DEN: { lat: 39.8561, lng: -104.6737 },
  SEA: { lat: 47.4502, lng: -122.3088 },
  MIA: { lat: 25.7959, lng: -80.287 },
  BOS: { lat: 42.3656, lng: -71.0096 },
  LHR: { lat: 51.4775, lng: -0.4614 },
  CDG: { lat: 49.0097, lng: 2.5479 },
  AMS: { lat: 52.3105, lng: 4.7683 },
  FRA: { lat: 50.0333, lng: 8.5706 },
  MAD: { lat: 40.4983, lng: -3.5676 },
  BCN: { lat: 41.2974, lng: 2.0833 },
  FCO: { lat: 41.8003, lng: 12.2389 },
  NRT: { lat: 35.7647, lng: 140.3864 },
  HND: { lat: 35.5494, lng: 139.7798 },
  ICN: { lat: 37.4602, lng: 126.4407 },
  PEK: { lat: 40.0799, lng: 116.6031 },
  PVG: { lat: 31.1443, lng: 121.8083 },
  HKG: { lat: 22.3080, lng: 113.9185 },
  SIN: { lat: 1.3644, lng: 103.9915 },
  DXB: { lat: 25.2532, lng: 55.3657 },
  SYD: { lat: -33.9399, lng: 151.1753 },
  MEL: { lat: -37.6733, lng: 144.8430 },
  YYZ: { lat: 43.6777, lng: -79.6248 },
  YVR: { lat: 49.1967, lng: -123.1815 },
  MEX: { lat: 19.4363, lng: -99.0721 },
  GRU: { lat: -23.4356, lng: -46.4731 },
  EZE: { lat: -34.8222, lng: -58.5358 },
  KIX: { lat: 34.4347, lng: 135.2440 },
  CTS: { lat: 42.7752, lng: 141.6924 },
}

function createColorMarker(color: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${color}" opacity="0.95"/>
      <circle cx="14" cy="14" r="7" fill="rgba(255,255,255,0.95)"/>
      <circle cx="14" cy="14" r="4.5" fill="${color}"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36]
  })
}

interface PinData {
  coords: Coordinates
  label: string
  subLabel: string
  color: string
  event: TripEvent
  pinKey: string
}

function collectPins(events: TripEvent[]): PinData[] {
  const pins: PinData[] = []

  for (const event of events) {
    switch (event.type) {
      case 'hotel': {
        const h = event as HotelEvent
        if (h.coordinates) {
          pins.push({
            coords: h.coordinates,
            label: h.name,
            subLabel: `Check-in ${formatDate(h.checkInDatetime, 'MMM d')}`,
            color: getEventColor('hotel'),
            event,
            pinKey: `hotel-${h.id}`
          })
        }
        break
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        if (r.coordinates) {
          pins.push({
            coords: r.coordinates,
            label: r.name,
            subLabel: `${formatDate(r.date, 'MMM d')} at ${formatTime(`${r.date}T${r.time}:00`)}`,
            color: getEventColor('restaurant'),
            event,
            pinKey: `restaurant-${r.id}`
          })
        }
        break
      }
      case 'activity': {
        const a = event as ActivityEvent
        if (a.coordinates) {
          pins.push({
            coords: a.coordinates,
            label: a.name,
            subLabel: `${formatDate(a.date, 'MMM d')} at ${formatTime(`${a.date}T${a.startTime}:00`)}`,
            color: getEventColor('activity'),
            event,
            pinKey: `activity-${a.id}`
          })
        }
        break
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        if (c.pickupCoordinates) {
          pins.push({
            coords: c.pickupCoordinates,
            label: `${c.company} Pick-Up`,
            subLabel: c.pickupLocation,
            color: getEventColor('car_rental'),
            event,
            pinKey: `car-pickup-${c.id}`
          })
        }
        if (c.dropoffCoordinates && (
          !c.pickupCoordinates ||
          c.dropoffCoordinates.lat !== c.pickupCoordinates.lat ||
          c.dropoffCoordinates.lng !== c.pickupCoordinates.lng
        )) {
          pins.push({
            coords: c.dropoffCoordinates,
            label: `${c.company} Drop-Off`,
            subLabel: c.dropoffLocation,
            color: getEventColor('car_rental'),
            event,
            pinKey: `car-dropoff-${c.id}`
          })
        }
        break
      }
      case 'flight': {
        const f = event as FlightEvent
        const depCoords = AIRPORT_COORDS[f.departureAirport]
        const arrCoords = AIRPORT_COORDS[f.arrivalAirport]
        if (depCoords) {
          pins.push({
            coords: depCoords,
            label: `${f.departureAirport} (Departure)`,
            subLabel: `${f.flightNumber} · ${formatDate(f.departureDatetime, 'MMM d')} ${formatTime(f.departureDatetime)}`,
            color: getEventColor('flight'),
            event,
            pinKey: `flight-dep-${f.id}`
          })
        }
        if (arrCoords) {
          pins.push({
            coords: arrCoords,
            label: `${f.arrivalAirport} (Arrival)`,
            subLabel: `${f.flightNumber} · ${formatDate(f.arrivalDatetime, 'MMM d')} ${formatTime(f.arrivalDatetime)}`,
            color: getEventColor('flight'),
            event,
            pinKey: `flight-arr-${f.id}`
          })
        }
        break
      }
    }
  }

  return pins
}

// Child component: auto-fits map bounds to the given pins
function BoundsFitter({ pins }: { pins: PinData[] }) {
  const map = useMap()

  useEffect(() => {
    if (pins.length === 0) return

    if (pins.length === 1) {
      map.setView([pins[0].coords.lat, pins[0].coords.lng], 13)
      return
    }

    const bounds = L.latLngBounds(pins.map(p => [p.coords.lat, p.coords.lng]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
  }, [map, pins])

  return null
}

// Get hotel pins for default view
function getHotelPins(pins: PinData[]): PinData[] {
  return pins.filter(p => p.event.type === 'hotel')
}

interface MapViewProps {
  trip: Trip
}

export function MapView({ trip }: MapViewProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const allPins = collectPins(trip.events)

  const eventTypes = [
    { type: 'flight', label: 'Flights' },
    { type: 'hotel', label: 'Hotels' },
    { type: 'car_rental', label: 'Cars' },
    { type: 'restaurant', label: 'Restaurants' },
    { type: 'activity', label: 'Activities' }
  ] as const

  const availableTypes = eventTypes.filter(et =>
    allPins.some(p => p.event.type === et.type)
  )

  const filteredPins = activeFilter
    ? allPins.filter(p => p.event.type === activeFilter)
    : allPins

  // Default view: show hotels; fallback to all pins for bounds fitting
  const defaultBoundsPins = activeFilter
    ? filteredPins
    : (getHotelPins(allPins).length > 0 ? getHotelPins(allPins) : allPins)

  // Fallback center if no pins at all
  const fallbackCenter: [number, number] = [48.8566, 2.3522]

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      {availableTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
              !activeFilter
                ? 'bg-white/12 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/8 hover:text-white/70'
            }`}
          >
            All
          </button>
          {availableTypes.map(({ type, label }) => {
            const color = getEventColor(type)
            const isActive = activeFilter === type
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(isActive ? null : type)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                style={
                  isActive
                    ? { backgroundColor: `${color}25`, color, border: `1px solid ${color}40` }
                    : { backgroundColor: `${color}10`, color: `${color}80`, border: '1px solid transparent' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-white/7" style={{ height: '520px' }}>
        {allPins.length > 0 ? (
          <MapContainer
            center={fallbackCenter}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <BoundsFitter pins={activeFilter ? filteredPins : defaultBoundsPins} />
            {filteredPins.map(pin => (
              <Marker
                key={pin.pinKey}
                position={[pin.coords.lat, pin.coords.lng]}
                icon={createColorMarker(pin.color)}
              >
                <Popup>
                  <div>
                    <div className="text-[10px] font-medium tracking-[0.12em] uppercase mb-1.5" style={{ color: pin.color }}>
                      {EVENT_LABELS[pin.event.type]}
                    </div>
                    <div className="font-medium text-sm text-white mb-0.5">{pin.label}</div>
                    <div className="text-xs text-white/45">{pin.subLabel}</div>
                    {pin.event.confirmationNumber && (
                      <div className="text-[11px] text-white/25 mt-1.5 font-mono">
                        #{pin.event.confirmationNumber}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full bg-ink-900 flex items-center justify-center">
            <div className="text-center">
              <div className="font-display text-2xl italic text-white/10 mb-2">No locations</div>
              <p className="text-white/20 text-xs">Add coordinates to events to see them on the map</p>
            </div>
          </div>
        )}
      </div>

      {filteredPins.length === 0 && allPins.length > 0 && (
        <p className="text-center text-white/45 text-sm italic">No pins for this filter</p>
      )}

      {/* Legend */}
      {availableTypes.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {availableTypes.map(({ type, label }) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getEventColor(type) }} />
              <span className="text-xs text-white/50">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
