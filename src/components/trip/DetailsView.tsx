import React, { useState } from 'react'
import {
  Plane, Hotel, Car, UtensilsCrossed, MapPin,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react'
import type {
  Trip, TripEvent, FlightEvent, HotelEvent,
  CarRentalEvent, RestaurantEvent, ActivityEvent
} from '../../types/trip'
import { getEventColor, getEventBadgeClass } from '../../utils/eventColors'
import { formatTime, formatDate } from '../../utils/dates'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs text-slate-300"
    >
      {copied
        ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
        : <><Copy className="w-3 h-3" /> Copy</>
      }
    </button>
  )
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm text-slate-200">{String(value)}</div>
    </div>
  )
}

function EventCard({ event }: { event: TripEvent }) {
  const [open, setOpen] = useState(false)
  const color = getEventColor(event.type)
  const badgeClass = getEventBadgeClass(event.type)

  const getTitle = (): string => {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        return `${f.departureAirport} → ${f.arrivalAirport} · ${f.flightNumber}`
      }
      case 'hotel': return (event as HotelEvent).name
      case 'car_rental': {
        const c = event as CarRentalEvent
        return `${c.company} · ${c.carType}`
      }
      case 'restaurant': return (event as RestaurantEvent).name
      case 'activity': return (event as ActivityEvent).name
    }
  }

  const getSubtitle = (): string => {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        return `${formatDate(f.departureDatetime, 'MMM d')} · ${formatTime(f.departureDatetime)}`
      }
      case 'hotel': {
        const h = event as HotelEvent
        return `${formatDate(h.checkInDatetime, 'MMM d')} – ${formatDate(h.checkOutDatetime, 'MMM d')}`
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        return `${formatDate(c.pickupDatetime, 'MMM d')} – ${formatDate(c.dropoffDatetime, 'MMM d')}`
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        return `${formatDate(r.date, 'MMM d')} at ${formatTime(`${r.date}T${r.time}:00`)}`
      }
      case 'activity': {
        const a = event as ActivityEvent
        return `${formatDate(a.date, 'MMM d')} at ${formatTime(`${a.date}T${a.startTime}:00`)}`
      }
    }
  }

  const renderDetails = () => {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Airline" value={f.airline} />
            <Field label="Flight Number" value={f.flightNumber} />
            <Field label="Departure Airport" value={f.departureAirport} />
            <Field label="Arrival Airport" value={f.arrivalAirport} />
            <Field label="Departure" value={`${formatDate(f.departureDatetime)} at ${formatTime(f.departureDatetime)}`} />
            <Field label="Arrival" value={`${formatDate(f.arrivalDatetime)} at ${formatTime(f.arrivalDatetime)}`} />
            {f.notes && <div className="col-span-full"><Field label="Notes" value={f.notes} /></div>}
          </div>
        )
      }
      case 'hotel': {
        const h = event as HotelEvent
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Hotel Name" value={h.name} />
            <Field label="Check-In" value={`${formatDate(h.checkInDatetime)} at ${formatTime(h.checkInDatetime)}`} />
            <Field label="Check-Out" value={`${formatDate(h.checkOutDatetime)} at ${formatTime(h.checkOutDatetime)}`} />
            <div className="col-span-full"><Field label="Address" value={h.address} /></div>
            {h.notes && <div className="col-span-full"><Field label="Notes" value={h.notes} /></div>}
          </div>
        )
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Company" value={c.company} />
            <Field label="Car Type" value={c.carType} />
            <Field label="Pick-Up Time" value={`${formatDate(c.pickupDatetime)} at ${formatTime(c.pickupDatetime)}`} />
            <Field label="Drop-Off Time" value={`${formatDate(c.dropoffDatetime)} at ${formatTime(c.dropoffDatetime)}`} />
            <div className="col-span-full"><Field label="Pick-Up Location" value={c.pickupLocation} /></div>
            <div className="col-span-full"><Field label="Drop-Off Location" value={c.dropoffLocation} /></div>
            {c.notes && <div className="col-span-full"><Field label="Notes" value={c.notes} /></div>}
          </div>
        )
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Restaurant" value={r.name} />
            <Field label="Date" value={formatDate(r.date, 'EEEE, MMMM d, yyyy')} />
            <Field label="Time" value={formatTime(`${r.date}T${r.time}:00`)} />
            <Field label="Party Size" value={r.partySize} />
            <div className="col-span-full"><Field label="Address" value={r.address} /></div>
            {r.notes && <div className="col-span-full"><Field label="Notes" value={r.notes} /></div>}
          </div>
        )
      }
      case 'activity': {
        const a = event as ActivityEvent
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Activity" value={a.name} />
            <Field label="Date" value={formatDate(a.date, 'EEEE, MMMM d, yyyy')} />
            <Field label="Start Time" value={formatTime(`${a.date}T${a.startTime}:00`)} />
            <Field label="Duration" value={`${a.durationMinutes} minutes`} />
            {a.description && <div className="col-span-full"><Field label="Description" value={a.description} /></div>}
            <div className="col-span-full"><Field label="Address" value={a.address} /></div>
            {a.notes && <div className="col-span-full"><Field label="Notes" value={a.notes} /></div>}
          </div>
        )
      }
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div
          className="w-1 self-stretch rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm truncate">{getTitle()}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`}>
              {getSubtitle()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-mono">#{event.confirmationNumber}</span>
            <CopyButton value={event.confirmationNumber} />
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800">
          {renderDetails()}
        </div>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  icon: React.ReactNode
  color: string
  events: TripEvent[]
}

function Section({ title, icon, color, events }: SectionProps) {
  const [open, setOpen] = useState(true)

  if (events.length === 0) return null

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <h2 className="text-base font-semibold text-white flex-1 text-left">
          {title}
          <span className="ml-2 text-sm font-normal text-slate-500">({events.length})</span>
        </h2>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-500" />
          : <ChevronDown className="w-4 h-4 text-slate-500" />
        }
      </button>
      {open && (
        <div className="space-y-2 mb-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

interface DetailsViewProps {
  trip: Trip
}

export function DetailsView({ trip }: DetailsViewProps) {
  const flights = trip.events.filter(e => e.type === 'flight')
  const hotels = trip.events.filter(e => e.type === 'hotel')
  const carRentals = trip.events.filter(e => e.type === 'car_rental')
  const restaurants = trip.events.filter(e => e.type === 'restaurant')
  const activities = trip.events.filter(e => e.type === 'activity')

  return (
    <div className="space-y-2">
      <Section
        title="Flights"
        icon={<Plane className="w-4 h-4" />}
        color={getEventColor('flight')}
        events={flights}
      />
      <Section
        title="Hotels"
        icon={<Hotel className="w-4 h-4" />}
        color={getEventColor('hotel')}
        events={hotels}
      />
      <Section
        title="Car Rentals"
        icon={<Car className="w-4 h-4" />}
        color={getEventColor('car_rental')}
        events={carRentals}
      />
      <Section
        title="Restaurants"
        icon={<UtensilsCrossed className="w-4 h-4" />}
        color={getEventColor('restaurant')}
        events={restaurants}
      />
      <Section
        title="Activities"
        icon={<MapPin className="w-4 h-4" />}
        color={getEventColor('activity')}
        events={activities}
      />
    </div>
  )
}
