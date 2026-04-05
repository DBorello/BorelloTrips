import { useEffect, useRef } from 'react'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import type { Trip, HotelEvent, CarRentalEvent, TripEvent } from '../../types/trip'
import { EventRow } from '../events/EventRow'
import {
  groupEventsByDay,
  getMultiDayDates,
  getEventStartDatetime,
  getEventEndDatetime,
  sortEventsByTime
} from '../../utils/sortEvents'
import { getAllDatesInRange, getTripStatus, isToday } from '../../utils/dates'
import { getEventColor } from '../../utils/eventColors'

interface MultiDayInfo {
  event: TripEvent
  label: string
}

function getMultiDayIndicators(
  events: TripEvent[],
  date: string
): MultiDayInfo[] {
  const indicators: MultiDayInfo[] = []

  for (const event of events) {
    if (event.type !== 'hotel' && event.type !== 'car_rental') continue

    const startDate = getEventStartDatetime(event).split('T')[0]
    const endDate = (getEventEndDatetime(event) ?? getEventStartDatetime(event)).split('T')[0]
    const allDates = getMultiDayDates(event)

    if (date === startDate || !allDates.includes(date)) continue

    const dayNumber = differenceInCalendarDays(parseISO(date), parseISO(startDate)) + 1
    const totalDays = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1

    if (event.type === 'hotel') {
      const h = event as HotelEvent
      indicators.push({
        event,
        label: `${h.name} · night ${dayNumber} of ${totalDays}`
      })
    } else if (event.type === 'car_rental') {
      const c = event as CarRentalEvent
      indicators.push({
        event,
        label: `${c.company} rental · day ${dayNumber} of ${totalDays}`
      })
    }
  }

  return indicators
}

interface ItineraryViewProps {
  trip: Trip
}

export function ItineraryView({ trip }: ItineraryViewProps) {
  const todayRef = useRef<HTMLDivElement>(null)
  const allDates = getAllDatesInRange(trip.startDate, trip.endDate)
  const grouped = groupEventsByDay(trip.events)
  const sortedEvents = sortEventsByTime(trip.events)
  const tripStatus = getTripStatus(trip.startDate, trip.endDate)

  useEffect(() => {
    if (tripStatus === 'active' && todayRef.current) {
      const timer = setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [tripStatus])

  const datesWithContent = new Set<string>()
  for (const date of allDates) {
    datesWithContent.add(date)
  }
  for (const event of trip.events) {
    const date = getEventStartDatetime(event).split('T')[0]
    datesWithContent.add(date)
  }

  const sortedDates = Array.from(datesWithContent).sort()

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="font-display text-3xl italic text-white/10 mb-3">No events yet</div>
        <p className="text-white/20 text-sm">Add events to your trip file to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {sortedDates.map(date => {
        const primaryEvents = grouped.get(date) ?? []
        const multiDayIndicators = getMultiDayIndicators(sortedEvents, date)

        if (primaryEvents.length === 0 && multiDayIndicators.length === 0) return null

        const parsedDate = parseISO(date)
        const dayNum = format(parsedDate, 'd')
        const dayName = format(parsedDate, 'EEEE')
        const monthYear = format(parsedDate, 'MMMM yyyy')
        const today = isToday(date)

        return (
          <div key={date} ref={today ? todayRef : undefined}>
            {/* Day header */}
            <div className="sticky z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 bg-ink-950/92 backdrop-blur-md mb-5 border-b border-white/4" style={{ top: 'calc(3.5rem + 52px + env(safe-area-inset-top, 0px))' }}>
              <div className="max-w-7xl mx-auto flex items-center gap-4">
                {/* Large day number — Cormorant, more impactful */}
                <div
                  className="font-display font-light leading-none select-none flex-shrink-0 w-[4.5rem] text-right transition-colors duration-300"
                  style={{
                    fontSize: 'clamp(3.25rem, 7vw, 4.5rem)',
                    color: today ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.09)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {dayNum}
                </div>
                {/* Divider */}
                <div
                  className="w-px self-stretch flex-shrink-0 transition-colors duration-300"
                  style={{ backgroundColor: today ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)' }}
                />
                {/* Day name + month */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="font-medium tracking-wide transition-colors duration-300"
                      style={{
                        fontSize: '0.875rem',
                        color: today ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
                      }}
                    >
                      {dayName}
                    </div>
                    {today && (
                      <span className="text-[9px] font-medium tracking-[0.18em] uppercase bg-white/10 text-white/55 px-2 py-0.5 rounded-full border border-white/14">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/22 tracking-wider uppercase mt-0.5">{monthYear}</div>
                </div>
              </div>
            </div>

            {/* Events — timeline layout */}
            <div className="relative pl-6 sm:pl-8">
              {/* Vertical thread line — more refined gradient */}
              <div className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

              <div className="space-y-3">
                {/* Multi-day continuation indicators */}
                {multiDayIndicators.map(({ event, label }) => {
                  const color = getEventColor(event.type)
                  return (
                    <div key={`indicator-${event.id}-${date}`} className="relative flex items-center gap-3">
                      {/* Timeline dot — hollow for continuations */}
                      <div
                        className="absolute -left-6 sm:-left-8 w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: '#08080e', border: `1.5px solid ${color}45`, boxShadow: `0 0 0 2px #08080e` }}
                      />
                      <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-xl bg-ink-900/30 border border-white/4 flex-1">
                        <div className="w-0.5 h-3.5 rounded-full opacity-35" style={{ backgroundColor: color }} />
                        <span className="text-[11px] text-white/28 italic tracking-wide">{label}</span>
                      </div>
                    </div>
                  )
                })}

                {/* Primary events */}
                {primaryEvents.map((event, idx) => {
                  const color = getEventColor(event.type)
                  return (
                    <div key={event.id} className="relative">
                      {/* Timeline dot — solid with glow */}
                      <div
                        className="absolute -left-6 sm:-left-8 top-[1.2rem] w-[9px] h-[9px] rounded-full flex-shrink-0 z-10"
                        style={{
                          backgroundColor: color,
                          boxShadow: `0 0 0 3px #08080e, 0 0 0 4.5px ${color}45, 0 0 10px ${color}30`,
                        }}
                      />
                      <div
                        className="animate-slide-up"
                        style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
                      >
                        <EventRow event={event} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
