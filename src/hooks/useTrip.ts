import { useState, useEffect } from 'react'
import type { Trip } from '../types/trip'

const BASE = import.meta.env.BASE_URL

interface UseTripResult {
  trip: Trip | null
  loading: boolean
  error: string | null
}

export function useTrip(id: string | undefined): UseTripResult {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('No trip ID provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setTrip(null)

    fetch(`${BASE}trips/${id}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Trip not found: ${res.status}`)
        return res.json()
      })
      .then((data: Trip) => {
        setTrip(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  return { trip, loading, error }
}
