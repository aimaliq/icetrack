-- Seed: sports figures and their documented assets.
--
-- Every row was checked against press reporting in September 2026 and carries
-- its source. Where reporting is thin or contradictory the entry is `reported`
-- rather than `verified`; where an asset could not be stood up at all, it is
-- not here.
--
-- Two deliberate omissions worth recording:
--
--   * LeBron James owns no aircraft. He flies NetJets, a fractional
--     programme, and has denied ownership publicly. A "LeBron's jet" entry
--     would be false however often the claim is repeated.
--   * Canelo Alvarez's Guadalajara house is widely covered, but a house is
--     only ever recorded here down to country, so it adds nothing the region
--     field does not already say.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('cristiano-ronaldo', 'Cristiano Ronaldo', 'Cristiano Ronaldo dos Santos Aveiro', 'sports', 'Portugal', 1985,
   'Portuguese footballer, five-time Ballon d''Or winner and the sport''s all-time leading scorer.',
   'https://en.wikipedia.org/wiki/Cristiano_Ronaldo'),

  ('neymar', 'Neymar', 'Neymar da Silva Santos Junior', 'sports', 'Brazil', 1992,
   'Brazilian footballer, joint all-time leading scorer for his country.',
   'https://en.wikipedia.org/wiki/Neymar'),

  ('conor-mcgregor', 'Conor McGregor', 'Conor Anthony McGregor', 'sports', 'Ireland', 1988,
   'Irish mixed martial artist, the first UFC fighter to hold titles in two weight classes at once.',
   'https://en.wikipedia.org/wiki/Conor_McGregor'),

  ('canelo-alvarez', 'Canelo Alvarez', 'Santos Saul Alvarez Barragan', 'sports', 'Mexico', 1990,
   'Mexican boxer and four-division world champion, undisputed at super middleweight.',
   'https://en.wikipedia.org/wiki/Canelo_Alvarez'),

  ('lebron-james', 'LeBron James', 'LeBron Raymone James Sr.', 'sports', 'United States', 1984,
   'American basketball player, the NBA''s all-time leading scorer.',
   'https://en.wikipedia.org/wiki/LeBron_James'),

  ('michael-jordan', 'Michael Jordan', 'Michael Jeffrey Jordan', 'sports', 'United States', 1963,
   'American former basketball player and businessman, six-time NBA champion.',
   'https://en.wikipedia.org/wiki/Michael_Jordan')
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
  ('cristiano-ronaldo-gulfstream-g650', 'cristiano-ronaldo', 'jet',
   'Gulfstream G650', 'Gulfstream', 'G650', null,
   73000000::bigint, 2024, 'reported', 'medium', 'Portugal',
   'Reported in December 2024 as replacing the Gulfstream G200 he sold in 2022. Carries CR7 branding.',
   '{"passengers":"19","range":"7000","engines":"2 x Rolls-Royce BR725"}'::jsonb,
   '[{"title":"Cristiano Ronaldo unveils new private jet worth $73 million","url":"https://english.alarabiya.net/sports/2024/12/16/cristiano-ronaldo-unveils-new-private-jet-worth-73-million","publisher":"Al Arabiya","retrieved":"2026-09-01"}]'::jsonb),

  ('cristiano-ronaldo-global-express', 'cristiano-ronaldo', 'jet',
   'Bombardier Global Express XRS', 'Bombardier', 'Global Express XRS', 'LX-GOL',
   null::bigint, null::integer, 'reported', 'medium', 'Saudi Arabia',
   'Reported as based in Riyadh and used for Saudi Arabia to Europe routes.',
   '{}'::jsonb,
   '[{"title":"Inside The Luxurious World Of Cristiano Ronaldo''s Private Jet","url":"https://simpleflying.com/cristiano-ronaldo-private-jet-guide-2025/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('neymar-citation-sovereign', 'neymar', 'jet',
   'Cessna Citation Sovereign', 'Cessna', 'Citation Sovereign (680)', 'PR-SMK',
   22000000::bigint, 2016, 'reported', 'medium', 'Brazil',
   'Acquired through his company Neymar Sport e Marketing.',
   '{"passengers":"12","range":"3200","cruise_speed":"459"}'::jsonb,
   '[{"title":"Neymar''s Private Jets: A Look At His Small Fleet Of Aircraft","url":"https://simpleflying.com/neymar-private-jet-fleet-guide/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('conor-mcgregor-lamborghini-63', 'conor-mcgregor', 'yacht',
   'Tecnomar for Lamborghini 63', 'Tecnomar', 'Lamborghini 63', null,
   3600000::bigint, 2021, 'reported', 'high', 'Ireland',
   'Hull 12 of 63, chosen to match his Proper No. Twelve whiskey brand. Ordered October 2020, delivered 2021.',
   '{"length":"19","top_speed":"60","builder":"Tecnomar (The Italian Sea Group)"}'::jsonb,
   '[{"title":"Conor McGregor Flaunts His New $3.6 Million Lamborghini Yacht","url":"https://www.forbes.com/sites/nathanieleasington/2021/07/23/conor-mcgregor-flaunts-his-new-36-million-lamborghini-yacht-the-supercar-of-the-sea/","publisher":"Forbes","retrieved":"2026-09-01"},{"title":"Conor McGregor Just Got One of Tecnomar''s 4,000 HP Lamborghini 63 Motoryachts","url":"https://robbreport.com/motors/marine/conor-mcgregor-tecnomar-lamborghini-63-motoryacht-1234625746/","publisher":"Robb Report","retrieved":"2026-09-01"}]'::jsonb),

  ('canelo-alvarez-bugatti-chiron', 'canelo-alvarez', 'car',
   'Bugatti Chiron', 'Bugatti', 'Chiron', null,
   3000000::bigint, 2019, 'reported', 'medium', 'Mexico',
   'Reported purchase in 2019, finished in blue.',
   '{"engine":"8.0 L quad-turbo W16","power":"1479","top_speed":"420","zero_to_100":"2.4"}'::jsonb,
   '[{"title":"Boxer Saul Canelo Alvarez has an impressive car collection","url":"https://www.topgear.com.ph/features/feature-articles/saul-canelo-alvarez-car-collection-a958-20210430","publisher":"Top Gear Philippines","retrieved":"2026-09-01"}]'::jsonb),

  ('michael-jordan-gulfstream-g650er', 'michael-jordan', 'jet',
   'Gulfstream G650ER', 'Gulfstream', 'G650ER', 'N236MJ',
   null::bigint, 2024, 'reported', 'high', 'United States',
   'Delivered new in October 2024 with a custom elephant-print livery. The registration encodes his jersey number, six championships and initials.',
   '{"passengers":"19","range":"7500","engines":"2 x Rolls-Royce BR725"}'::jsonb,
   '[{"title":"Inside The Luxurious World Of Michael Jordan''s Private Jet","url":"https://simpleflying.com/inside-the-luxurious-world-michael-jordan-private-jet/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('michael-jordan-gulfstream-g550', 'michael-jordan', 'jet',
   'Gulfstream G550', 'Gulfstream', 'G550', 'N239MJ',
   null::bigint, null::integer, 'reported', 'medium', 'United States',
   'A 2005 aircraft, reported as retained alongside the G650ER.',
   '{"passengers":"14"}'::jsonb,
   '[{"title":"Michael Jordan Vs. LeBron James: A Comparison Of These NBA Superstars Private Jets","url":"https://simpleflying.com/michael-jordan-lebron-james-private-jet-comparison/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
