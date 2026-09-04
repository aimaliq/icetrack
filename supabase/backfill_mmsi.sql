-- AIS identifiers for the yachts, so their pages can show the ship map.
--
-- MMSI is a public registry identifier, the maritime sibling of an aircraft
-- tail number - explicitly allowed by the project's location policy. Each one
-- below was looked up against current tracker registries (VesselFinder,
-- MarineTraffic, MyShipTracking), not derived. Eclipse and Solaris carry
-- Cook Islands numbers (518...) from their post-2022 reflagging; the older
-- Cayman/Bermuda MMSIs still circulating for Eclipse are stale.
--
-- Rising Sun gets its number too - it is a fact about the vessel - but the
-- page hides tracking on `former` entries, so nothing is shown for it.
--
-- Tecnomar Lamborghini 63 is left out: a dayboat with no meaningful AIS
-- registry presence.

update assets set specs = coalesce(specs, '{}'::jsonb) || jsonb_build_object('mmsi', mm.mmsi)
from (values
  ('roman-abramovich-solaris',   '518999189'),
  ('roman-abramovich-eclipse',   '518999664'),
  ('jeff-bezos-koru',            '319225400'),
  ('larry-ellison-musashi',      '319032600'),
  ('larry-ellison-rising-sun',   '319011000'),
  ('mohammed-bin-salman-serene', '319021900'),
  ('mohammed-bin-rashid-dubai',  '470886000'),
  ('sheikh-mansour-a-plus',      '319054000'),
  ('diddy-maraya',               '319192000')
) as mm(slug, mmsi)
where assets.slug = mm.slug
  and (assets.specs ->> 'mmsi') is null;
