# Contributing to IceTrack

Thanks for helping build the database. Contributions of **corrections** are
valued as highly as new entries.

## The one rule

**Every claim carries a source.** IceTrack's only real asset is its
credibility. An entry nobody can verify is worse than no entry at all.

## Adding an asset

1. Make sure the owner exists in `data/celebrities/`. If not, add them first.
2. Create `data/assets/<id>.json`. The filename **must** match the `id` field.
3. Fill in the fields defined by `schema/asset.schema.json`.
4. Set `status` honestly:
   - `verified` — you confirmed it in a public registry or primary source
   - `reported` — credible press coverage, nothing stronger
   - `unverified` — you could not source it yet (it will be shown as a
     placeholder, not a fact)
   - `former` — they owned it, they no longer do
   - `disputed` — sources conflict
5. Run `npm run validate`.
6. Open a PR. In the description, say where your source came from.

## What we do not accept

- **Precise locations.** No addresses, moorings, hangar numbers or
  coordinates, for any category, under any circumstances. This is a hard line:
  a catalogue of what someone owns is public interest, a map to their front
  door is a safety risk. The validator rejects street addresses automatically.
- **Private identifiers.** VINs, deed numbers, policy numbers, document scans.
  Public registry identifiers such as aircraft tail numbers are fine.
- **Unsourced entries presented as fact.** Mark them `unverified` instead.
- **Private individuals.** IceTrack covers public figures whose wealth and
  lifestyle are already a matter of public reporting. Family members who are
  not themselves public figures are out of scope, and so are minors.
- **Speculation about finances.** Net worth estimates, debts, tax affairs.
  We map assets, not balance sheets.
- **Paparazzi-sourced material** or anything obtained through hacking, leaks
  of private data, or trespass.

## Finding good sources

| Category | Where to look |
| --- | --- |
| Jets | [FAA N-Number Registry](https://registry.faa.gov/aircraftinquiry/) (US), national civil aviation registries |
| Yachts | National vessel registries, maritime trade press |
| Cars | Auction house records (RM Sotheby's, Barrett-Jackson), marque press |
| Watches | Established watch media with dated photographs |
| Estates | Property trade press — **the transaction, never the address** |

A source should be **dated**, **linkable**, and **specific**. "Everyone knows"
is not a source. An aggregator quoting another aggregator is not a source.

## Corrections and removals

Open an issue. If you are the subject of an entry or represent them, say so —
we will review promptly, and mark the entry `disputed` while we do.

## Code contributions

Standard flow: fork, branch, `npm run build` and `npm run validate` before
opening a PR. Keep the design language consistent — restrained, precise, dark.
