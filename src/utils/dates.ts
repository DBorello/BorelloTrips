import {
  format,
  parseISO,
  differenceInDays,
  eachDayOfInterval,
  isValid
} from 'date-fns'

export type TripStatus = 'upcoming' | 'active' | 'past'

export function getTripStatus(startDate: string, endDate: string): TripStatus {
  const today = format(new Date(), 'yyyy-MM-dd')
  if (today < startDate) return 'upcoming'
  if (today > endDate) return 'past'
  return 'active'
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return differenceInDays(parseISO(dateStr), today)
}

export function formatDate(dateStr: string, fmt = 'EEE, MMMM d, yyyy'): string {
  try {
    const date = parseISO(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
    if (!isValid(date)) return dateStr
    return format(date, fmt)
  } catch {
    return dateStr
  }
}

export function formatTime(datetimeStr: string): string {
  try {
    const date = parseISO(datetimeStr)
    if (!isValid(date)) return ''
    return format(date, 'h:mm a')
  } catch {
    return ''
  }
}

export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'MMM d')
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  if (!isValid(start) || !isValid(end)) return `${startDate} – ${endDate}`

  if (format(start, 'yyyy') === format(end, 'yyyy')) {
    if (format(start, 'MMM') === format(end, 'MMM')) {
      return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`
    }
    return `${format(start, 'MMMM d')} – ${format(end, 'MMMM d, yyyy')}`
  }
  return `${format(start, 'MMMM d, yyyy')} – ${format(end, 'MMMM d, yyyy')}`
}

// Add minutes to a naive local-time datetime ("YYYY-MM-DDTHH:MM:SS") and
// return the result as another naive string — never touches device timezone.
export function addMinutesToDatetime(dt: string, minutes: number): string {
  const [datePart, timePart = '00:00:00'] = dt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const [h, mn, s = 0] = timePart.split(':').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, h, mn, s))
  utc.setUTCMinutes(utc.getUTCMinutes() + minutes)
  const yy = utc.getUTCFullYear()
  const mm = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(utc.getUTCDate()).padStart(2, '0')
  const hh = String(utc.getUTCHours()).padStart(2, '0')
  const mins = String(utc.getUTCMinutes()).padStart(2, '0')
  const ss = String(utc.getUTCSeconds()).padStart(2, '0')
  return `${yy}-${mm}-${dd}T${hh}:${mins}:${ss}`
}

export function getDayCount(startDate: string, endDate: string): number {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    if (!isValid(start) || !isValid(end)) return 0
    return differenceInDays(end, start) + 1
  } catch {
    return 0
  }
}

export function getAllDatesInRange(startDate: string, endDate: string): string[] {
  try {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    if (!isValid(start) || !isValid(end)) return []
    return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'))
  } catch {
    return []
  }
}

export function getDayLabel(dateStr: string): string {
  return formatDate(dateStr, 'EEEE, MMMM d')
}

export function isToday(dateStr: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd')
  return dateStr === today
}

export function isFuture(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = parseISO(dateStr)
  return date > today
}

export function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const date = parseISO(dateStr)
  return date < today
}
