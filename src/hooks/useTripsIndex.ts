import { useState, useEffect } from 'react'
import type { TripsIndex } from '../types/trip'

const BASE = import.meta.env.BASE_URL

interface UseTripsIndexResult {
  index: TripsIndex | null
  loading: boolean
  error: string | null
}

export function useTripsIndex(): UseTripsIndexResult {
  const [index, setIndex] = useState<TripsIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`${BASE}trips/index.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load trips index: ${res.status}`)
        return res.json()
      })
      .then((data: TripsIndex) => {
        setIndex(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { index, loading, error }
}
