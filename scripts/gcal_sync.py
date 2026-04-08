#!/usr/bin/env python3
"""
BorelloTrips → Google Calendar sync

Usage:
  python scripts/gcal_sync.py sync                  # sync all trips
  python scripts/gcal_sync.py sync --trip ny-2026   # sync one trip
  python scripts/gcal_sync.py delete                # delete all BorelloTrips events
  python scripts/gcal_sync.py delete --trip ny-2026 # delete one trip's events

Setup:
  1. Go to https://console.cloud.google.com
  2. Create a project → Enable "Google Calendar API"
  3. Create OAuth 2.0 credentials (Desktop app) → download as scripts/gcal_credentials.json
  4. pip install google-auth google-auth-oauthlib google-api-python-client
  5. Run once — a browser window will open for auth, token is cached in scripts/gcal_token.json
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime, timedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ── Paths ────────────────────────────────────────────────────────────────────

ROOT        = Path(__file__).parent.parent
TRIPS_DIR   = ROOT / 'public' / 'trips'
TOKEN_FILE  = Path(__file__).parent / 'gcal_token.json'
CREDS_FILE  = Path(__file__).parent / 'gcal_credentials.json'

SCOPES     = ['https://www.googleapis.com/auth/calendar']
SOURCE_TAG = 'borellotrips'   # marker written to every event's extendedProperties

# ── Auth ─────────────────────────────────────────────────────────────────────

def get_service():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDS_FILE.exists():
                sys.exit(
                    f"Missing {CREDS_FILE}\n"
                    "Download OAuth 2.0 Desktop credentials from Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())
    return build('calendar', 'v3', credentials=creds)

# ── Trip data ─────────────────────────────────────────────────────────────────

def load_trips(trip_filter=None):
    index = json.loads((TRIPS_DIR / 'index.json').read_text())
    trips = []
    for entry in index['trips']:
        if trip_filter and entry['id'] != trip_filter:
            continue
        path = TRIPS_DIR / f"{entry['id']}.json"
        if path.exists():
            trips.append(json.loads(path.read_text()))
    return trips

# ── Event conversion ──────────────────────────────────────────────────────────

def dt(s, tzid):
    return {'dateTime': s if ':' in s[10:] else s + ':00', 'timeZone': tzid}

def shifted(dt_str, minutes):
    d = datetime.fromisoformat(dt_str)
    return (d + timedelta(minutes=minutes)).strftime('%Y-%m-%dT%H:%M:%S')

def description(*parts):
    return '\n'.join(p for p in parts if p)

def tag(event_id, trip_id):
    return {'extendedProperties': {'private': {
        'source':          SOURCE_TAG,
        'borelloTripsId':  event_id,
        'borelloTripId':   trip_id,
    }}}

def to_gcal(event, trip):
    tzid     = trip.get('timezone', 'America/Chicago')
    trip_id  = trip['id']
    eid      = event['id']
    etype    = event['type']
    conf     = event.get('confirmationNumber')
    conf_str = f"Confirmation: {conf}" if conf else None

    if etype == 'flight':
        f = event
        return {**tag(eid, trip_id),
            'summary':     f"✈ {f['departureAirport']} → {f['arrivalAirport']} ({f['flightNumber']})",
            'start':       dt(f['departureDatetime'], tzid),
            'end':         dt(f['arrivalDatetime'], tzid),
            'location':    f['departureAirport'],
            'description': description(f['airline'], f.get('notes'), conf_str),
        }

    if etype == 'hotel':
        h = event
        return {**tag(eid, trip_id),
            'summary':     f"🏨 {h['name']}",
            'start':       dt(h['checkInDatetime'], tzid),
            'end':         dt(h['checkOutDatetime'], tzid),
            'location':    h.get('address', ''),
            'description': description(h.get('notes'), conf_str),
        }

    if etype == 'car_rental':
        c = event
        return {**tag(eid, trip_id),
            'summary':     f"🚗 {c['company']} Rental",
            'start':       dt(c['pickupDatetime'], tzid),
            'end':         dt(c['dropoffDatetime'], tzid),
            'location':    c.get('pickupLocation', ''),
            'description': description(c.get('carType'), c.get('notes'), conf_str),
        }

    if etype == 'restaurant':
        r = event
        start = f"{r['date']}T{r['time']}:00"
        return {**tag(eid, trip_id),
            'summary':     f"🍽 {r['name']}",
            'start':       dt(start, tzid),
            'end':         dt(shifted(start, 120), tzid),
            'location':    r.get('address', ''),
            'description': description(f"Party of {r['partySize']}", r.get('notes'), conf_str),
        }

    if etype == 'activity':
        a = event
        start = f"{a['date']}T{a['startTime']}:00"
        return {**tag(eid, trip_id),
            'summary':     f"🎯 {a['name']}",
            'start':       dt(start, tzid),
            'end':         dt(shifted(start, a['durationMinutes']), tzid),
            'location':    a.get('address', ''),
            'description': description(a.get('description'), a.get('notes'), conf_str),
        }

    if etype == 'ground_transportation':
        g = event
        end = g.get('dropoffDatetime') or shifted(g['pickupDatetime'], 60)
        return {**tag(eid, trip_id),
            'summary':     f"🚌 {g['company']} · {g.get('pickupLocation', '')} → {g.get('dropoffLocation', '')}",
            'start':       dt(g['pickupDatetime'], tzid),
            'end':         dt(end, tzid),
            'location':    g.get('pickupLocation', ''),
            'description': description(g.get('serviceType'), g.get('notes'), conf_str),
        }

    return None

# ── Google Calendar queries ───────────────────────────────────────────────────

def fetch_existing(service, calendar_id):
    """Returns {borelloTripsId → gcal_event_id} for all tagged events."""
    existing = {}
    page_token = None
    while True:
        resp = service.events().list(
            calendarId=calendar_id,
            privateExtendedProperty=f'source={SOURCE_TAG}',
            pageToken=page_token,
            maxResults=250,
            showDeleted=False,
        ).execute()
        for item in resp.get('items', []):
            btid = item.get('extendedProperties', {}).get('private', {}).get('borelloTripsId')
            if btid:
                existing[btid] = item['id']
        page_token = resp.get('nextPageToken')
        if not page_token:
            break
    return existing

# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_sync(service, calendar_id, trip_filter):
    trips    = load_trips(trip_filter)
    existing = fetch_existing(service, calendar_id)
    created  = updated = errors = 0

    for trip in trips:
        print(f"\n📅  {trip['title']}")
        for event in trip.get('events', []):
            body = to_gcal(event, trip)
            if not body:
                continue
            eid = event['id']
            try:
                if eid in existing:
                    service.events().update(
                        calendarId=calendar_id,
                        eventId=existing[eid],
                        body=body,
                    ).execute()
                    print(f"  ↺  {body['summary']}")
                    updated += 1
                else:
                    service.events().insert(
                        calendarId=calendar_id,
                        body=body,
                    ).execute()
                    print(f"  +  {body['summary']}")
                    created += 1
            except HttpError as e:
                print(f"  ✗  {body['summary']}: {e}")
                errors += 1

    print(f"\n✓  {created} created · {updated} updated · {errors} errors")


def cmd_delete(service, calendar_id, trip_filter):
    existing = fetch_existing(service, calendar_id)

    if trip_filter:
        trips    = load_trips(trip_filter)
        keep_ids = {e['id'] for t in trips for e in t.get('events', [])}
        to_delete = {k: v for k, v in existing.items() if k in keep_ids}
    else:
        to_delete = existing

    if not to_delete:
        print("Nothing to delete.")
        return

    deleted = errors = 0
    for btid, gcal_id in to_delete.items():
        try:
            service.events().delete(calendarId=calendar_id, eventId=gcal_id).execute()
            print(f"  ✗  {btid}")
            deleted += 1
        except HttpError as e:
            print(f"  !  {btid}: {e}")
            errors += 1

    print(f"\n✓  {deleted} deleted · {errors} errors")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='BorelloTrips ↔ Google Calendar sync',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  python scripts/gcal_sync.py sync
  python scripts/gcal_sync.py sync --trip ny-2026
  python scripts/gcal_sync.py delete --trip las-vegas-2026
  python scripts/gcal_sync.py delete
        """
    )
    parser.add_argument('command', choices=['sync', 'delete'])
    parser.add_argument('--trip',     help='Limit to one trip ID (e.g. ny-2026)')
    parser.add_argument('--calendar', default='primary', help='Google Calendar ID (default: primary)')
    args = parser.parse_args()

    service = get_service()

    if args.command == 'sync':
        cmd_sync(service, args.calendar, args.trip)
    elif args.command == 'delete':
        cmd_delete(service, args.calendar, args.trip)

if __name__ == '__main__':
    main()
