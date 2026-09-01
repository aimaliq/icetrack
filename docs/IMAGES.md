# Finding usable images

Short version: run `npx tsx scripts/fetch-images.ts --dry-run` first. It
searches Wikimedia Commons, rejects anything without a permissive licence, and
prints hand-search links for whatever it could not find.

## Why this is hard

Top-tier celebrities often have **no freely licensed photo at all**. Their
images are taken by agency photographers (Getty, Shutterstock, WireImage) whose
business is licensing them, so they are never released under Creative Commons.
A Wikipedia article with a poor snapshot, or no photo, usually means no better
free image exists.

Who tends to have good free photos:

| Likely | Unlikely |
| --- | --- |
| Athletes (federation and league photos) | A-list musicians |
| Politicians (US federal work is public domain) | Reality TV and influencer figures |
| Anyone photographed at an event by a Wikimedia volunteer | Anyone whose images are managed by a PR agency |

If you cannot find one, leaving the monogram placeholder is the correct
outcome. It is not a gap in the design.

## Which licences we can use

**Usable:** `CC0`, `Public Domain`, `CC BY`, `CC BY-SA`

**Not usable, even though they say Creative Commons:**

- **`CC BY-NC`** — non-commercial only. It would block ever monetising the
  site, and the boundary is vague enough to be a liability.
- **`CC BY-ND`** — no derivatives. Cropping a photo into a circular avatar is a
  derivative, so this rules out our own layout.
- **"Fair use" / "non-free"** on Wikipedia — those files are uploaded under a
  US doctrine that covers *Wikipedia's* use of them, not ours. Never copy an
  image marked non-free.

Attribution is mandatory for everything except CC0 and public domain, which is
why `imageCredit` exists in the schema. An image without its author and licence
recorded cannot be published.

## Where to look

**1. Wikimedia Commons** — <https://commons.wikimedia.org>

The best starting point. Fastest route: open the person's Wikipedia article and
click the infobox photo — it takes you to the Commons file page with the
licence and author already stated.

**2. Flickr, filtered** — <https://flickr.com/search>

Search the name, then set **Any license → Commercial use & mods allowed**.
Concert photographers often publish under CC BY, so this covers the gap for
musicians that Commons leaves open. Direct filtered URL:

```
https://flickr.com/search/?text=NAME&license=4,5,9,10
```

**3. Wikidata** — <https://wikidata.org>

Each person's entity has an `image (P18)` property pointing at the Commons
file. Useful for scripting.

## What not to do

- **Google Images with the licence filter.** It reports images as CC that were
  re-uploaded without permission. Always trace back to the original.
- **Hotlinking from a news site.** Bandwidth theft plus a copyright claim.
- **Assuming "it's on Wikipedia so it's free."** Wikipedia hosts non-free
  images under fair use; Commons does not. Only Commons is safe by default.

## Asset photos

For cars, jets and watches, look for the **model** rather than the specific
example: "Bugatti Veyron" on Commons has plenty of free photos, while the
individual car owned by a specific person almost never does. Make that clear in
the caption if the distinction matters.

Manufacturer press images are usually **not** free, despite being widely
reposted.
