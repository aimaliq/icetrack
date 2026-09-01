<div align="center">

# ❄ IceTrack

**Mapping VIP premium assets**

An open source, community-sourced database of the luxury assets owned by the
world's most visible public figures — jets, supercars, watches, yachts and
estates. Every entry carries its source.

</div>

---

## Why

The culture already tracks this. Every sneaker forum, every car page, every
watch account is quietly cataloguing who owns what. IceTrack is the version
that shows its work: structured, open, and sourced.

## Status

Early. The data layer, schema, validator and web app are in place. The dataset
is intentionally small and **most entries are unsourced placeholders** — see
[Sourcing](#sourcing) before treating anything here as fact.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS**
- Data as plain JSON files in `data/`, validated against JSON Schema

No database. Contributions are pull requests against JSON files, which keeps
review and provenance in Git history. A registered-user editing flow with a
moderation queue is planned — see [Roadmap](#roadmap).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run validate   # check every data file against schema + editorial rules
npm run build      # production build
```

## Project layout

```
data/
  celebrities/     one JSON file per public figure  (id.json)
  assets/          one JSON file per asset          (id.json)
schema/
  celebrity.schema.json
  asset.schema.json
scripts/
  validate.ts      schema + editorial rule enforcement
src/
  app/             routes (home, celebrities, assets, about)
  components/      shared UI
  lib/             data access, types, category metadata
```

## Data model

An asset links to a celebrity by `ownerId` and must declare a `status`:

| Status | Meaning |
| --- | --- |
| `verified` | Confirmed in a public registry or primary source |
| `reported` | Credible press reporting only |
| `unverified` | Placeholder, not yet sourced — **not a factual claim** |
| `former` | Previously owned, since sold |
| `disputed` | Sources conflict, or the subject contests it |

Minimal example (`data/assets/example-jet.json`):

```json
{
  "id": "example-jet",
  "ownerId": "drake",
  "category": "jet",
  "name": "Gulfstream G650",
  "status": "reported",
  "confidence": "medium",
  "sources": [
    {
      "title": "Article title",
      "url": "https://example.com/article",
      "publisher": "Publisher",
      "retrieved": "2026-09-01"
    }
  ],
  "updatedAt": "2026-09-01"
}
```

Categories: `jet`, `car`, `watch`, `yacht`, `estate`, `jewelry`.

## Sourcing

These rules are enforced by `npm run validate` and are not negotiable — they
are what separates a database from a rumour mill.

1. **Every claim carries a source.** An entry marked `verified` or `reported`
   must have at least one real, linkable source. Entries whose only source is a
   `TODO:` placeholder must stay `unverified`, and the UI labels them as
   research placeholders rather than facts.
2. **Public information only.** We catalogue what public registries and the
   press have already published about public figures.
3. **No precise locations — ever.** No addresses, moorings, hangars or
   coordinates. Country or state is the finest granularity stored. The
   validator rejects anything that looks like a street address.
4. **No private identifiers.** Public registry IDs (aircraft tail numbers) are
   fine; VINs, deeds and document numbers are not.

Useful public sources: the [FAA N-Number Registry](https://registry.faa.gov/aircraftinquiry/)
for US-registered aircraft, national vessel registries, and auction house
records.

## Contributing

1. Fork and create a branch.
2. Add or edit a JSON file in `data/`. The filename must match the `id`.
3. Include at least one real source.
4. Run `npm run validate`.
5. Open a pull request describing your source.

Corrections are as welcome as additions. If you are a subject or a
representative and an entry is inaccurate, open an issue — documented
corrections are applied promptly and contested entries are marked `disputed`
while under review.

## Roadmap

- [ ] Search and filtering across the dataset
- [ ] Contributor accounts with a web editing form (no Git required)
- [ ] Moderation queue + trusted-contributor role
- [ ] Revision history per entry
- [ ] Images with clear licensing
- [ ] Public JSON API

## Disclaimer

IceTrack aggregates publicly reported information and is provided for
informational purposes only. Entries are community-contributed and may be
incomplete, outdated or inaccurate. Valuations are press estimates, not
appraisals. IceTrack is not affiliated with, endorsed by, or representative of
any individual or brand listed.

## License

Code: MIT. Data: CC BY-SA 4.0.
