-- Seed: Gulf and Asian royalty.
--
-- Filed under `royalty`, the category added for exactly this group: heads of
-- state and ruling families own the largest yachts and aircraft in the world
-- and fitted nowhere before.
--
-- This group needed more care than the others, for two reasons.
--
-- Sovereign wealth blurs the line between what a person owns and what a state
-- owns. The vessels below are recorded because reporting names the individual,
-- not the state, as owner. Where that distinction is unclear the asset is not
-- here.
--
-- And the totals quoted for Asian monarchies — "38 aircraft", "52 boats",
-- "17,000 homes" — are aggregates, not identified assets. A number in a
-- newspaper is not an entry: this database catalogues things it can name. The
-- King of Thailand and Li Ka-shing are in it without assets for that reason.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('mohammed-bin-salman', 'Mohammed bin Salman', 'Mohammed bin Salman Al Saud', 'royalty', 'Saudi Arabia', 1985,
   'Crown Prince and Prime Minister of Saudi Arabia.',
   'https://en.wikipedia.org/wiki/Mohammed_bin_Salman'),

  ('sheikh-mansour', 'Sheikh Mansour', 'Mansour bin Zayed Al Nahyan', 'royalty', 'United Arab Emirates', 1970,
   'Emirati royal, Vice President of the UAE and owner of the group that controls Manchester City.',
   'https://en.wikipedia.org/wiki/Mansour_bin_Zayed_Al_Nahyan'),

  ('mohammed-bin-rashid', 'Mohammed bin Rashid Al Maktoum', 'Mohammed bin Rashid Al Maktoum', 'royalty', 'United Arab Emirates', 1949,
   'Ruler of Dubai and Prime Minister of the United Arab Emirates.',
   'https://en.wikipedia.org/wiki/Mohammed_bin_Rashid_Al_Maktoum'),

  ('hassanal-bolkiah', 'Hassanal Bolkiah', 'Haji Hassanal Bolkiah', 'royalty', 'Brunei', 1946,
   'Sultan of Brunei, one of the world''s last absolute monarchs.',
   'https://en.wikipedia.org/wiki/Hassanal_Bolkiah'),

  ('maha-vajiralongkorn', 'Maha Vajiralongkorn', 'Maha Vajiralongkorn Phra Vajiraklaochaoyuhua', 'royalty', 'Thailand', 1952,
   'King of Thailand, who took personal control of the Crown Property Bureau in 2018.',
   'https://en.wikipedia.org/wiki/Vajiralongkorn'),

  ('li-ka-shing', 'Li Ka-shing', 'Li Ka-shing', 'business', 'Hong Kong', 1928,
   'Hong Kong businessman, founder of CK Hutchison Holdings.',
   'https://en.wikipedia.org/wiki/Li_Ka-shing')
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
  ('mohammed-bin-salman-serene', 'mohammed-bin-salman', 'yacht',
   'Serene', 'Fincantieri', null, null,
   550000000::bigint, 2015, 'reported', 'high', 'Saudi Arabia',
   'Built by Fincantieri in 2011 for Yuri Shefler and bought in 2015 while it was moored in the south of France. Bill Gates had chartered it the previous summer.',
   '{"length":"133.9","beam":"18.5","builder":"Fincantieri"}'::jsonb,
   '[{"title":"Serene (yacht)","url":"https://en.wikipedia.org/wiki/Serene_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('sheikh-mansour-a-plus', 'sheikh-mansour', 'yacht',
   'A+', 'Lurssen', null, null,
   450000000::bigint, 2012, 'reported', 'high', 'United Arab Emirates',
   'Delivered by Lurssen in 2012 as Topaz and renamed A+ in 2019. Exterior by Tim Heywood, interior by Terence Disdale.',
   '{"length":"147.3","builder":"Lurssen"}'::jsonb,
   '[{"title":"A+ (yacht)","url":"https://en.wikipedia.org/wiki/A%2B_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('mohammed-bin-rashid-dubai', 'mohammed-bin-rashid', 'yacht',
   'Dubai', 'Blohm+Voss', null, null,
   400000000::bigint, 2001, 'reported', 'high', 'United Arab Emirates',
   'Begun in 1995 for Prince Jefri Bolkiah of Brunei, who withdrew from the contract. Acquired in 2001 and completed in 2006 by Blohm+Voss and Lurssen.',
   '{"length":"162","builder":"Blohm+Voss / Lurssen"}'::jsonb,
   '[{"title":"Dubai (yacht)","url":"https://en.wikipedia.org/wiki/Dubai_(yacht)","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('hassanal-bolkiah-car-collection', 'hassanal-bolkiah', 'car',
   'Royal car collection', null, null, null,
   5000000000::bigint, null::integer, 'reported', 'medium', 'Brunei',
   'Reported at around 7,000 cars, the largest private collection in the world. Includes roughly 150 Rolls-Royces, along with Ferrari F40s and McLaren F1s. Recorded as one entry because the individual cars are not documented separately.',
   '{"production":"7000"}'::jsonb,
   '[{"title":"Car collection of the 29th Sultan of Brunei","url":"https://en.wikipedia.org/wiki/Car_collection_of_the_29th_Sultan_of_Brunei","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('hassanal-bolkiah-istana-nurul-iman', 'hassanal-bolkiah', 'estate',
   'Istana Nurul Iman', null, null, null,
   1400000000::bigint, 1984, 'reported', 'high', 'Brunei',
   'The official residence of the Sultan and the largest residential palace in the world.',
   '{"floor_area":"185800","bathrooms":"257","features":"1,788 rooms, banquet hall for 5,000, stabling for 200 polo ponies, 110 garages, five swimming pools"}'::jsonb,
   '[{"title":"Istana Nurul Iman","url":"https://en.wikipedia.org/wiki/Istana_Nurul_Iman","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
