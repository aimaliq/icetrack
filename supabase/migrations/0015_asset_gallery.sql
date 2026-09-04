-- Extra photos on an asset, beyond the main one.
--
-- An array on the row rather than a table: gallery photos are ordered,
-- edited as a set through the same form as everything else, and never
-- queried on their own — a join table would add machinery with nothing
-- to spend it on. Each item carries its own credit, because the licences
-- attach per photo, not per entry.
--
-- Shape of each element: { url, author?, license?, sourcePage? }.

alter table assets
  add column if not exists gallery jsonb not null default '[]'::jsonb;

comment on column assets.gallery is
  'Additional photos: [{url, author, license, sourcePage}]. The main photo stays in image_url.';

-- Carry the gallery through edits. Same body as 0009 plus the one line.
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
    specs               = coalesce(patch->'specs', specs),
    gallery             = case
                            when patch ? 'gallery' then patch->'gallery'
                            else gallery
                          end
  where slug = target_slug and not is_deleted;

  if not found then
    raise exception 'No entry found at %', target_slug;
  end if;
end;
$$;

grant execute on function edit_asset(text, jsonb, text) to authenticated;
