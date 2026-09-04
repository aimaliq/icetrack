-- Gallery photos for the estates that have free ones, plus the one main
-- photo that was still missing.
--
-- Only the famous buildings: Antilia, Istana Nurul Iman and Villa Oleandra
-- have Commons photos to spare, and Taylor Swift's Holiday House has exactly
-- one (shot from the public beach). The other private homes have nothing
-- freely licensed - checked against Commons and Openverse (which indexes
-- Flickr's NC pool too), not assumed. Their placeholders stay.
--
-- Guards: the main photo only lands on a null, galleries only on '[]', so
-- nothing a contributor added since gets clobbered.

-- Taylor Swift's Holiday House, from the public beach - the one free photo
-- of any of the private homes that actually exists.
update assets set
  image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Holiday_House_on_Watch_Hill.jpg/1280px-Holiday_House_on_Watch_Hill.jpg',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Holiday_House_on_Watch_Hill.jpg/1280px-Holiday_House_on_Watch_Hill.jpg", "author": "JJBers", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Holiday_House_on_Watch_Hill.jpg"}'::jsonb,
  image_is_representative = false
where slug = 'taylor-swift-high-watch' and image_url is null;

update assets set gallery = '[{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Ambani_House_July_2010.jpg/1280px-Ambani_House_July_2010.jpg", "author": "Jay Hariani", "license": "CC BY 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Ambani_House_July_2010.jpg"}, {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Antilia_and_other_buildings.jpg/1280px-Antilia_and_other_buildings.jpg", "author": "DesiBoy101", "license": "CC BY 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Antilia_and_other_buildings.jpg"}]'::jsonb
where slug = 'mukesh-ambani-antilia' and gallery = '[]'::jsonb;

update assets set gallery = '[{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Istana_Nurul_Iman_2008_01.jpg/1280px-Istana_Nurul_Iman_2008_01.jpg", "author": "Pangalau", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Istana_Nurul_Iman_2008_01.jpg"}, {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Istana_Nurul_Iman_2008_02.jpg/1280px-Istana_Nurul_Iman_2008_02.jpg", "author": "Pangalau", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Istana_Nurul_Iman_2008_02.jpg"}]'::jsonb
where slug = 'hassanal-bolkiah-istana-nurul-iman' and gallery = '[]'::jsonb;

update assets set gallery = '[{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/2006-06-14_Villa_Clooney_in_Laglio.jpg/1280px-2006-06-14_Villa_Clooney_in_Laglio.jpg", "author": "Henry Kellner", "license": "Public domain", "sourcePage": "https://commons.wikimedia.org/wiki/File:2006-06-14_Villa_Clooney_in_Laglio.jpg"}, {"url": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Lake_Como_-_Villa_Oleandra_%285142342935%29.jpg", "author": "Roman Harak", "license": "CC BY-SA 2.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Lake_Como_-_Villa_Oleandra_(5142342935).jpg"}]'::jsonb
where slug = 'george-clooney-villa-oleandra' and gallery = '[]'::jsonb;
