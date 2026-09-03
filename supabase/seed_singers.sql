-- Seed: singers, plus the Latin and YouTube names from the same list.
--
-- Everyone here is `music` except the four YouTubers, who are `media` — the
-- category that reads as "Social Media" in the interface.
--
-- The Latin artists and most of the YouTubers are in the database without
-- assets. Searching turned up plenty of listicles and nothing specific enough
-- to cite: no purchase reported by a named outlet, no registration, no
-- transaction. Their pages will say "no assets catalogued yet", which is
-- accurate, and anyone who has a source can add one.
--
-- Jake Paul already exists in the database and is not re-inserted.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('rihanna', 'Rihanna', 'Robyn Rihanna Fenty', 'music', 'Barbados', 1988,
   'Barbadian singer and businesswoman, founder of Fenty Beauty.',
   'https://en.wikipedia.org/wiki/Rihanna'),

  ('nicki-minaj', 'Nicki Minaj', 'Onika Tanya Maraj-Petty', 'music', 'Trinidad and Tobago', 1982,
   'Trinidadian-born rapper and singer.',
   'https://en.wikipedia.org/wiki/Nicki_Minaj'),

  ('beyonce', 'Beyonce', 'Beyonce Giselle Knowles-Carter', 'music', 'United States', 1981,
   'American singer and businesswoman, the most decorated artist in Grammy history.',
   'https://en.wikipedia.org/wiki/Beyonc%C3%A9'),

  ('taylor-swift', 'Taylor Swift', 'Taylor Alison Swift', 'music', 'United States', 1989,
   'American singer-songwriter, whose Eras Tour became the highest-grossing tour ever staged.',
   'https://en.wikipedia.org/wiki/Taylor_Swift'),

  ('kanye-west', 'Ye', 'Kanye Omari West', 'music', 'United States', 1977,
   'American rapper, producer and fashion designer.',
   'https://en.wikipedia.org/wiki/Kanye_West'),

  ('justin-bieber', 'Justin Bieber', 'Justin Drew Bieber', 'music', 'Canada', 1994,
   'Canadian singer.',
   'https://en.wikipedia.org/wiki/Justin_Bieber'),

  ('bad-bunny', 'Bad Bunny', 'Benito Antonio Martinez Ocasio', 'music', 'Puerto Rico', 1994,
   'Puerto Rican rapper and singer, among the most streamed artists in the world.',
   'https://en.wikipedia.org/wiki/Bad_Bunny'),

  ('daddy-yankee', 'Daddy Yankee', 'Ramon Luis Ayala Rodriguez', 'music', 'Puerto Rico', 1977,
   'Puerto Rican rapper, widely credited with popularising reggaeton.',
   'https://en.wikipedia.org/wiki/Daddy_Yankee'),

  ('logan-paul', 'Logan Paul', 'Logan Alexander Paul', 'media', 'United States', 1995,
   'American YouTuber, boxer and professional wrestler.',
   'https://en.wikipedia.org/wiki/Logan_Paul'),

  ('ksi', 'KSI', 'Olajide Olayinka Williams Olatunji', 'media', 'United Kingdom', 1993,
   'British YouTuber, rapper and boxer, co-founder of Prime.',
   'https://en.wikipedia.org/wiki/KSI'),

  ('mrbeast', 'MrBeast', 'James Stephen Donaldson', 'media', 'United States', 1998,
   'American YouTuber, the most-subscribed individual creator on the platform.',
   'https://en.wikipedia.org/wiki/MrBeast')
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
  ('beyonce-bel-air-house', 'beyonce', 'estate',
   'Bel Air house', null, null, null,
   88000000::bigint, 2017, 'reported', 'high', 'California, United States',
   'Bought jointly with Jay-Z in 2017. Designed by Paul McClean.',
   '{"bedrooms":"8","bathrooms":"11","features":"Four pools, spa, media room, basketball court, staff quarters"}'::jsonb,
   '[{"title":"Inside Beyonce and Jay-Z''s Bel Air Home with the Architect of L.A.''s Giga-Mansion Boom","url":"https://www.wmagazine.com/story/paul-mcclean-architect-beyonce-jay-z-bel-air-house","publisher":"W Magazine","retrieved":"2026-09-01"}]'::jsonb),

  ('beyonce-malibu-house', 'beyonce', 'estate',
   'Malibu house', null, null, null,
   200000000::bigint, 2023, 'reported', 'high', 'California, United States',
   'Bought jointly with Jay-Z in 2023 and reported as the most expensive home ever sold in California. Paid in cash.',
   '{}'::jsonb,
   '[{"title":"Jay-Z and Beyonce Purchase Most Expensive Home Ever in California","url":"https://www.tmz.com/2023/05/19/jay-z-beyonce-home-purchase-malibu-record-breaking-mansion/","publisher":"TMZ","retrieved":"2026-09-01"}]'::jsonb),

  ('taylor-swift-high-watch', 'taylor-swift', 'estate',
   'High Watch', null, null, null,
   17750000::bigint, 2013, 'reported', 'high', 'Rhode Island, United States',
   'Bought in cash in 2013. Its previous owner, the socialite Rebekah Harkness, is the subject of her song The Last Great American Dynasty.',
   '{"floor_area":"1115","bedrooms":"8","features":"700 feet of shoreline, eight fireplaces, pool"}'::jsonb,
   '[{"title":"High Watch","url":"https://en.wikipedia.org/wiki/High_Watch","publisher":"Wikipedia","retrieved":"2026-09-01"}]'::jsonb),

  ('rihanna-beverly-hills-house', 'rihanna', 'estate',
   'Beverly Hills house', null, null, null,
   13800000::bigint, 2020, 'reported', 'medium', 'California, United States',
   'Bought in 2020 according to property records, reported the following March.',
   '{"bedrooms":"5","bathrooms":"7"}'::jsonb,
   '[{"title":"Inside Rihanna''s stunning $13.8 million Beverly Hills mansion","url":"https://www.capitalxtra.com/artists/rihanna/news/inside-13-8-million-beverly-hills-mansion-photos/","publisher":"Capital XTRA","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
