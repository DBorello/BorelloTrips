import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent, GroundTransportationEvent } from '../../types/trip'
import { getEventColor, getEventBadgeClass, EVENT_LABELS } from '../../utils/eventColors'
import { formatTime, formatDate } from '../../utils/dates'

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-200 mt-0.5">{value}</span>
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface EventPopoverProps {
  event: TripEvent
  onClose: () => void
  isMobile?: boolean
}

export function EventPopover({ event, onClose, isMobile }: EventPopoverProps) {
  const color = getEventColor(event.type)
  const badgeClass = getEventBadgeClass(event.type)

  const renderContent = () => {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{f.departureAirport} → {f.arrivalAirport}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Airline" value={f.airline} />
              <Field label="Flight #" value={f.flightNumber} />
              <Field label="Departure" value={`${formatDate(f.departureDatetime, 'MMM d')} ${formatTime(f.departureDatetime)}`} />
              <Field label="Arrival" value={`${formatDate(f.arrivalDatetime, 'MMM d')} ${formatTime(f.arrivalDatetime)}`} />
            </div>
            {f.notes && <Field label="Notes" value={f.notes} />}
          </div>
        )
      }
      case 'hotel': {
        const h = event as HotelEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{h.name}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-In" value={`${formatDate(h.checkInDatetime, 'MMM d')} ${formatTime(h.checkInDatetime)}`} />
              <Field label="Check-Out" value={`${formatDate(h.checkOutDatetime, 'MMM d')} ${formatTime(h.checkOutDatetime)}`} />
            </div>
            <Field label="Address" value={h.address} />
            {h.notes && <Field label="Notes" value={h.notes} />}
          </div>
        )
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{c.company} · {c.carType}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pick-Up" value={`${formatDate(c.pickupDatetime, 'MMM d')} ${formatTime(c.pickupDatetime)}`} />
              <Field label="Drop-Off" value={`${formatDate(c.dropoffDatetime, 'MMM d')} ${formatTime(c.dropoffDatetime)}`} />
            </div>
            <Field label="Pick-Up Location" value={c.pickupLocation} />
            {c.dropoffLocation !== c.pickupLocation && <Field label="Drop-Off Location" value={c.dropoffLocation} />}
            {c.notes && <Field label="Notes" value={c.notes} />}
          </div>
        )
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{r.name}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" value={formatDate(r.date, 'EEEE, MMM d')} />
              <Field label="Time" value={formatTime(`${r.date}T${r.time}:00`)} />
              <Field label="Party Size" value={r.partySize} />
            </div>
            <Field label="Address" value={r.address} />
            {r.notes && <Field label="Notes" value={r.notes} />}
          </div>
        )
      }
      case 'activity': {
        const a = event as ActivityEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{a.name}</div>
            {a.description && <p className="text-sm text-slate-400">{a.description}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" value={formatDate(a.date, 'EEEE, MMM d')} />
              <Field label="Start Time" value={formatTime(`${a.date}T${a.startTime}:00`)} />
              <Field label="Duration" value={`${a.durationMinutes} min`} />
            </div>
            <Field label="Address" value={a.address} />
            {a.notes && <Field label="Notes" value={a.notes} />}
          </div>
        )
      }
      case 'ground_transportation': {
        const g = event as GroundTransportationEvent
        return (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-white">{g.pickupLocation} → {g.dropoffLocation}</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company" value={g.company} />
              <Field label="Service Type" value={g.serviceType} />
              <Field label="Pick-Up" value={`${formatDate(g.pickupDatetime, 'MMM d')} ${formatTime(g.pickupDatetime)}`} />
              {g.dropoffDatetime && <Field label="Drop-Off" value={`${formatDate(g.dropoffDatetime, 'MMM d')} ${formatTime(g.dropoffDatetime)}`} />}
            </div>
            {g.notes && <Field label="Notes" value={g.notes} />}
          </div>
        )
      }
    }
  }

  const containerClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-slate-900 border-t border-slate-700 p-5 shadow-2xl'
    : 'bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 w-80'

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div className={containerClass}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`} style={{ borderLeft: `3px solid ${color}` }}>
            {EVENT_LABELS[event.type]}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {renderContent()}

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Confirmation</span>
            <div className="font-mono text-sm text-slate-200">{event.confirmationNumber}</div>
          </div>
          <CopyButton value={event.confirmationNumber} />
        </div>
      </div>
    </>
  )
}
