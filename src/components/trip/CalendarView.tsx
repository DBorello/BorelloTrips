import { useState, useRef, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import type { Trip, TripEvent, FlightEvent, HotelEvent, CarRentalEvent, RestaurantEvent, ActivityEvent, GroundTransportationEvent } from '../../types/trip'
import { getEventColor } from '../../utils/eventColors'
import { EventPopover } from './EventPopover'

function buildCalendarEvents(events: TripEvent[]): EventInput[] {
  const calEvents: EventInput[] = []

  for (const event of events) {
    switch (event.type) {
      case 'flight': {
        const f = event as FlightEvent
        calEvents.push({
          id: f.id,
          title: `${f.departureAirport} → ${f.arrivalAirport}`,
          start: f.departureDatetime,
          end: f.arrivalDatetime,
          backgroundColor: getEventColor('flight'),
          borderColor: getEventColor('flight'),
          extendedProps: { event: f }
        })
        break
      }
      case 'hotel': {
        const h = event as HotelEvent
        calEvents.push({
          id: h.id,
          title: h.name,
          start: h.checkInDatetime,
          end: h.checkOutDatetime,
          backgroundColor: getEventColor('hotel'),
          borderColor: getEventColor('hotel'),
          extendedProps: { event: h }
        })
        break
      }
      case 'car_rental': {
        const c = event as CarRentalEvent
        calEvents.push({
          id: c.id,
          title: `${c.company} Rental`,
          start: c.pickupDatetime,
          end: c.dropoffDatetime,
          backgroundColor: getEventColor('car_rental'),
          borderColor: getEventColor('car_rental'),
          extendedProps: { event: c }
        })
        break
      }
      case 'restaurant': {
        const r = event as RestaurantEvent
        calEvents.push({
          id: r.id,
          title: r.name,
          start: `${r.date}T${r.time}:00`,
          backgroundColor: getEventColor('restaurant'),
          borderColor: getEventColor('restaurant'),
          extendedProps: { event: r }
        })
        break
      }
      case 'activity': {
        const a = event as ActivityEvent
        const startDt = `${a.date}T${a.startTime}:00`
        const endDate = new Date(startDt)
        endDate.setMinutes(endDate.getMinutes() + a.durationMinutes)
        calEvents.push({
          id: a.id,
          title: a.name,
          start: startDt,
          end: endDate.toISOString(),
          backgroundColor: getEventColor('activity'),
          borderColor: getEventColor('activity'),
          extendedProps: { event: a }
        })
        break
      }
      case 'ground_transportation': {
        const g = event as GroundTransportationEvent
        calEvents.push({
          id: g.id,
          title: `${g.pickupLocation} → ${g.dropoffLocation}`,
          start: g.pickupDatetime,
          end: g.dropoffDatetime ?? undefined,
          backgroundColor: getEventColor('ground_transportation'),
          borderColor: getEventColor('ground_transportation'),
          extendedProps: { event: g }
        })
        break
      }
    }
  }

  return calEvents
}

// Sunday on or before the given date
function weekStart(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

// Number of full Sun–Sat weeks needed to cover startDate through endDate
function weeksNeeded(startDate: string, endDate: string): number {
  const start = new Date(weekStart(startDate))
  const end = new Date(endDate)
  const daysToSat = end.getDay() === 6 ? 0 : 6 - end.getDay()
  end.setDate(end.getDate() + daysToSat)
  return Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
}

interface CalendarViewProps {
  trip: Trip
}

export function CalendarView({ trip }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const calendarRef = useRef<FullCalendar>(null)

  const calendarEvents = buildCalendarEvents(trip.events)
  const gridStart = weekStart(trip.startDate)
  const numWeeks = weeksNeeded(trip.startDate, trip.endDate)

  const handleEventClick = useCallback((info: EventClickArg) => {
    const ev = info.event.extendedProps.event as TripEvent
    setSelectedEvent(ev)
    setIsMobile(window.innerWidth < 640)
  }, [])

  return (
    <div className="relative">
      {/* Calendar — weekly grid, Sun–Sat rows */}
      <div className="rounded-xl overflow-hidden border border-white/8 bg-ink-900 calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridCustom"
          initialDate={gridStart}
          firstDay={0}
          views={{
            dayGridCustom: {
              type: 'dayGrid',
              duration: { weeks: numWeeks }
            }
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          headerToolbar={{
            left: '',
            center: 'title',
            right: ''
          }}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={false}
          eventTextColor="#ffffff"
          eventOrder="-duration,start,title"
        />
      </div>

      {/* Event popover / bottom sheet */}
      {selectedEvent && !isMobile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10" onClick={e => e.stopPropagation()}>
            <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} isMobile={false} />
          </div>
        </div>
      )}

      {selectedEvent && isMobile && (
        <EventPopover
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isMobile={true}
        />
      )}
    </div>
  )
}
