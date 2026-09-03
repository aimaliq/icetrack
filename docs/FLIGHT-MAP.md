# Flight maps

Jet entries carrying an ICAO 24-bit address show where the aircraft has flown
in the last 30 days.

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
