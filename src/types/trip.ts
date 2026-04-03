export type EventType = 'flight' | 'hotel' | 'car_rental' | 'restaurant' | 'activity' | 'ground_transportation'

export interface Coordinates {
  lat: number
  lng: number
}

export interface FlightEvent {
  id: string
  type: 'flight'
  airline: string
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  departureDatetime: string
  arrivalDatetime: string
  confirmationNumber: string
  notes: string | null
}

export interface HotelEvent {
  id: string
  type: 'hotel'
  name: string
  address: string
  checkInDatetime: string
  checkOutDatetime: string
  confirmationNumber: string
  coordinates?: Coordinates
  notes: string | null
}

export interface CarRentalEvent {
  id: string
  type: 'car_rental'
  company: string
  carType: string
  pickupLocation: string
  dropoffLocation: string
  pickupDatetime: string
  dropoffDatetime: string
  pickupCoordinates?: Coordinates
  dropoffCoordinates?: Coordinates
  confirmationNumber: string
  notes: string | null
}

export interface RestaurantEvent {
  id: string
  type: 'restaurant'
  name: string
  address: string
  date: string
  time: string
  partySize: number
  confirmationNumber: string
  coordinates?: Coordinates
  notes: string | null
}

export interface ActivityEvent {
  id: string
  type: 'activity'
  name: string
  description: string
  address: string
  date: string
  startTime: string
  durationMinutes: number
  confirmationNumber: string
  coordinates?: Coordinates
  notes: string | null
}

export interface GroundTransportationEvent {
  id: string
  type: 'ground_transportation'
  company: string
  serviceType: string
  pickupLocation: string
  dropoffLocation: string
  pickupDatetime: string
  dropoffDatetime: string | null
  pickupCoordinates?: Coordinates
  dropoffCoordinates?: Coordinates
  confirmationNumber: string
  notes: string | null
}

export type TripEvent = FlightEvent | HotelEvent | CarRentalEvent | RestaurantEvent | ActivityEvent | GroundTransportationEvent

export interface Trip {
  schemaVersion: number
  id: string
  title: string
  description: string
  destination: string
  coverImage: string
  startDate: string
  endDate: string
  timezone: string
  events: TripEvent[]
}

export interface TripSummary {
  id: string
  title: string
  description: string
  destination: string
  coverImage: string
  startDate: string
  endDate: string
}

export interface TripsIndex {
  trips: TripSummary[]
}
