-- Seed: actors and their documented assets.
--
-- All five are `film`.
--
-- Tom Cruise is the strongest set of records in the database so far: four
-- aircraft, each with a tail number that can be looked up in the FAA registry.
-- He flies them himself, which is why the fleet is documented at all.
--
-- Houses are recorded to the state, or to the country for Clooney's villa.
-- Several of the sources give street addresses; none of that is here.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('tom-cruise', 'Tom Cruise', 'Thomas Cruise Mapother IV', 'film', 'United States', 1962,
   'American actor and producer, a licensed pilot since 1994.',
   'https://en.wikipedia.org/wiki/Tom_Cruise'),

  ('leonardo-dicaprio', 'Leonardo DiCaprio', 'Leonardo Wilhelm DiCaprio', 'film', 'United States', 1974,
   'American actor and environmental campaigner.',
   'https://en.wikipedia.org/wiki/Leonardo_DiCaprio'),

  ('dwayne-johnson', 'Dwayne Johnson', 'Dwayne Douglas Johnson', 'film', 'United States', 1972,
   'American actor and former professional wrestler.',
   'https://en.wikipedia.org/wiki/Dwayne_Johnson'),

  ('will-smith', 'Will Smith', 'Willard Carroll Smith II', 'film', 'United States', 1968,
   'American actor and rapper.',
   'https://en.wikipedia.org/wiki/Will_Smith'),

  ('george-clooney', 'George Clooney', 'George Timothy Clooney', 'film', 'United States', 1961,
   'American actor, director and producer.',
   'https://en.wikipedia.org/wiki/George_Clooney')
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
  ('tom-cruise-gulfstream-iv', 'tom-cruise', 'jet',
   'Gulfstream IV', 'Gulfstream', 'GIV', 'N808T',
   20000000::bigint, null::integer, 'reported', 'high', 'United States',
   'The largest aircraft in his fleet. He holds the multi-engine instrument rating needed to fly it.',
   '{"passengers":"14","range":"4200"}'::jsonb,
   '[{"title":"What Planes Does Tom Cruise Own?","url":"https://simpleflying.com/what-planes-does-tom-cruise-own/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('tom-cruise-challenger-300', 'tom-cruise', 'jet',
   'Bombardier Challenger 300', 'Bombardier', 'Challenger 300', 'N350XX',
   null::bigint, null::integer, 'reported', 'high', 'United States',
   'The second jet in his fleet.',
   '{"passengers":"9","range":"3065"}'::jsonb,
   '[{"title":"What Planes Does Tom Cruise Own?","url":"https://simpleflying.com/what-planes-does-tom-cruise-own/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('tom-cruise-hondajet', 'tom-cruise', 'jet',
   'HondaJet Elite', 'Honda', 'HA-420', 'N77VA',
   5400000::bigint, null::integer, 'reported', 'medium', 'United States',
   'A very light jet, the smallest of his three jets.',
   '{"passengers":"6","range":"1437"}'::jsonb,
   '[{"title":"What Planes Does Tom Cruise Own?","url":"https://simpleflying.com/what-planes-does-tom-cruise-own/","publisher":"Simple Flying","retrieved":"2026-09-01"}]'::jsonb),

  ('tom-cruise-p51-mustang', 'tom-cruise', 'jet',
   'North American P-51 Mustang', 'North American Aviation', 'P-51D', 'N51EW',
   4000000::bigint, null::integer, 'reported', 'high', 'United States',
   'A 1944 propeller warbird, filed under aircraft for want of a closer category. He flew it himself in Top Gun: Maverick. Requires a tailwheel endorsement, which he holds.',
   '{"passengers":"2","engines":"Packard V-1650 Merlin"}'::jsonb,
   '[{"title":"Tom Cruise Owns More Than One Plane","url":"https://www.slashgear.com/1402776/tom-cruise-coolest-planes/","publisher":"SlashGear","retrieved":"2026-09-01"}]'::jsonb),

  ('leonardo-dicaprio-malibu-house', 'leonardo-dicaprio', 'estate',
   'Malibu beach house', null, null, null,
   13800000::bigint, null::integer, 'reported', 'medium', 'California, United States',
   'An oceanfront property in a gated community.',
   '{"bedrooms":"4"}'::jsonb,
   '[{"title":"Inside Leonardo DiCaprio''s $72 Million Property Portfolio","url":"https://robbreport.com/shelter/celebrity-homes/lists/leonardo-dicaprio-property-portfolio-1237087574/","publisher":"Robb Report","retrieved":"2026-09-01"}]'::jsonb),

  ('leonardo-dicaprio-beverly-hills-house', 'leonardo-dicaprio', 'estate',
   'Beverly Hills house', null, null, null,
   9900000::bigint, 2021, 'reported', 'medium', 'California, United States',
   'Bought in December 2021. Built in 1936.',
   '{"bedrooms":"5","bathrooms":"6","built":"1936"}'::jsonb,
   '[{"title":"Inside Leonardo DiCaprio''s $72 Million Property Portfolio","url":"https://robbreport.com/shelter/celebrity-homes/lists/leonardo-dicaprio-property-portfolio-1237087574/","publisher":"Robb Report","retrieved":"2026-09-01"}]'::jsonb),

  ('dwayne-johnson-pagani-huayra', 'dwayne-johnson', 'car',
   'Pagani Huayra', 'Pagani', 'Huayra', null,
   2600000::bigint, null::integer, 'reported', 'medium', 'United States',
   'One of 100 built.',
   '{"engine":"6.0 L twin-turbo V12","power":"720","top_speed":"383","production":"100"}'::jsonb,
   '[{"title":"Dwayne Johnson''s car collection","url":"https://rerev.com/car-collections/dwayne-johnson/","publisher":"REREV","retrieved":"2026-09-01"}]'::jsonb),

  ('dwayne-johnson-laferrari', 'dwayne-johnson', 'car',
   'Ferrari LaFerrari', 'Ferrari', 'LaFerrari', null,
   2000000::bigint, null::integer, 'reported', 'medium', 'United States',
   'One of 500 built, in a white and black finish.',
   '{"engine":"6.3 L V12 hybrid","power":"950","top_speed":"350","production":"500"}'::jsonb,
   '[{"title":"Dwayne Johnson''s car collection","url":"https://rerev.com/car-collections/dwayne-johnson/","publisher":"REREV","retrieved":"2026-09-01"}]'::jsonb),

  ('will-smith-calabasas-estate', 'will-smith', 'estate',
   'Calabasas estate', null, null, null,
   42000000::bigint, null::integer, 'reported', 'high', 'California, United States',
   'A 150-acre estate built over several years, with its own lake.',
   '{"floor_area":"2320","plot_area":"607000","bedrooms":"9","features":"Home theatre, eight-car garage, private lake, gazebo"}'::jsonb,
   '[{"title":"Will Smith''s 25,000 Sq. Ft. Mansion on 150 Acres in Calabasas","url":"https://www.priceypads.com/will-smiths-25000-sq-ft-mansion-on-150-acres-in-calabasas/","publisher":"Pricey Pads","retrieved":"2026-09-01"}]'::jsonb),

  ('george-clooney-villa-oleandra', 'george-clooney', 'estate',
   'Villa Oleandra', null, null, null,
   12000000::bigint, 2002, 'reported', 'high', 'Lombardy, Italy',
   'An 18th-century villa on Lake Como, bought from the Heinz family in 2002 for EUR 11.7m.',
   '{"floor_area":"3000","plot_area":"8500","built":"1700","features":"25 rooms, cinema, gym, tennis and basketball courts, pool"}'::jsonb,
   '[{"title":"George Clooney to sell iconic Lake Como villa for EUR 100m","url":"https://www.aol.com/george-clooney-sell-iconic-lake-102302644.html","publisher":"AOL","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
