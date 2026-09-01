-- Merge `watch` and `jewelry` into a single `accessories` category.
--
-- The application made this merge in commit 3169488; the enum here still
-- carried the original six values. Left as-is, every write from the app fails
-- because 'accessories' is not a member of asset_category.
--
-- Postgres cannot drop a value from an enum, so the type is rebuilt.

-- 1. New type with the intended values.
create type asset_category_new as enum
  ('jet', 'car', 'accessories', 'yacht', 'estate');

-- 2. Point existing rows at the merged value, then swap the column over.
alter table assets
  alter column category type asset_category_new
  using (
    case category::text
      when 'watch'   then 'accessories'
      when 'jewelry' then 'accessories'
      else category::text
    end
  )::asset_category_new;

-- 3. Retire the old type and take its name.
drop type asset_category;
alter type asset_category_new rename to asset_category;

-- The partial index on category was dropped along with the column rewrite.
create index if not exists assets_category_idx
  on assets(category) where not is_deleted;

-- ---------------------------------------------------------------------------
-- Image attribution.
--
-- Commons licences (CC BY, CC BY-SA) require credit, so an image whose author
-- and licence are unknown cannot legally be published. The JSON dataset
-- carries this as `imageCredit`; without a column it would be lost on import.
-- ---------------------------------------------------------------------------
alter table celebrities add column if not exists image_credit jsonb;
alter table assets      add column if not exists image_credit jsonb;

-- True when the photo shows the model generally, not the specific item owned.
alter table assets
  add column if not exists image_is_representative boolean not null default false;
