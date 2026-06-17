import type { TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent, GroundTransportationEvent } from '../types/trip'
import { addMinutesToDatetime } from './dates'

export function getEventStartDatetime(event: TripEvent): string {
  switch (event.type) {
    case 'flight':
      return (event as FlightEvent).departureDatetime
    case 'hotel':
      return (event as HotelEvent).checkInDatetime
    case 'car_rental':
      return (event as CarRentalEvent).pickupDatetime
    case 'restaurant': {
      const r = event as RestaurantEvent
      return `${r.date}T${r.time}:00`
    }
    case 'activity': {
      const a = event as ActivityEvent
      return `${a.date}T${a.startTime}:00`
    }
    case 'ground_transportation':
      return (event as GroundTransportationEvent).pickupDatetime
  }
}

export function getEventEndDatetime(event: TripEvent): string | null {
  switch (event.type) {
    case 'flight':
      return (event as FlightEvent).arrivalDatetime
    case 'hotel':
      return (event as HotelEvent).checkOutDatetime
    case 'car_rental':
      return (event as CarRentalEvent).dropoffDatetime
    case 'restaurant':
      return null
    case 'activity': {
      const a = event as ActivityEvent
      return addMinutesToDatetime(`${a.date}T${a.startTime}:00`, a.durationMinutes)
    }
    case 'ground_transportation':
      return (event as GroundTransportationEvent).dropoffDatetime
  }
}

export function getEventDate(event: TripEvent): string {
  return getEventStartDatetime(event).split('T')[0]
}

export function sortEventsByTime(events: TripEvent[]): TripEvent[] {
  return [...events].sort((a, b) => {
    const aTime = getEventStartDatetime(a)
    const bTime = getEventStartDatetime(b)
    return aTime.localeCompare(bTime)
  })
}

export function groupEventsByDay(events: TripEvent[]): Map<string, TripEvent[]> {
  const sorted = sortEventsByTime(events)
  const grouped = new Map<string, TripEvent[]>()

  for (const event of sorted) {
    const date = getEventDate(event)
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(event)
  }

  return grouped
}

// Returns all dates a hotel/car-rental spans (for multi-day indicators)
export function getMultiDayDates(event: TripEvent): string[] {
  if (event.type !== 'hotel' && event.type !== 'car_rental') return []

  const startStr = getEventStartDatetime(event).split('T')[0]
  const endStr = (getEventEndDatetime(event) ?? getEventStartDatetime(event)).split('T')[0]

  const [sy, sm, sd] = startStr.split('-').map(Number)
  const [ey, em, ed] = endStr.split('-').map(Number)
  const current = new Date(sy, sm - 1, sd)
  const endDate = new Date(ey, em - 1, ed)

  const dates: string[] = []
  while (current <= endDate) {
    const y = current.getFullYear()
    const m = String(current.getMonth() + 1).padStart(2, '0')
    const d = String(current.getDate()).padStart(2, '0')
    dates.push(`${y}-${m}-${d}`)
    current.setDate(current.getDate() + 1)
  }

  return dates
}
