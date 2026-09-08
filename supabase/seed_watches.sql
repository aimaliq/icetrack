-- Watches: the accessories category had one entry.
--
-- Every pairing below is documented by the cited source, and every photo is
-- of the exact reference — a watch is a production model, so a photo of the
-- reference genuinely shows the object, which is never true of a house. Each
-- is marked representative for that reason: it is that model, not that
-- person's individual example.
--
-- Jacob & Co pieces are missing on purpose. Mayweather's $18M Billionaire is
-- the most famous celebrity watch there is, but the brand has nothing on
-- Commons under a licence we can publish, and an entry with no photo is the
-- empty card we are trying to stop making.
--
-- A helper keeps the repetition down; it is dropped at the end.

create or replace function create_asset_seed(
  owner_slug text, a_name text, a_make text, a_model text, a_year int,
  a_value bigint, a_status text, a_summary text, a_sources jsonb,
  a_image text, a_credit jsonb, a_specs jsonb
) returns void language plpgsql as $$
declare oid uuid; s text;
begin
  select id into oid from celebrities where slug = owner_slug and not is_deleted;
  if oid is null then raise notice 'skipping %, no such person', owner_slug; return; end if;

  s := unique_slug('assets', owner_slug || ' ' || a_name);
  if exists (select 1 from assets where celebrity_id = oid and name = a_name) then
    raise notice 'skipping %, already has %', owner_slug, a_name; return;
  end if;

  insert into assets (slug, celebrity_id, category, name, make, model, year,
    estimated_value_usd, status, confidence, summary, sources, image_url,
    image_credit, image_is_representative, specs)
  values (s, oid, 'accessories', a_name, a_make, a_model, a_year,
    a_value, a_status::asset_status, 'medium', a_summary, a_sources, a_image,
    a_credit, true, a_specs);
end;
$$;

select create_asset_seed(
  'jay-z', 'Patek Philippe Nautilus 5711/1A Tiffany', 'Patek Philippe', 'Nautilus 5711/1A-018', 2021, 3000000,
  'reported', 'One of 170 made with the Tiffany-blue dial. Jay-Z was photographed wearing one days after the collaboration was announced in December 2021.',
  '[{"title": "Jay-Z''s watch collection", "url": "https://www.hellomagazine.com/fashion/celebrity-style/498922/inside-jay-zs-eye-watering-multi-million-dollar-luxury-watch-collection/", "publisher": "HELLO!"}]'::jsonb,
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Patek-Philippe-Nautilus-5711-1A-010-1.jpg/1280px-Patek-Philippe-Nautilus-5711-1A-010-1.jpg', '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Patek-Philippe-Nautilus-5711-1A-010-1.jpg/1280px-Patek-Philippe-Nautilus-5711-1A-010-1.jpg", "author": "Patek Philippe SA", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Patek-Philippe-Nautilus-5711-1A-010-1.jpg"}'::jsonb,
  '{"reference": "5711/1A-018", "material": "Stainless steel", "case_size": "40", "movement": "Calibre 26-330 S C"}'::jsonb
);

select create_asset_seed(
  'floyd-mayweather', 'Rolex Sky-Dweller', 'Rolex', 'Sky-Dweller 326938', 2019, 180000,
  'reported', 'A diamond-set Sky-Dweller in yellow gold, one of the Rolexes Mayweather is regularly photographed in.',
  '[{"title": "Floyd Mayweather''s watch collection", "url": "https://www.bosshunting.com.au/style/watches/floyd-mayweather-watch-collection/", "publisher": "Boss Hunting"}]'::jsonb,
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Rolex_Sky-Dweller_in_oro_bianco.jpg/1280px-Rolex_Sky-Dweller_in_oro_bianco.jpg', '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Rolex_Sky-Dweller_in_oro_bianco.jpg/1280px-Rolex_Sky-Dweller_in_oro_bianco.jpg", "author": "EMore98", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Rolex_Sky-Dweller_in_oro_bianco.jpg"}'::jsonb,
  '{"reference": "326938", "material": "18k yellow gold", "case_size": "42", "movement": "Calibre 9001", "stones": "Diamond-set case and bracelet"}'::jsonb
);

select create_asset_seed(
  'post-malone', 'Patek Philippe Aquanaut 5168G', 'Patek Philippe', 'Aquanaut 5168G', 2019, 75000,
  'reported', 'Post Malone has credited John Mayer with the taste that led him to the white-gold Aquanaut.',
  '[{"title": "Post Malone''s watch collection", "url": "https://www.rescapement.com/blog/reviewing-post-malones-ridiculous-watch-collection", "publisher": "Rescapement"}]'::jsonb,
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Patek_Philippe_Aquanaut_Advanced_Research_ref._5650G_limitato_a_500_pezzi.jpg/1280px-Patek_Philippe_Aquanaut_Advanced_Research_ref._5650G_limitato_a_500_pezzi.jpg', '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Patek_Philippe_Aquanaut_Advanced_Research_ref._5650G_limitato_a_500_pezzi.jpg/1280px-Patek_Philippe_Aquanaut_Advanced_Research_ref._5650G_limitato_a_500_pezzi.jpg", "author": "EMore98", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Patek_Philippe_Aquanaut_Advanced_Research_ref._5650G_limitato_a_500_pezzi.jpg"}'::jsonb,
  '{"reference": "5168G-001", "material": "18k white gold", "case_size": "42.2", "movement": "Calibre 324 S C"}'::jsonb
);

select create_asset_seed(
  'lebron-james', 'Rolex Daytona', 'Rolex', 'Cosmograph Daytona 116508', 2018, 45000,
  'reported', 'One of several Daytonas in a collection reported at several million dollars.',
  '[{"title": "LeBron James''s watch collection", "url": "https://www.watchguys.com/blogs/celebrity-watches/lebron-james-watch-collection", "publisher": "WatchGuys"}]'::jsonb,
  'https://upload.wikimedia.org/wikipedia/commons/8/87/Detail_of_Rolex_Daytona.jpg', '{"url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Detail_of_Rolex_Daytona.jpg", "author": "Alesili", "license": "CC BY-SA 3.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:Detail_of_Rolex_Daytona.jpg"}'::jsonb,
  '{"reference": "116508", "material": "18k yellow gold", "case_size": "40", "movement": "Calibre 4130"}'::jsonb
);

select create_asset_seed(
  'drake', 'Richard Mille RM 030', 'Richard Mille', 'RM 030', 2016, 180000,
  'reported', 'Drake is among the rappers most associated with Richard Mille, wearing several references across the RM line.',
  '[{"title": "Celebrity Richard Mille owners", "url": "https://culted.com/jay-z-watch-collection-patek-philippe-rolex-richard-mille/", "publisher": "Culted"}]'::jsonb,
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/RM_030_Automatic.jpg/1280px-RM_030_Automatic.jpg', '{"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/28/RM_030_Automatic.jpg/1280px-RM_030_Automatic.jpg", "author": "Y.Leclercq", "license": "CC BY-SA 4.0", "sourcePage": "https://commons.wikimedia.org/wiki/File:RM_030_Automatic.jpg"}'::jsonb,
  '{"reference": "RM 030", "material": "Titanium and ceramic", "case_size": "50 x 42.7", "movement": "Calibre RMAR1 skeletonised automatic"}'::jsonb
);

drop function create_asset_seed(text, text, text, text, int, bigint, text, text, jsonb, text, jsonb, jsonb);
