-- Seed: rappers and their documented assets.
--
-- Checked against press reporting in September 2026. Everything is `reported`
-- rather than `verified` — this is journalism, not a registry lookup — except
-- 50 Cent's house, which is `former` because he sold it in 2019 and the sale
-- itself is what the reporting documents.
--
-- What the checking turned up, and why several obvious entries are missing:
--
--   * Diddy charters yachts, he does not own them. He is photographed on a
--     different one each time, and Victorious belongs to a Turkish
--     businessman. Maraya, which he did own, has since gone. "Diddy's yacht"
--     is a category error the press repeats constantly.
--   * Travis Scott's Chiron was bought for a music video shoot, which is not
--     the same claim as owning one, so it is left out until that is clearer.
--   * Rick Ross's and Post Malone's houses are documented down to the street.
--     Region here stops at the state, as it always does.
--   * French Montana turned up nothing specific enough to stand behind. He is
--     in the database without assets rather than with invented ones.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
insert into celebrities (slug, name, real_name, category, nationality, born_year, bio, wikipedia)
values
  ('rick-ross', 'Rick Ross', 'William Leonard Roberts II', 'music', 'United States', 1976,
   'American rapper and founder of Maybach Music Group.',
   'https://en.wikipedia.org/wiki/Rick_Ross'),

  ('50-cent', '50 Cent', 'Curtis James Jackson III', 'music', 'United States', 1975,
   'American rapper, businessman and television producer.',
   'https://en.wikipedia.org/wiki/50_Cent'),

  ('french-montana', 'French Montana', 'Karim Kharbouch', 'music', 'Morocco', 1984,
   'Moroccan-American rapper and founder of Coke Boys Records.',
   'https://en.wikipedia.org/wiki/French_Montana'),

  ('travis-scott', 'Travis Scott', 'Jacques Bermon Webster II', 'music', 'United States', 1991,
   'American rapper and producer, founder of Cactus Jack Records.',
   'https://en.wikipedia.org/wiki/Travis_Scott'),

  ('diddy', 'Diddy', 'Sean John Combs', 'music', 'United States', 1969,
   'American rapper and record producer, founder of Bad Boy Records.',
   'https://en.wikipedia.org/wiki/Sean_Combs'),

  ('birdman', 'Birdman', 'Bryan Christopher Williams', 'music', 'United States', 1969,
   'American rapper and co-founder of Cash Money Records.',
   'https://en.wikipedia.org/wiki/Birdman_(rapper)'),

  ('post-malone', 'Post Malone', 'Austin Richard Post', 'music', 'United States', 1995,
   'American singer and rapper, among the best-selling artists of his generation.',
   'https://en.wikipedia.org/wiki/Post_Malone')
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
  ('rick-ross-promise-land', 'rick-ross', 'estate',
   'The Promise Land', null, null, null,
   5800000::bigint, 2014, 'reported', 'high', 'Georgia, United States',
   'Bought from boxer Evander Holyfield in 2014. Reported as the largest house in Georgia.',
   '{"floor_area":"4180","bedrooms":"21","bathrooms":"12","features":"109 rooms, 235-acre grounds, dining hall for 100, 350,000-gallon pool"}'::jsonb,
   '[{"title":"Largest House in Georgia: Inside Rick Ross Promise Land Estate","url":"https://luxury-houses.net/largest-home-in-georgia-rick-ross-mansion-ga/","publisher":"Luxury Houses","retrieved":"2026-09-01"}]'::jsonb),

  ('50-cent-farmington-estate', '50-cent', 'estate',
   'Farmington estate', null, null, null,
   2900000::bigint, 2003, 'former', 'high', 'Connecticut, United States',
   'Bought from Mike Tyson''s ex-wife for $4.1m in 2003 and sold in 2019 for $2.9m, 84 per cent below the original asking price.',
   '{"floor_area":"4645","bedrooms":"19","bathrooms":"25","features":"Indoor pool, basketball court, recording studio, night club room, helipad"}'::jsonb,
   '[{"title":"See Why 50 Cent''s Notorious B.I.G. Mansion Sold For Only $2.9 Million","url":"https://www.forbes.com/sites/keithflamer/2019/04/02/see-why-50-cents-notorious-big-mansion-only-sold-for-2-9-million/","publisher":"Forbes","retrieved":"2026-09-01"},{"title":"Inside the Connecticut mansion 50 Cent just sold for $2.9 million","url":"https://www.cnbc.com/2019/04/05/photos-50-cent-sells-his-multimillion-dollar-connecticut-mansion.html","publisher":"CNBC","retrieved":"2026-09-01"}]'::jsonb),

  ('diddy-maraya', 'diddy', 'yacht',
   'Maraya', null, null, null,
   65000000::bigint, 2012, 'former', 'medium', 'United States',
   'Acquired in 2012, succeeding the Lurssen-built Oasis. Since disposed of. Yachts he has been photographed on more recently were chartered, not owned.',
   '{}'::jsonb,
   '[{"title":"On Board Maraya, Diddy''s $65 Million Superyacht Made for Entertaining","url":"https://www.autoevolution.com/news/on-board-maraya-diddys-65-million-superyacht-made-for-entertaining-169485.html","publisher":"autoevolution","retrieved":"2026-09-01"}]'::jsonb),

  ('post-malone-utah-house', 'post-malone', 'estate',
   'Utah mountain house', null, null, null,
   3100000::bigint, 2020, 'reported', 'high', 'Utah, United States',
   'Bought in 2020 through an LLC. Reported as built to be self-sufficient.',
   '{"floor_area":"1208","plot_area":"28300","bedrooms":"5","bathrooms":"7"}'::jsonb,
   '[{"title":"Inside Post Malone''s Luxury Utah Home","url":"https://www.housedigest.com/928847/inside-post-malones-luxury-utah-home/","publisher":"House Digest","retrieved":"2026-09-01"}]'::jsonb)
) as v(slug, owner, category, name, make, model, registration, value, acquired,
       status, confidence, region, summary, specs, sources)
join celebrities c on c.slug = v.owner
on conflict (slug) do nothing;
