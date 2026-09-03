# Flight maps

**Paused.** The code is all here and works; what does not work is collecting
the data inside a serverless function. Read the last section before picking
this up again.

The intent: jet entries carrying an ICAO 24-bit address show where the
aircraft has flown in the last 30 days.

## Where the data comes from

[OpenSky Network](https://opensky-network.org), which aggregates ADS-B: the
position broadcasts aircraft transmit continuously and in the clear, picked up
by volunteer receivers. Nothing here is private — it is what the aeroplane
itself announces to anyone listening.

**OpenSky is licensed for non-commercial use only.** IceTrack carries no
advertising and sells nothing, so it qualifies. Putting either on the site
means either dropping the maps or agreeing terms with OpenSky first. This is
the constraint most likely to be forgotten later.

## Setup

1. Register at <https://opensky-network.org> and create an API client. Basic
   auth was retired in March 2026, so this needs the OAuth2 client credentials.
2. Set three variables, locally in `.env.local` and in the Vercel project:

   ```
   OPENSKY_CLIENT_ID=...
   OPENSKY_CLIENT_SECRET=...
   CRON_SECRET=...            # any long random string
   ```

   The collector also needs `SUPABASE_SERVICE_ROLE_KEY`, which must be set in
   Vercel only — never in `.env.local`, never with a `NEXT_PUBLIC_` prefix.
3. Apply `supabase/migrations/0010_flights.sql`.
4. Apply `supabase/backfill_icao24.sql` to fill in the nine aircraft already
   in the database.

`vercel.json` runs the collector at 04:00 UTC daily.

## Why a scheduled job and not a live query

OpenSky's rate limits are far below what per-visitor queries would need, and
its flight index is built by an overnight batch, so the last day or so is never
available however often you ask. The collector writes into `flights` and pages
read from there.

## The ICAO address

ADS-B carries a 24-bit transponder address, not the tail number painted on the
aircraft. US registrations encode it arithmetically, but the FAA scheme is
fiddly enough that deriving it in code was abandoned in favour of reading it
off a public tracker: a conversion bug would map the wrong aircraft, which is
worse than no map.

It is a field on the jet form. To find one, search the tail number at
<https://globe.adsbexchange.com> and read the six-character hex code.

## Aircraft that will not appear

- Those enrolled in the FAA's privacy programme, which suppresses them from
  most feeds.
- Those flying outside the volunteer receiver network's coverage — much of the
  ocean, and parts of Africa and central Asia.
- Anything that has not flown in the last 30 days.

An entry with no flights simply omits the map.

## Retention

The site shows 30 days, which is also as long as OpenSky keeps tracks. The
collector prunes anything older on every run. Keeping more would build a
longer record of where identified people have been than the source itself
retains, which is not the point of this.

## Why this is paused

Two things stopped it, and neither is a bug to fix in this repository.

**Collection does not fit in a function invocation.** Requests to OpenSky from
Vercel took around eighteen seconds each, against one to five from a desktop on
a domestic connection. A Hobby function is killed at sixty. Even reduced to a
single aircraft per run, a run managed two calls and wrote nothing.

**OpenSky's own map cannot be embedded.** `map.opensky-network.org` sends
`X-Frame-Options: DENY`, and visiting it asks for a human verification check,
so it is no use as an iframe or as a link.

### Other ADS-B sources, checked September 2026

OpenSky is not the only open network, but it is the only free one that serves
*history*. The community aggregators are fast — adsb.fi answered in 109ms,
against roughly eighteen seconds from Vercel to OpenSky — and they are fast
because they only hold what is in the air right now.

| Source | Result |
| --- | --- |
| `opendata.adsb.fi` | 200, ~110ms, no key. Live positions only, no tracks |
| `api.adsb.lol` | 403 without a key; free key requires feeding data |
| `api.airplanes.live` | 403 without a key |
| ADS-B Exchange | Requires feeding data, or a paid plan |

A live-only source would support a different feature — "in the air now",
updated on page load, which the response times make entirely practical — but
not "where this aircraft has been", which is what was being built.

### What a working version would need

- A collector that runs somewhere without a per-request time limit: a GitHub
  Action on a schedule, a small VPS, or a Supabase edge function with a longer
  budget. It writes to the same `flights` table and nothing else changes.
- Or a paid flight data API with a normal request/response shape, which removes
  the batching problem but costs money and, for most providers, forbids
  redistribution.

### What is already in place

- `specs.icao24` on the jet form, filled in for nine aircraft
- `flights` table, RLS and pruning — migrations 0010 and 0011
- `src/lib/flights/` — OpenSky client and reader
- `src/components/FlightMap.tsx` — Leaflet map, tested and working
- `src/app/api/flights/collect/` — the collector, with `?probe=1` and `?only=`

To switch it back on, set `trackable` in `src/app/assets/[id]/page.tsx` back to
the ICAO check and restore the cron entry in `vercel.json`.
