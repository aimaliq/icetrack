-- Category-specific details.
--
-- Every asset carried the same generic fields, so a jet and a house were
-- described identically. What matters differs by category: passengers and
-- range for aircraft, cabins and length for yachts, floor area and bedrooms
-- for property.
--
-- One jsonb column rather than a column per field. Which keys belong to which
-- category lives in src/lib/specs.ts, so adding a field is a code change
-- instead of a migration, and the assets table does not fill up with columns
-- that are null for four categories out of five.

alter table assets add column if not exists specs jsonb not null default '{}'::jsonb;

comment on column assets.specs is
  'Category-specific fields. Shape is defined by src/lib/specs.ts, not by the database.';

-- Carry specs through the edit and create functions.
create or replace function edit_asset(
  target_slug text,
  patch jsonb,
  summary text default null
)
returns void language plpgsql security invoker set search_path = public as $$
begin
  perform set_config('icetrack.edit_summary', left(coalesce(summary, ''), 300), true);

  update assets set
    name                = coalesce(patch->>'name', name),
    category            = coalesce((patch->>'category')::asset_category, category),
    make                = nullif(patch->>'make', ''),
    model               = nullif(patch->>'model', ''),
    year                = nullif(patch->>'year', '')::integer,
    registration        = nullif(patch->>'registration', ''),
    estimated_value_usd = nullif(patch->>'estimated_value_usd', '')::bigint,
    acquired_year       = nullif(patch->>'acquired_year', '')::integer,
    status              = coalesce((patch->>'status')::asset_status, status),
    confidence          = nullif(patch->>'confidence', '')::confidence_level,
    region              = nullif(patch->>'region', ''),
    summary             = nullif(patch->>'summary', ''),
    sources             = coalesce(patch->'sources', sources),
    image_url           = nullif(patch->>'image_url', ''),
    image_credit        = case
                            when patch ? 'image_credit' then patch->'image_credit'
                            else image_credit
                          end,
    image_is_representative =
      coalesce((patch->>'image_is_representative')::boolean, image_is_representative),
    specs               = coalesce(patch->'specs', specs)
  where slug = target_slug and not is_deleted;

  if not found then
    raise exception 'No entry found at %', target_slug;
  end if;
end;
$$;

create or replace function create_asset(patch jsonb, summary text default null)
returns text language plpgsql security invoker set search_path = public as $$
declare
  new_slug text;
  owner_id uuid;
  owner_name text;
begin
  perform set_config('icetrack.edit_summary', left(coalesce(summary, ''), 300), true);

  select id, name into owner_id, owner_name
  from celebrities
  where slug = patch->>'owner_slug' and not is_deleted;

  if owner_id is null then
    raise exception 'No such person: %', coalesce(patch->>'owner_slug', '(none)');
  end if;

  new_slug := unique_slug('assets', owner_name || ' ' || (patch->>'name'));

  insert into assets (
    slug, celebrity_id, category, name, make, model, year, registration,
    estimated_value_usd, acquired_year, status, confidence, region, summary,
    sources, image_url, image_credit, image_is_representative, specs, created_by
  ) values (
    new_slug,
    owner_id,
    (patch->>'category')::asset_category,
    patch->>'name',
    nullif(patch->>'make', ''),
    nullif(patch->>'model', ''),
    nullif(patch->>'year', '')::integer,
    nullif(patch->>'registration', ''),
    nullif(patch->>'estimated_value_usd', '')::bigint,
    nullif(patch->>'acquired_year', '')::integer,
    coalesce((patch->>'status')::asset_status, 'unverified'),
    nullif(patch->>'confidence', '')::confidence_level,
    nullif(patch->>'region', ''),
    nullif(patch->>'summary', ''),
    coalesce(patch->'sources', '[]'::jsonb),
    nullif(patch->>'image_url', ''),
    patch->'image_credit',
    coalesce((patch->>'image_is_representative')::boolean, false),
    coalesce(patch->'specs', '{}'::jsonb),
    auth.uid()
  );

  return new_slug;
end;
$$;
