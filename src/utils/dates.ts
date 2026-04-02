import {
  format,
  parseISO,
  differenceInDays,
  eachDayOfInterval,
  isValid
} from 'date-fns'

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
