# Sourcing checklist

Every entry currently in `data/assets/` is marked `unverified` with a `TODO:`
placeholder source. **None of them should be treated as confirmed.** They exist
to exercise the schema and the UI, and to give you a starting worklist.

To promote an entry: find a real, dated, linkable source, replace the `TODO`
source object, then change `status` to `reported` or `verified` and re-run
`npm run validate`.

## Worklist

| Entry | What to confirm | Where to look |
| --- | --- | --- |
| `drake-boeing-767` | Tail number, current registered owner, whether still owned | [FAA N-Number Registry](https://registry.faa.gov/aircraftinquiry/) — search by owner name |
| `floyd-mayweather-gulfstream` | Exact model and registration; may be chartered rather than owned | FAA registry; note that charter ≠ ownership |
| `floyd-mayweather-bugatti-veyron` | Model variant, year, whether since sold | Auction records; dated press photos |
| `jay-z-patek-philippe` | Specific reference number and a dated sighting | Established watch media (Hodinkee, Watchonista) |
| `kim-kardashian-maybach` | Model, year, current status | Dated press coverage |

## What counts as verified

- **`verified`** — the claim is confirmed in a public registry (an FAA record
  naming the owner) or a primary source (an auction result, a court filing, a
  first-party statement).
- **`reported`** — credible, dated press reporting, but nothing authoritative.
- Anything weaker stays **`unverified`**.

## Traps

- **Charter and leasing.** A jet someone flies on is often not a jet they own.
  Aircraft are frequently registered to an LLC or a trust, not a person.
- **Staleness.** Supercars and watches change hands constantly. An article from
  2019 does not establish present-day ownership — record `retrieved` dates and
  prefer `former` when a sale is documented.
- **Aggregator loops.** Celebrity-net-worth sites cite each other in circles.
  Follow the chain to the original reporting, or do not use it.
- **Never record a location** more precise than country or state, whatever the
  source says.
