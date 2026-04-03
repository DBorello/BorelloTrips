# Generate Trip Prompt

Copy everything from the horizontal rule below and paste it as the opening message
in a brand new Claude Code session. Then replace [PASTE EMAILS HERE] with your confirmations.

---

I need you to generate a trip file for the BorelloTrips travel app and push it to GitHub.

## Project overview

BorelloTrips is a static React PWA that displays travel itineraries loaded from JSON files.
There is no backend. Trips are stored as individual JSON files in the repo.

- **GitHub repo:** `DBorello/BorelloTrips` (already cloned at `/home/vmuser/BorelloTrips`)
- **Branch:** `main`
- **Live site:** https://dborello.github.io/BorelloTrips/
- **GitHub Actions** automatically builds and deploys on every push to `main` (~30 seconds)

## Your tasks

1. Read the confirmation emails I paste below
2. Generate a valid trip JSON file
3. Write it to `/home/vmuser/BorelloTrips/public/trips/{id}.json`
4. Update `/home/vmuser/BorelloTrips/public/trips/index.json` to add the new trip (do not remove existing entries)
5. Commit both files and push to `main`
6. Confirm with the live URL: `https://dborello.github.io/BorelloTrips/#/trip/{id}`

---

## Current index.json

Write this back exactly, with the new trip appended to the `trips` array:

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
    },
    {
      "id": "tokyo-2025",
      "title": "Tokyo Adventure 2025",
      "description": "Exploring Japan's capital — temples, ramen, and neon lights.",
      "destination": "Tokyo, Japan",
      "coverImage": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      "startDate": "2025-10-05",
      "endDate": "2025-10-18"
    },
    {
      "id": "costa-rica-2026",
      "title": "Costa Rica 2026",
      "description": "Rainforest and Pacific coast — Arenal Volcano, Nayara Tented Camp, and Four Seasons Peninsula Papagayo.",
      "destination": "Costa Rica",
      "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "startDate": "2026-04-19",
      "endDate": "2026-04-26"
    }
  ]
}
```

---

## Trip file schema

### Top-level fields

```json
{
  "schemaVersion": 1,
  "id": "rome-2026",
  "title": "Rome Summer 2026",
  "description": "One or two sentence summary of the trip.",
  "destination": "Rome, Italy",
  "coverImage": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800",
  "startDate": "2026-07-01",
  "endDate": "2026-07-10",
  "timezone": "Europe/Rome",
  "events": []
}
```

### Event types

All events have: `id` (sequential: `evt-001`, `evt-002`…), `type`, `confirmationNumber`, `notes`.

**flight**
```json
{
  "id": "evt-001",
  "type": "flight",
  "airline": "United Airlines",
  "flightNumber": "UA 988",
  "departureAirport": "SFO",
  "arrivalAirport": "FCO",
  "departureDatetime": "2026-07-01T09:15:00",
  "arrivalDatetime": "2026-07-02T07:30:00",
  "confirmationNumber": "ABC123",
  "notes": null
}
```
- `departureAirport` / `arrivalAirport` are IATA 3-letter codes
- Datetimes are **local time at each airport** — no Z, no UTC offset

**hotel**
```json
{
  "id": "evt-002",
  "type": "hotel",
  "name": "Hotel de Russie",
  "address": "Via del Babuino 9, 00187 Rome, Italy",
  "checkInDatetime": "2026-07-02T15:00:00",
  "checkOutDatetime": "2026-07-10T11:00:00",
  "confirmationNumber": "HTL-99123",
  "coordinates": { "lat": 41.9097, "lng": 12.4789 },
  "notes": null
}
```

**car_rental**
```json
{
  "id": "evt-003",
  "type": "car_rental",
  "company": "Hertz",
  "carType": "Compact",
  "pickupLocation": "Rome Fiumicino Airport",
  "dropoffLocation": "Rome Fiumicino Airport",
  "pickupDatetime": "2026-07-05T10:00:00",
  "dropoffDatetime": "2026-07-07T18:00:00",
  "pickupCoordinates": { "lat": 41.8003, "lng": 12.2389 },
  "dropoffCoordinates": { "lat": 41.8003, "lng": 12.2389 },
  "confirmationNumber": "HZ-55512",
  "notes": null
}
```

**restaurant**
```json
{
  "id": "evt-004",
  "type": "restaurant",
  "name": "La Pergola",
  "address": "Via Alberto Cadlolo 101, 00136 Rome, Italy",
  "date": "2026-07-04",
  "time": "20:00",
  "partySize": 2,
  "confirmationNumber": "RST-7712",
  "coordinates": { "lat": 41.9127, "lng": 12.4502 },
  "notes": null
}
```
- `date` is `YYYY-MM-DD`, `time` is `HH:MM` 24-hour local time

**activity**
```json
{
  "id": "evt-005",
  "type": "activity",
  "name": "Colosseum Guided Tour",
  "description": "Skip-the-line tour of the Colosseum and Roman Forum.",
  "address": "Piazza del Colosseo 1, 00184 Rome, Italy",
  "date": "2026-07-03",
  "startTime": "09:00",
  "durationMinutes": 180,
  "confirmationNumber": "COL-2026",
  "coordinates": { "lat": 41.8902, "lng": 12.4922 },
  "notes": null
}
```
- `startTime` is `HH:MM` 24-hour local time

**ground_transportation**
```json
{
  "id": "evt-006",
  "type": "ground_transportation",
  "company": "Rome Limo Service",
  "serviceType": "Private Car",
  "pickupLocation": "Rome Fiumicino Airport, Arrivals Hall",
  "dropoffLocation": "Hotel de Russie, Via del Babuino 9",
  "pickupDatetime": "2026-07-02T08:00:00",
  "dropoffDatetime": null,
  "pickupCoordinates": { "lat": 41.8003, "lng": 12.2389 },
  "dropoffCoordinates": { "lat": 41.9097, "lng": 12.4789 },
  "confirmationNumber": "LIM-4421",
  "notes": null
}
```
- Use for limos, private cars, shuttles, transfers
- `dropoffDatetime` may be `null` if arrival time is unknown
- `serviceType` examples: `"Private Car"`, `"Shared Shuttle"`, `"Limo"`, `"Airport Transfer"`

---

## Rules

- **No financial data** — no prices, card numbers, payment info
- **Local datetimes** — never include Z or UTC offsets in datetime strings
- **Coordinates** — look up real lat/lng for every hotel, restaurant, activity, and car/ground rental
- **confirmationNumber** — use `null` if not in the confirmations (never invent one)
- **notes** — always include the field; use `null` if nothing to add
- **Sort events** chronologically in the `events` array
- **id** must be URL-safe lowercase with hyphens only (e.g. `rome-july-2026`)

## Cover image

Format: `https://images.unsplash.com/photo-{ID}?w=800`

Useful photo IDs:
- Paris: `1502602898657-3e91760cbb34`
- Tokyo: `1540959733332-eab4deabeeaf`
- New York: `1496442226666-8d4d0e62e6e9`
- London: `1513635269975-59663e0ac1ad`
- Rome: `1515542622106-78bda8ba0e5b`
- Barcelona: `1539037116277-4db20889f2d4`
- Kyoto: `1528360983277-13d401cdc186`
- Hawaii: `1507876466758-e54f5abd4c93`
- Amalfi Coast: `1534308143923-0b52d9e3c268`
- Greece: `1533105079780-92b9be4f5e63`
- Costa Rica: `1507525428034-b723cf961d3e`

## Commit

```bash
git -C /home/vmuser/BorelloTrips add public/trips/{id}.json public/trips/index.json
git -C /home/vmuser/BorelloTrips commit -m "Add {Trip Title} trip"
git -C /home/vmuser/BorelloTrips push
```

---

## Confirmation emails

[PASTE EMAILS HERE]
