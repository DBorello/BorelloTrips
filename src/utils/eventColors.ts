import type { EventType } from '../types/trip'

export const EVENT_COLORS: Record<EventType, string> = {
  flight: '#0ea5e9',
  hotel: '#8b5cf6',
  car_rental: '#f59e0b',
  restaurant: '#f43f5e',
  activity: '#10b981',
  ground_transportation: '#f97316'
}

export const EVENT_LABELS: Record<EventType, string> = {
  flight: 'Flight',
  hotel: 'Hotel',
  car_rental: 'Car Rental',
  restaurant: 'Restaurant',
  activity: 'Activity',
  ground_transportation: 'Ground Transportation'
}

export function getEventColor(type: EventType): string {
  return EVENT_COLORS[type]
}

export function getEventBgClass(type: EventType): string {
  const map: Record<EventType, string> = {
    flight: 'bg-sky-500',
    hotel: 'bg-violet-500',
    car_rental: 'bg-amber-500',
    restaurant: 'bg-rose-500',
    activity: 'bg-emerald-500',
    ground_transportation: 'bg-orange-500'
  }
  return map[type]
}

export function getEventTextClass(type: EventType): string {
  const map: Record<EventType, string> = {
    flight: 'text-sky-400',
    hotel: 'text-violet-400',
    car_rental: 'text-amber-400',
    restaurant: 'text-rose-400',
    activity: 'text-emerald-400',
    ground_transportation: 'text-orange-400'
  }
  return map[type]
}

export function getEventBorderClass(type: EventType): string {
  const map: Record<EventType, string> = {
    flight: 'border-sky-500',
    hotel: 'border-violet-500',
    car_rental: 'border-amber-500',
    restaurant: 'border-rose-500',
    activity: 'border-emerald-500',
    ground_transportation: 'border-orange-500'
  }
  return map[type]
}

export function getEventBadgeClass(type: EventType): string {
  const map: Record<EventType, string> = {
    flight: 'bg-sky-500/20 text-sky-300',
    hotel: 'bg-violet-500/20 text-violet-300',
    car_rental: 'bg-amber-500/20 text-amber-300',
    restaurant: 'bg-rose-500/20 text-rose-300',
    activity: 'bg-emerald-500/20 text-emerald-300',
    ground_transportation: 'bg-orange-500/20 text-orange-300'
  }
  return map[type]
}
