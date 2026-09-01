-- Image uploads.
--
-- Contributors upload the photo itself rather than linking one, so the site
-- hosts the file. That makes attribution a hard requirement, not a nicety:
-- the licences this project accepts (CC BY, CC BY-SA) oblige us to credit the
-- author, and an image whose author and licence are unknown cannot legally be
-- published here. The form enforces it, and `image_credit` stores it.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'asset-images',
  'asset-images',
  true,
  5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may look at the images; the entries they belong to are public.
create policy "asset images are public"
  on storage.objects for select
  using (bucket_id = 'asset-images');

-- Only signed-in, non-banned accounts may add one.
create policy "contributors upload asset images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'asset-images' and is_active_user());

-- Replacing an image is an edit like any other.
create policy "contributors replace asset images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'asset-images' and is_active_user());

-- Deleting is moderator-only, so a vandal cannot strip images from entries.
create policy "moderators delete asset images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'asset-images' and is_moderator());

-- ---------------------------------------------------------------------------
-- Carry image fields through the edit and create functions.
-- ---------------------------------------------------------------------------
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
      coalesce((patch->>'image_is_representative')::boolean, image_is_representative)
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
    sources, image_url, image_credit, image_is_representative, created_by
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
    auth.uid()
  );

  return new_slug;
end;
$$;

-- Celebrities take a portrait on the same terms.
create or replace function edit_celebrity(
  target_slug text,
  patch jsonb,
  summary text default null
)
returns void language plpgsql security invoker set search_path = public as $$
begin
  perform set_config('icetrack.edit_summary', left(coalesce(summary, ''), 300), true);

  update celebrities set
    name        = coalesce(patch->>'name', name),
    real_name   = nullif(patch->>'real_name', ''),
    category    = coalesce((patch->>'category')::celebrity_category, category),
    nationality = nullif(patch->>'nationality', ''),
    born_year   = nullif(patch->>'born_year', '')::integer,
    bio         = nullif(patch->>'bio', ''),
    wikipedia   = nullif(patch->>'wikipedia', ''),
    image_url   = nullif(patch->>'image_url', ''),
    image_credit = case
                     when patch ? 'image_credit' then patch->'image_credit'
                     else image_credit
                   end
  where slug = target_slug and not is_deleted;

  if not found then
    raise exception 'No entry found at %', target_slug;
  end if;
end;
$$;
