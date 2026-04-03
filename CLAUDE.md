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
- **vite-plugin-pwa** — service worker + PWA manifest

## Dev

```bash
npm run dev -- --port 5174   # dev server (port 3000 is taken)
npm run build                 # tsc + vite build → dist/
```

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically (~30s).

- **Live site:** https://dborello.github.io/BorelloTrips/
- **Repo:** https://github.com/DBorello/BorelloTrips
- **Workflow:** `.github/workflows/deploy.yml`

## Key files

```
public/trips/index.json          ← trip index (title, dates, coverImage per trip)
public/trips/{id}.json           ← individual trip files
src/types/trip.ts                ← all TypeScript interfaces — source of truth for schema
src/utils/eventColors.ts         ← canonical event type → color mapping
src/utils/sortEvents.ts          ← chronological sort across event types
src/utils/dates.ts               ← date-fns helpers
src/components/events/EventRow.tsx   ← collapsible event card (itinerary view)
src/components/trip/MapView.tsx      ← Leaflet map, auto-fits to hotel pins on load
src/components/trip/CalendarView.tsx ← FullCalendar, multi-day hotels/cars + timed events
src/index.css                    ← global styles, FullCalendar overrides, Leaflet overrides
TRIP_FORMAT.md                   ← schema documentation for Claude.ai trip generation
CLAUDE_PROJECT_PROMPT.md         ← paste into Claude project instructions
```

## Event color system — do not change

| Type        | Hex       | Tailwind       |
|-------------|-----------|----------------|
| Flight      | `#0ea5e9` | `sky-500`      |
| Hotel       | `#8b5cf6` | `violet-500`   |
| Car Rental  | `#f59e0b` | `amber-500`    |
| Restaurant  | `#f43f5e` | `rose-500`     |
| Activity    | `#10b981` | `emerald-500`  |

These are defined in `src/utils/eventColors.ts` and used everywhere — calendar events, map pins, itinerary timeline dots, event card accents.

## Trip JSON format

Each trip file must match the schema in `src/types/trip.ts`. Key rules:

- Datetimes: ISO 8601 local time, no `Z` or offset (e.g. `2026-05-01T10:30:00`)
- `date` fields: `YYYY-MM-DD`
- `time` / `startTime` fields: `HH:MM` (24-hour)
- `coordinates`: `{ lat, lng }` — optional but needed for map pins
- `confirmationNumber`: `null` if unknown, never invented
- `notes`: always present, `null` if empty
- Events sorted chronologically in the `events` array

Adding a trip: save JSON to `public/trips/{id}.json`, add entry to `public/trips/index.json`, push.

## Architecture notes

- **HashRouter** is required — GitHub Pages can't redirect 404s to index.html on a sub-path
- **`base: '/BorelloTrips/'`** in `vite.config.ts` — must match the repo name
- **`import.meta.env.BASE_URL`** used in hooks to prefix fetch paths (requires `"types": ["vite/client"]` in tsconfig)
- Leaflet default marker icons break with Vite bundling — use custom `L.divIcon` SVG markers instead
- `@apply` in `index.css` cannot use custom Tailwind config colors — use raw hex values there
- FullCalendar and Leaflet both need their CSS imported; dark theme overrides are in `src/index.css`

## Trip generation workflow

See `TRIP_FORMAT.md` for the full schema description intended for Claude.ai.
See `CLAUDE_PROJECT_PROMPT.md` for the Claude project instructions (includes GitHub MCP push steps).

The intended workflow:
1. Paste confirmation emails into the Claude travel project
2. Claude generates a valid trip JSON (fetching schema from GitHub)
3. Push the JSON here, update `index.json`, commit and push → auto-deployed
