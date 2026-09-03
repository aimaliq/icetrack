-- Seed: billionaires and their documented assets.
--
-- All five are `business`, whatever the money came from.
--
-- This group is the best-documented in the database so far: superyachts carry
-- IMO numbers and aircraft carry tail numbers, which are public registry
-- identifiers and are recorded here.
--
-- Everything is still `reported`, not `verified`. The sources cite those
-- registry numbers but are not themselves the registry, and `verified` in this
-- project means a registry or primary source consulted directly. Promoting
-- these means someone looking the IMO up at the flag state, or the tail number
-- in the FAA database — which is exactly the kind of contribution the status
-- is meant to invite.
--
-- Two former holdings are recorded as such: Rising Sun was sold to David
-- Geffen in 2010, and Musashi commissioned as its deliberately smaller
-- replacement. Selling something is part of its record.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('roman-abramovich', 'Roman Abramovich', 'Roman Arkadyevich Abramovich', 'business', 'Russia', 1966,
   'Russian businessman and investor, former owner of Chelsea Football Club.',
   'https://en.wikipedia.org/wiki/Roman_Abramovich'),

  ('elon-musk', 'Elon Musk', 'Elon Reeve Musk', 'business', 'United States', 1971,
   'Businessman, chief executive of Tesla and SpaceX.',
   'https://en.wikipedia.org/wiki/Elon_Musk'),

  ('jeff-bezos', 'Jeff Bezos', 'Jeffrey Preston Bezos', 'business', 'United States', 1964,
   'American businessman, founder and executive chairman of Amazon.',
   'https://en.wikipedia.org/wiki/Jeff_Bezos'),

  ('mukesh-ambani', 'Mukesh Ambani', 'Mukesh Dhirubhai Ambani', 'business', 'India', 1957,
   'Indian businessman, chairman of Reliance Industries.',
   'https://en.wikipedia.org/wiki/Mukesh_Ambani'),

  ('larry-ellison', 'Larry Ellison', 'Lawrence Joseph Ellison', 'business', 'United States', 1944,
   'American businessman, co-founder and chairman of Oracle.',
   'https://en.wikipedia.org/wiki/Larry_Ellison')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Assets
-- ---------------------------------------------------------------------------
insert into assets (
  slug, celebrity_id, category, name, make, model, registration,
  estimated_value_usd, acquired_year, status, confidence, region, summary,
  specs, sources
)
select v.slug, c.id, v.category::asset_category, v.name, v.make, v.model,
       v.registration, v.value, v.acquired, v.status::asset_status,
       v.confidence::confidence_level, v.region, v.summary, v.specs, v.sources
from (values
  ('roman-abramovich-eclipse', 'roman-abramovich', 'yacht',
   'Eclipse', 'Blohm+Voss', null, 'IMO 1009613',
   700000000::bigint, 2010, 'reported', 'high', 'Bermuda',
   'Delivered December 2010 and registered in Hamilton, Bermuda. Was the largest private yacht in the world at delivery.',
   '{"length":"162.5","builder":"Blohm+Voss"}'::jsonb,
   '[{"title":"Eclipse (yacht)","url":"https://en.wikipedia.org/wiki/Eclipse_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('roman-abramovich-solaris', 'roman-abramovich', 'yacht',
   'Solaris', 'Lloyd Werft', null, 'IMO 9819820',
   600000000::bigint, 2021, 'reported', 'high', 'Turkey',
   'Delivered 2021. Moved out of EU waters in 2022 and has not been seized.',
   '{"length":"139.7","builder":"Lloyd Werft"}'::jsonb,
   '[{"title":"Solaris (yacht)","url":"https://en.wikipedia.org/wiki/Solaris_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('jeff-bezos-koru', 'jeff-bezos', 'yacht',
   'Koru', 'Oceanco', 'Y721', null,
   500000000::bigint, 2023, 'reported', 'high', 'Netherlands',
   'Delivered April 2023 after a three-year build. The tallest sailing yacht in the world.',
   '{"length":"127","builder":"Oceanco"}'::jsonb,
   '[{"title":"Koru (yacht)","url":"https://en.wikipedia.org/wiki/Koru_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"},{"title":"Jeff Bezos Receives Koru, the Tallest Sailing Yacht in the World","url":"https://robbreport.com/motors/marine/jeff-bezos-oceanco-sailing-yacht-delivered-1234828428/","publisher":"Robb Report","retrieved":"2026-09-01"}]'::jsonb),

  ('elon-musk-gulfstream-g650er', 'elon-musk', 'jet',
   'Gulfstream G650ER', 'Gulfstream', 'G650ER', 'N628TS',
   70000000::bigint, 2016, 'reported', 'high', 'United States',
   'A 2015 airframe registered to Falcon Landing LLC. The registration encodes his birthday, 28 June.',
   '{"passengers":"19","range":"7500","engines":"2 x Rolls-Royce BR725"}'::jsonb,
   '[{"title":"A Complete Guide To Elon Musk''s Private Jet Fleet","url":"https://simpleflying.com/elon-musk-private-jet-fleet-update-2025/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('mukesh-ambani-antilia', 'mukesh-ambani', 'estate',
   'Antilia', null, null, null,
   2000000000::bigint, 2010, 'reported', 'high', 'Maharashtra, India',
   'A 27-storey tower in Mumbai, completed 2010. Widely reported as the most expensive private residence in the world.',
   '{"floor_area":"37000","features":"27 floors, three helipads, 168-car garage, ballroom, temple"}'::jsonb,
   '[{"title":"Antilia (building)","url":"https://en.wikipedia.org/wiki/Antilia_(building)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('larry-ellison-musashi', 'larry-ellison', 'yacht',
   'Musashi', 'Feadship', null, null,
   160000000::bigint, 2011, 'reported', 'high', 'United States',
   'Commissioned as a deliberately smaller replacement for Rising Sun, which he found too large for most harbours.',
   '{"length":"88","builder":"Feadship"}'::jsonb,
   '[{"title":"Musashi (yacht)","url":"https://en.wikipedia.org/wiki/Musashi_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('larry-ellison-rising-sun', 'larry-ellison', 'yacht',
   'Rising Sun', 'Lurssen', null, null,
   200000000::bigint, 2004, 'former', 'high', 'United States',
   'Delivered 2004 and lengthened at his request. Sold to David Geffen in 2010 after proving too large for many marinas.',
   '{"length":"138","builder":"Lurssen"}'::jsonb,
   '[{"title":"RISING SUN Yacht","url":"https://www.superyachtfan.com/yacht/rising-sun/","publisher":"SuperYacht Fan","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
