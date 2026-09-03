# Live tracking

Jet entries carrying an ICAO 24-bit transponder address embed a live map from
[adsb.fi](https://globe.adsb.fi), which shows the aircraft in flight or its
last known position.

That is the whole feature. `src/components/LiveTrackEmbed.tsx` is an iframe.

## Adding an aircraft

Put the six-character hex address in the jet form's **ICAO hex** field. Find it
by searching the tail number at <https://globe.adsbexchange.com> or
<https://globe.adsb.fi>. Nine aircraft already have one.

Deriving the address from a US tail number is possible in principle — the FAA
scheme is arithmetic — but four attempts at it all produced wrong addresses,
and a wrong address maps the wrong aircraft. Reading it off a tracker takes a
few seconds and cannot be silently wrong.

## What was tried first, and why it is gone

The original plan was to collect ADS-B history from OpenSky and draw it with
Leaflet. That is all removed. It did not work, for reasons worth recording
before anyone proposes it again:

- **Collection does not fit in a serverless invocation.** Requests to OpenSky
  from Vercel took around eighteen seconds each, against one to five from a
  desktop. A Hobby function is killed at sixty. Cut down to one aircraft per
  run it still managed two calls and wrote nothing.
- **OpenSky's own map cannot be embedded** — `X-Frame-Options: DENY`, plus a
  human verification check.
- **The free aggregators have no history.** adsb.fi answers in about 110ms
  because it holds only what is airborne now. adsb.lol and airplanes.live
  return 403 without a key, and the key requires feeding data to the network.

So history needs a collector running somewhere without a per-request time
limit — a scheduled GitHub Action, or a small box — writing into a table this
site reads. That is a different piece of infrastructure, not a change to this
code. `git log` has the removed implementation if it is ever wanted back.

## Reading the map

adsb.fi aggregates ADS-B: the position broadcasts aircraft transmit in the
clear, picked up by volunteer receivers. Nothing there is private data.

Aircraft enrolled in the FAA's privacy programme, or flying outside receiver
coverage, will not appear.
