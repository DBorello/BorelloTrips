import React, { useState } from 'react'
import {
  Plane, Hotel, Car, UtensilsCrossed, MapPin,
  ChevronDown, Copy, Check, ArrowRight
} from 'lucide-react'
import type { TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent } from '../../types/trip'
import { getEventColor, getEventBadgeClass, EVENT_LABELS } from '../../utils/eventColors'
import { formatTime, formatDate } from '../../utils/dates'

function EventIcon({ type, className = '', style }: { type: TripEvent['type']; className?: string; style?: React.CSSProperties }) {
  const props = { className: `w-4 h-4 ${className}`, style }
  switch (type) {
    case 'flight': return <Plane {...props} />
    case 'hotel': return <Hotel {...props} />
    case 'car_rental': return <Car {...props} />
    case 'restaurant': return <UtensilsCrossed {...props} />
    case 'activity': return <MapPin {...props} />
  }
}

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
      className="p-1 rounded-md hover:bg-white/8 transition-colors"
      title="Copy confirmation number"
    >
      {copied
        ? <Check className="w-3 h-3 text-emerald-400" />
        : <Copy className="w-3 h-3 text-white/20 hover:text-white/50" />
      }
    </button>
  )
}

function EventSummaryLine({ event }: { event: TripEvent }) {
  switch (event.type) {
    case 'flight': {
      const f = event as FlightEvent
      return (
        <div>
          <div className="flex items-center gap-2 font-medium text-white text-sm mb-0.5">
            <span>{f.departureAirport}</span>
            <ArrowRight className="w-3 h-3 text-white/30" />
            <span>{f.arrivalAirport}</span>
          </div>
          <div className="text-xs text-white/35">{f.airline} · {f.flightNumber}</div>
        </div>
      )
    }
    case 'hotel': {
      const h = event as HotelEvent
      return (
        <div>
          <div className="font-medium text-white text-sm mb-0.5">{h.name}</div>
          <div className="text-xs text-white/35 truncate">{h.address}</div>
        </div>
      )
    }
    case 'car_rental': {
      const c = event as CarRentalEvent
      return (
        <div>
          <div className="font-medium text-white text-sm mb-0.5">{c.company} · {c.carType}</div>
          <div className="text-xs text-white/35 truncate">{c.pickupLocation}</div>
        </div>
      )
    }
    case 'restaurant': {
      const r = event as RestaurantEvent
      return (
        <div>
          <div className="font-medium text-white text-sm mb-0.5">{r.name}</div>
          <div className="text-xs text-white/35 truncate">
            {r.partySize ? `Party of ${r.partySize} · ` : ''}{r.address}
          </div>
        </div>
      )
    }
    case 'activity': {
      const a = event as ActivityEvent
      return (
        <div>
          <div className="font-medium text-white text-sm mb-0.5">{a.name}</div>
          <div className="text-xs text-white/35 truncate">
            {a.durationMinutes ? `${a.durationMinutes} min · ` : ''}{a.address}
          </div>
        </div>
      )
    }
  }
}

function EventTime({ event }: { event: TripEvent }) {
  let time = ''
  let label = ''

  switch (event.type) {
    case 'flight': {
      const f = event as FlightEvent
      time = formatTime(f.departureDatetime)
      label = 'departs'
      break
    }
    case 'hotel': {
      const h = event as HotelEvent
      time = formatTime(h.checkInDatetime)
      label = 'check-in'
      break
    }
    case 'car_rental': {
      const c = event as CarRentalEvent
      time = formatTime(c.pickupDatetime)
      label = 'pickup'
      break
    }
    case 'restaurant': {
      const r = event as RestaurantEvent
      time = formatTime(`${r.date}T${r.time}:00`)
      label = 'reservation'
      break
    }
    case 'activity': {
      const a = event as ActivityEvent
      time = formatTime(`${a.date}T${a.startTime}:00`)
      label = 'starts'
      break
    }
  }

  return (
    <div className="text-right flex-shrink-0">
      <div className="font-mono text-xs font-medium text-white/60">{time}</div>
      <div className="text-[10px] text-white/20 tracking-wide">{label}</div>
    </div>
  )
}

function EventDetails({ event }: { event: TripEvent }) {
  const color = getEventColor(event.type)

  const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    if (!value && value !== 0) return null
    return (
      <div className="space-y-0.5">
        <div className="text-[10px] text-white/25 uppercase tracking-[0.12em]">{label}</div>
        <div className="text-sm text-white/70 leading-snug">{value}</div>
      </div>
    )
  }

  const content = () => {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        return (
          <>
            <Field label="Airline" value={f.airline} />
            <Field label="Flight Number" value={f.flightNumber} />
            <Field label="Route" value={`${f.departureAirport} → ${f.arrivalAirport}`} />
            <Field label="Departure" value={`${formatDate(f.departureDatetime)} at ${formatTime(f.departureDatetime)}`} />
            <Field label="Arrival" value={`${formatDate(f.arrivalDatetime)} at ${formatTime(f.arrivalDatetime)}`} />
            {f.notes && <Field label="Notes" value={f.notes} />}
          </>
        )
      }
      case 'hotel': {
        const h = event as HotelEvent
        return (
          <>
            <Field label="Hotel" value={h.name} />
            <Field label="Address" value={h.address} />
            <Field label="Check-In" value={`${formatDate(h.checkInDatetime)} at ${formatTime(h.checkInDatetime)}`} />
            <Field label="Check-Out" value={`${formatDate(h.checkOutDatetime)} at ${formatTime(h.checkOutDatetime)}`} />
            {h.notes && <Field label="Notes" value={h.notes} />}
          </>
        )
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        return (
          <>
            <Field label="Company" value={c.company} />
            <Field label="Car Type" value={c.carType} />
            <Field label="Pick-Up" value={`${c.pickupLocation} · ${formatDate(c.pickupDatetime)} at ${formatTime(c.pickupDatetime)}`} />
            <Field label="Drop-Off" value={`${c.dropoffLocation} · ${formatDate(c.dropoffDatetime)} at ${formatTime(c.dropoffDatetime)}`} />
            {c.notes && <Field label="Notes" value={c.notes} />}
          </>
        )
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        return (
          <>
            <Field label="Restaurant" value={r.name} />
            <Field label="Address" value={r.address} />
            <Field label="Date & Time" value={`${formatDate(r.date)} at ${formatTime(`${r.date}T${r.time}:00`)}`} />
            <Field label="Party Size" value={r.partySize} />
            {r.notes && <Field label="Notes" value={r.notes} />}
          </>
        )
      }
      case 'activity': {
        const a = event as ActivityEvent
        return (
          <>
            <Field label="Activity" value={a.name} />
            {a.description && <Field label="Description" value={a.description} />}
            <Field label="Address" value={a.address} />
            <Field label="Date & Time" value={`${formatDate(a.date)} at ${formatTime(`${a.date}T${a.startTime}:00`)}`} />
            {a.durationMinutes && <Field label="Duration" value={`${a.durationMinutes} minutes`} />}
            {a.notes && <Field label="Notes" value={a.notes} />}
          </>
        )
      }
    }
  }

  return (
    <div
      className="mt-4 pt-4 grid grid-cols-2 gap-x-6 gap-y-3.5"
      style={{ borderTop: `1px solid ${color}18` }}
    >
      {content()}
    </div>
  )
}

interface EventRowProps {
  event: TripEvent
  isMultiDayIndicator?: boolean
  multiDayLabel?: string
}

export function EventRow({ event, isMultiDayIndicator, multiDayLabel }: EventRowProps) {
  const [expanded, setExpanded] = useState(false)
  const color = getEventColor(event.type)
  const badgeClass = getEventBadgeClass(event.type)

  if (isMultiDayIndicator) {
    return (
      <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-ink-900/40 border border-white/4">
        <div className="w-0.5 h-4 rounded-full opacity-40 flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs text-white/25 italic">{multiDayLabel}</span>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer group"
      style={{
        backgroundColor: '#101018',
        borderColor: expanded ? `${color}25` : 'rgba(255,255,255,0.07)',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Colored left accent bar */}
        <div
          className="w-0.5 self-stretch rounded-full flex-shrink-0 transition-opacity duration-200"
          style={{ backgroundColor: color, opacity: expanded ? 1 : 0.5 }}
        />

        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: `${color}12`,
            boxShadow: expanded ? `0 0 16px ${color}20` : 'none',
          }}
        >
          <EventIcon type={event.type} style={{ color, width: 16, height: 16 }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <EventSummaryLine event={event} />
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <EventTime event={event} />
              <ChevronDown
                className="w-3.5 h-3.5 text-white/20 transition-transform duration-200 flex-shrink-0"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
              />
            </div>
          </div>

          {/* Badge + confirmation number */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
              {EVENT_LABELS[event.type]}
            </span>
            {event.confirmationNumber && (
              <div className="flex items-center gap-0.5">
                <span className="text-[11px] text-white/20 font-mono">#{event.confirmationNumber}</span>
                <CopyButton value={event.confirmationNumber} />
              </div>
            )}
          </div>

          {expanded && <EventDetails event={event} />}
        </div>
      </div>
    </div>
  )
}
