-- The A+ (ex-Topaz), the one entry where a photo of the actual vessel
-- exists: shot over the Lürssen yard in 2012 with the name still on the
-- hull, so identity is not in doubt. Verified by eye.

update assets set
  image_url = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/2012-08-08-fotoflug-bremen_erster_flug_1068.JPG/1280px-2012-08-08-fotoflug-bremen_erster_flug_1068.JPG',
  image_credit = '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/2012-08-08-fotoflug-bremen_erster_flug_1068.JPG/1280px-2012-08-08-fotoflug-bremen_erster_flug_1068.JPG", "author": "Bin im Garten", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:2012-08-08-fotoflug-bremen_erster_flug_1068.JPG"}'::jsonb,
  image_is_representative = false
where slug = 'sheikh-mansour-a-plus' and image_url is null;

update assets set gallery = '[{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/2012-08-08-fotoflug-bremen_erster_flug_1067.JPG/1280px-2012-08-08-fotoflug-bremen_erster_flug_1067.JPG", "author": "Bin im Garten", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:2012-08-08-fotoflug-bremen_erster_flug_1067.JPG"}, {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/2012-08-08-fotoflug-bremen_erster_flug_1066.JPG/1280px-2012-08-08-fotoflug-bremen_erster_flug_1066.JPG", "author": "Bin im Garten", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:2012-08-08-fotoflug-bremen_erster_flug_1066.JPG"}]'::jsonb
where slug = 'sheikh-mansour-a-plus' and gallery = '[]'::jsonb;
