# BorelloTrips

Static PWA for visualizing family travel itineraries. No backend — all data is JSON files in `public/trips/`.

## Stack

- **Vite + React + TypeScript** — strict mode, `noUnusedLocals`, `noUnusedParameters`
- **Tailwind CSS v3** — custom `ink` color scale and `font-display` (Cormorant Garamond)
- **FullCalendar** — `@fullcalendar/react`, daygrid + timegrid plugins
- **Leaflet + react-leaflet** — map view with custom SVG markers
- **react-router-dom** — HashRouter (required for GitHub Pages)
- **date-fns** — all date formatting and manipulation
- **lucide-react** — icons
- **vite-plugin-pwa** — service worker + PWA manifest, auto-activates on update

## Dev

```bash
npm run dev -- --port 5174   # dev server (port 3000 is taken)
npm run build                 # tsc + vite build → dist/
```

## Google Calendar sync

After adding or updating any trip events, sync to Google Calendar:

```bash
python scripts/gcal_sync.py sync                  # sync all trips
python scripts/gcal_sync.py sync --trip ny-2026   # sync one trip
python scripts/gcal_sync.py delete --trip ny-2026 # remove one trip's events
python scripts/gcal_sync.py delete                # remove all BorelloTrips events
```

- Credentials: `scripts/gcal_credentials.json` (OAuth Desktop app, download from Google Cloud Console — gitignored)
- Token: `scripts/gcal_token.json` (auto-generated on first run — gitignored)
- Dependencies: `pip install -r scripts/requirements.txt`
- Events are tagged with `extendedProperties.private.source=borellotrips` so sync is idempotent — safe to run repeatedly
- **Always run `gcal_sync.py sync` after committing trip changes.**

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically (~30s).

- **Live site:** https://dborello.github.io/BorelloTrips/
- **Repo:** https://github.com/DBorello/BorelloTrips
- **Workflow:** `.github/workflows/deploy.yml`

## Key files

```
public/trips/index.json               ← master trip list (summary per trip)
public/trips/{id}.json                ← one file per trip, all events
src/types/trip.ts                     ← TypeScript interfaces — source of truth for schema
src/utils/eventColors.ts              ← canonical event type → color/label mapping
src/utils/sortEvents.ts               ← chronological sort across all event types
src/utils/dates.ts                    ← date-fns helpers
src/components/events/EventRow.tsx    ← collapsible event card (itinerary view)
src/components/trip/MapView.tsx       ← Leaflet map, auto-fits to hotel pins on load
src/components/trip/CalendarView.tsx  ← FullCalendar, multi-day hotels/cars + timed events
src/components/trip/EventPopover.tsx  ← click-on-event detail popup in calendar view
src/index.css                         ← global styles, FullCalendar overrides, Leaflet overrides
TRIP_FORMAT.md                        ← schema docs for Claude.ai trip generation
CLAUDE_PROJECT_PROMPT.md             ← paste into Claude project instructions (GitHub MCP)
GENERATE_TRIP_PROMPT.md              ← paste into a new Claude Code session to generate a trip
```

## Event color system — do not change

| Type                   | Hex       | Tailwind       |
|------------------------|-----------|----------------|
| Flight                 | `#0ea5e9` | `sky-500`      |
| Hotel                  | `#8b5cf6` | `violet-500`   |
| Car Rental             | `#f59e0b` | `amber-500`    |
| Restaurant             | `#f43f5e` | `rose-500`     |
| Activity               | `#10b981` | `emerald-500`  |
| Ground Transportation  | `#f97316` | `orange-500`   |

Defined in `src/utils/eventColors.ts`, used everywhere: calendar events, map pins, itinerary timeline dots, event card accents.

## Event types

Six types are supported. All share `id`, `type`, `confirmationNumber`, `notes`.

| Type                  | Key fields |
|-----------------------|------------|
| `flight`              | `airline`, `flightNumber`, `departureAirport`, `arrivalAirport`, `departureDatetime`, `arrivalDatetime` |
| `hotel`               | `name`, `address`, `checkInDatetime`, `checkOutDatetime`, `coordinates?` |
| `car_rental`          | `company`, `carType`, `pickupLocation`, `dropoffLocation`, `pickupDatetime`, `dropoffDatetime`, `pickupCoordinates?`, `dropoffCoordinates?` |
| `restaurant`          | `name`, `address`, `date`, `time`, `partySize`, `coordinates?` |
| `activity`            | `name`, `description`, `address`, `date`, `startTime`, `durationMinutes`, `coordinates?` |
| `ground_transportation` | `company`, `serviceType`, `pickupLocation`, `dropoffLocation`, `pickupDatetime`, `dropoffDatetime`, `pickupCoordinates?`, `dropoffCoordinates?` |

Full interfaces in `src/types/trip.ts`.

## Trip JSON format rules

- Datetimes: ISO 8601 local time, no `Z` or offset (`2026-05-01T10:30:00`)
- `date` fields: `YYYY-MM-DD`
- `time` / `startTime` fields: `HH:MM` (24-hour)
- `coordinates`: `{ lat, lng }` — optional but needed for map pins
- `confirmationNumber`: `null` if unknown, never invented
- `notes`: always present, `null` if empty
- Events sorted chronologically in the `events` array

Adding a trip: save JSON to `public/trips/{id}.json`, add entry to `public/trips/index.json`, push.

## Current trips

| ID | Title | Dates |
|----|-------|-------|
| `costa-rica-2026` | Costa Rica 2026 | Apr 19–26, 2026 |

## Architecture notes

- **HashRouter** is required — GitHub Pages can't redirect 404s to index.html on a sub-path
- **`base: '/BorelloTrips/'`** in `vite.config.ts` — must match the repo name
- **`import.meta.env.BASE_URL`** used in hooks to prefix fetch paths (requires `"types": ["vite/client"]` in tsconfig)
- Leaflet default marker icons break with Vite bundling — use custom `L.divIcon` SVG markers instead
- `@apply` in `index.css` cannot use custom Tailwind config colors — use raw hex values there
- FullCalendar and Leaflet both need their CSS imported; dark theme overrides live in `src/index.css`
- Service worker uses `registerType: 'autoUpdate'` and force-activates via `src/main.tsx` so updates apply immediately without requiring a page reload

## Trip generation workflow

See `TRIP_FORMAT.md` for the full schema description.
See `GENERATE_TRIP_PROMPT.md` for the self-contained prompt to paste into a new Claude Code session.
See `CLAUDE_PROJECT_PROMPT.md` for the Claude.ai project instructions (GitHub MCP approach).
