-- Creating new entries from the site.
--
-- Editing alone cannot grow the database, so contributors need to add figures
-- and assets too. Same guarantees as edit_celebrity/edit_asset: `security
-- invoker`, so RLS, the hourly rate limit and the location check all apply.

-- ---------------------------------------------------------------------------
-- Slug generation.
--
-- Slugs are derived rather than typed: asking a contributor for a URL fragment
-- invites collisions and typos, and the column has a strict format check.
-- Accented characters are folded to ASCII so "Beyoncé" yields "beyonce".
-- ---------------------------------------------------------------------------
create or replace function slugify(input text)
returns text language sql immutable as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(unaccent_fallback(input)),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

-- `unaccent` lives in an extension that may not be enabled, so fold the common
-- Latin-1 range by hand. Anything left unmapped is stripped by slugify.
create or replace function unaccent_fallback(input text)
returns text language sql immutable as $$
  select translate(
    input,
    'àáâãäåāăąèéêëēĕėęěìíîïĩīĭįıòóôõöøōŏőùúûüũūŭůűųçćĉċčñńņňŕřśŝşšţťýÿŷžźż',
    'aaaaaaaaaeeeeeeeeeiiiiiiiiiooooooooouuuuuuuuuucccccnnnnrrssssttyyyzzz'
  );
$$;

/**
 * Claim a unique slug for a table, appending -2, -3 … on collision.
 */
create or replace function unique_slug(target_table text, base text)
returns text language plpgsql stable as $$
declare
  candidate text := nullif(slugify(base), '');
  suffix integer := 1;
  taken boolean;
begin
  if candidate is null then
    raise exception 'Name must contain at least one letter or number';
  end if;

  loop
    if target_table = 'celebrities' then
      select exists(select 1 from celebrities where slug = candidate) into taken;
    else
      select exists(select 1 from assets where slug = candidate) into taken;
    end if;

    exit when not taken;
    suffix := suffix + 1;
    candidate := slugify(base) || '-' || suffix;
  end loop;

  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Creation entry points. Both return the new slug so the app can redirect.
-- ---------------------------------------------------------------------------
create or replace function create_celebrity(patch jsonb, summary text default null)
returns text language plpgsql security invoker set search_path = public as $$
declare
  new_slug text;
begin
  perform set_config('icetrack.edit_summary', left(coalesce(summary, ''), 300), true);
  new_slug := unique_slug('celebrities', patch->>'name');

  insert into celebrities (
    slug, name, real_name, category, nationality, born_year, bio, wikipedia,
    created_by
  ) values (
    new_slug,
    patch->>'name',
    nullif(patch->>'real_name', ''),
    (patch->>'category')::celebrity_category,
    nullif(patch->>'nationality', ''),
    nullif(patch->>'born_year', '')::integer,
    nullif(patch->>'bio', ''),
    nullif(patch->>'wikipedia', ''),
    auth.uid()
  );

  return new_slug;
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

  -- Prefix with the owner so "Gulfstream G650" stays distinct between people.
  new_slug := unique_slug('assets', owner_name || ' ' || (patch->>'name'));

  insert into assets (
    slug, celebrity_id, category, name, make, model, year, registration,
    estimated_value_usd, acquired_year, status, confidence, region, summary,
    sources, created_by
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
    auth.uid()
  );

  return new_slug;
end;
$$;

grant execute on function slugify(text)                      to authenticated;
grant execute on function unaccent_fallback(text)            to authenticated;
grant execute on function unique_slug(text, text)            to authenticated;
grant execute on function create_celebrity(jsonb, text)      to authenticated;
grant execute on function create_asset(jsonb, text)          to authenticated;
