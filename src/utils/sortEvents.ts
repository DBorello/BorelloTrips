import type { TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent, GroundTransportationEvent } from '../types/trip'

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
      const start = new Date(`${a.date}T${a.startTime}:00`)
      start.setMinutes(start.getMinutes() + a.durationMinutes)
      return start.toISOString()
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

  const start = new Date(getEventStartDatetime(event))
  const end = new Date(getEventEndDatetime(event) ?? getEventStartDatetime(event))

  const dates: string[] = []
  const current = new Date(start)
  current.setHours(0, 0, 0, 0)

  const endDate = new Date(end)
  endDate.setHours(0, 0, 0, 0)

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}
