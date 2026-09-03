-- One-off: fill in category details for the entries that predate the specs
-- column.
--
-- Mostly manufacturer figures for the model rather than measurements of the
-- individual item. The exception is the 767's passenger count: press coverage
-- of this specific aircraft reports roughly 30 seats in its VIP layout, well
-- down from the 200-plus of the airline configuration it was converted from.
--
-- The Gulfstream entry is left empty on purpose: its own summary says the
-- model is unconfirmed, and "a Gulfstream" spans aircraft from 10 to 19 seats
-- with very different range. Inventing plausible numbers is exactly what this
-- database exists not to do.

update assets set specs = '{
  "passengers": "30",
  "range": "6590",
  "engines": "2 × General Electric CF6-80C2"
}'::jsonb where slug = 'drake-boeing-767';

update assets set specs = '{
  "engine": "8.0 L quad-turbo W16",
  "power": "1001",
  "top_speed": "407",
  "zero_to_100": "2.5",
  "production": "450"
}'::jsonb where slug = 'floyd-mayweather-bugatti-veyron';

update assets set specs = '{
  "engine": "6.0 L twin-turbo V12",
  "power": "612",
  "top_speed": "250"
}'::jsonb where slug = 'kim-kardashian-maybach';

update assets set specs = '{
  "reference": "2499/101J",
  "material": "Yellow gold",
  "case_size": "37.8",
  "movement": "Calibre 13-130 Q"
}'::jsonb where slug = 'jay-z-patek-philippe';
