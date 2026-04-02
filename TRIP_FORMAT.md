# BorelloTrips — Trip File Format Guide

## Overview

BorelloTrips displays travel itineraries from simple JSON files. Each trip is stored in `public/trips/{id}.json` and referenced by `public/trips/index.json`.

**How to generate a trip file using Claude.ai:**

1. Open [Claude.ai](https://claude.ai) in your browser.
2. Paste the full contents of this document into the conversation.
3. Paste your travel confirmation emails, texts, or booking details.
4. Ask Claude to generate the trip JSON:

> "Here are my travel confirmations: [paste your emails/texts here]. Using the TRIP_FORMAT schema described above, generate a complete trip JSON file. Use ISO 8601 local datetime strings. Look up coordinates for each address."

5. Copy the resulting JSON, save it as `public/trips/{your-trip-id}.json`, and add an entry to `public/trips/index.json`.

---

## File Locations

| File | Purpose |
|------|---------|
| `public/trips/index.json` | Lists all available trips (summary only) |
| `public/trips/{id}.json` | Full trip data including all events |

---

## Trip File Schema

```json
{
  "schemaVersion": 1,
  "id": "string — URL-safe slug, e.g. paris-2026",
  "title": "string — Display name, e.g. Paris Spring 2026",
  "description": "string — One or two sentence trip summary",
  "destination": "string — Primary city/country, e.g. Paris, France",
  "coverImage": "string — URL to a cover photo (Unsplash works great)",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "timezone": "string — IANA timezone, e.g. Europe/Paris",
  "events": [ ...see event types below... ]
}
```

---

## Event Types

All events share these required fields:
- `id` — unique string within the trip (e.g. `evt-001`)
- `type` — one of: `flight`, `hotel`, `car_rental`, `restaurant`, `activity`
- `confirmationNumber` — booking/confirmation code string
- `notes` — string or `null`

### Flight

```json
{
  "id": "evt-001",
  "type": "flight",
  "airline": "Air France",
  "flightNumber": "AF 065",
  "departureAirport": "SFO",
  "arrivalAirport": "CDG",
  "departureDatetime": "2026-05-01T10:30:00",
  "arrivalDatetime": "2026-05-02T08:05:00",
  "confirmationNumber": "XKQP7R",
  "notes": null
}
```

- **Airports** use IATA codes (3 letters). The map view includes coordinates for 40+ major airports. For unknown codes, no map pin is shown — this is fine.
- **Datetimes** are in local time at each respective airport (no timezone offset). Use the format `YYYY-MM-DDTHH:MM:SS`.

### Hotel

```json
{
  "id": "evt-002",
  "type": "hotel",
  "name": "Hotel Le Marais",
  "address": "12 Rue de Bretagne, 75003 Paris, France",
  "checkInDatetime": "2026-05-02T15:00:00",
  "checkOutDatetime": "2026-05-09T11:00:00",
  "confirmationNumber": "HTL-882930",
  "coordinates": { "lat": 48.8637, "lng": 2.3611 },
  "notes": null
}
```

- `coordinates` is optional but recommended so a map pin appears.
- Hotels display as multi-day events on the Calendar view.
- The Itinerary view shows continuation indicators on nights after check-in.

### Car Rental

```json
{
  "id": "evt-003",
  "type": "car_rental",
  "company": "Hertz",
  "carType": "Compact SUV",
  "pickupLocation": "CDG Airport, Terminal 2E",
  "dropoffLocation": "CDG Airport, Terminal 2E",
  "pickupDatetime": "2026-05-08T09:00:00",
  "dropoffDatetime": "2026-05-10T18:00:00",
  "pickupCoordinates": { "lat": 49.0097, "lng": 2.5479 },
  "dropoffCoordinates": { "lat": 49.0097, "lng": 2.5479 },
  "confirmationNumber": "HZ-4491022",
  "notes": null
}
```

- If pickup and dropoff coordinates are identical, only one map pin is shown.
- `pickupCoordinates` and `dropoffCoordinates` are optional.

### Restaurant

```json
{
  "id": "evt-004",
  "type": "restaurant",
  "name": "Le Comptoir du Relais",
  "address": "9 Carrefour de l'Odéon, 75006 Paris, France",
  "date": "2026-05-03",
  "time": "20:00",
  "partySize": 2,
  "confirmationNumber": "RES-77412",
  "coordinates": { "lat": 48.8515, "lng": 2.3397 },
  "notes": "Window table requested"
}
```

- `date` is `YYYY-MM-DD`, `time` is `HH:MM` in 24-hour format.
- `coordinates` is optional.

### Activity

```json
{
  "id": "evt-005",
  "type": "activity",
  "name": "Louvre Museum Guided Tour",
  "description": "Skip-the-line guided tour with an art historian.",
  "address": "Rue de Rivoli, 75001 Paris, France",
  "date": "2026-05-04",
  "startTime": "09:00",
  "durationMinutes": 180,
  "confirmationNumber": "LVR-20260504-A",
  "coordinates": { "lat": 48.8606, "lng": 2.3376 },
  "notes": "Meet guide at Pyramid entrance"
}
```

- `startTime` is `HH:MM` in 24-hour format.
- `durationMinutes` controls how the event appears as a block on the Calendar week view.
- `coordinates` is optional.

---

## Index File Schema

```json
{
  "trips": [
    {
      "id": "paris-2026",
      "title": "Paris Spring 2026",
      "description": "Two weeks in France celebrating our anniversary.",
      "destination": "Paris, France",
      "coverImage": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      "startDate": "2026-05-01",
      "endDate": "2026-05-14"
    }
  ]
}
```

Each object in `trips` corresponds to one trip file. The `id` must match the filename (`{id}.json`).

---

## Rules for Claude

When generating a trip JSON file:

1. **No financial data** — do not include prices, card numbers, or payment info.
2. **ISO 8601 local time** — datetimes use `YYYY-MM-DDTHH:MM:SS` in local time. Do not include timezone offsets in the string.
3. **Coordinates from address** — look up latitude/longitude for hotels, restaurants, and activities. For airports use the IATA code; the app has built-in coordinates for 40+ major airports.
4. **IATA codes only for airports** — use the 3-letter IATA code (SFO, CDG, NRT, etc.).
5. **Event IDs must be unique** — use sequential IDs like `evt-001`, `evt-002`, etc.
6. **All required fields must be present** — use `null` for optional string fields when unknown.
7. **Cover image** — if the user does not provide one, use a relevant Unsplash search URL like `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800` (replace the photo ID with a relevant one, or keep as-is).
8. **Timezone** — use IANA timezone identifiers (e.g. `America/Los_Angeles`, `Europe/Paris`, `Asia/Tokyo`).

---

## Adding a Trip to the App

1. Save the generated JSON as `/public/trips/{id}.json` in your BorelloTrips project.
2. Open `/public/trips/index.json` and add a summary entry:
   ```json
   {
     "id": "your-trip-id",
     "title": "Your Trip Title",
     "description": "Short description.",
     "destination": "City, Country",
     "coverImage": "https://...",
     "startDate": "YYYY-MM-DD",
     "endDate": "YYYY-MM-DD"
   }
   ```
3. Save and run `npm run dev` to see it locally, or push to `main` to deploy via GitHub Actions.

---

## Unsplash Cover Images

Use any Unsplash photo URL. Append `?w=800` for a reasonable file size. You can browse [unsplash.com](https://unsplash.com) and grab the photo ID from the URL:

```
https://images.unsplash.com/photo-{PHOTO_ID}?w=800
```

Some useful starting points:
- Paris: `photo-1502602898657-3e91760cbb34`
- Tokyo: `photo-1540959733332-eab4deabeeaf`
- New York: `photo-1496442226666-8d4d0e62e6e9`
- London: `photo-1513635269975-59663e0ac1ad`
- Rome: `photo-1515542622106-78bda8ba0e5b`
- Barcelona: `photo-1539037116277-4db20889f2d4`
- Kyoto: `photo-1528360983277-13d401cdc186`
- Hawaii: `photo-1507876466758-e54f5abd4c93`
