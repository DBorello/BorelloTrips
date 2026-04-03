# Generate Trip Prompt

Paste the text below into a new Claude Code session opened in the BorelloTrips directory.

---

Read CLAUDE.md and TRIP_FORMAT.md to understand the project and schema.

I'm going to paste travel confirmation emails below. From them:

1. Generate a valid trip JSON file matching the schema in TRIP_FORMAT.md
2. Look up real coordinates (lat/lng) for every hotel, restaurant, activity, and car rental location
3. Use real IATA airport codes
4. Save the file to `public/trips/{id}.json`
5. Add an entry to `public/trips/index.json`
6. Commit and push to GitHub

Here are the confirmations:

[PASTE EMAILS HERE]
