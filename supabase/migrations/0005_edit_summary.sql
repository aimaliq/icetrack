-- Record the edit summary, and count contributions consistently.
--
-- Two gaps in record_revision():
--
-- 1. `revisions.edit_summary` was never written, so the column stayed null on
--    every row. A wiki history without "why" is much less useful — it is the
--    field reviewers read first when scanning recent changes.
--
-- 2. `edit_count` was incremented on UPDATE but not on INSERT, so creating an
--    entry did not count as a contribution. The contributors leaderboard reads
--    this column, and it should reflect all work, not just corrections.
--
-- The summary travels in a transaction-local GUC set by the app immediately
-- before the write: `select set_config('icetrack.edit_summary', $1, true)`.
-- `true` scopes it to the transaction, so it cannot leak into another request.

create or replace function record_revision()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  summary text := nullif(current_setting('icetrack.edit_summary', true), '');
begin
  -- Defence in depth: the column allows 300 characters, and a client that
  -- skips validation should not abort the write with a constraint error.
  if summary is not null then
    summary := left(summary, 300);
  end if;

  if tg_op = 'INSERT' then
    insert into revisions(table_name, record_id, operation, before, after, edited_by, edit_summary)
    values (tg_table_name, new.id, 'insert', null, to_jsonb(new), auth.uid(), summary);
    update profiles set edit_count = edit_count + 1 where id = auth.uid();
    return new;
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    insert into revisions(table_name, record_id, operation, before, after, edited_by, edit_summary)
    values (tg_table_name, new.id, 'update', to_jsonb(old), to_jsonb(new), auth.uid(), summary);
    update profiles set edit_count = edit_count + 1 where id = auth.uid();
    return new;
  end if;
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Contributor leaderboard.
--
-- A view rather than a client-side aggregate: counting revisions per user in
-- the browser would mean shipping the whole revision log to render a
-- leaderboard. `security_invoker` keeps the caller's RLS in force.
-- ---------------------------------------------------------------------------
create or replace view contributor_stats
with (security_invoker = true) as
  select
    p.id,
    p.username,
    p.display_name,
    p.role,
    p.created_at,
    count(r.id)                                      as edits,
    count(*) filter (where r.operation = 'insert')   as creations,
    max(r.created_at)                                as last_edit_at
  from profiles p
  left join revisions r on r.edited_by = p.id
  where not p.is_banned
  group by p.id, p.username, p.display_name, p.role, p.created_at;

grant select on contributor_stats to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Edit entry points.
--
-- PostgREST runs every request in its own transaction, so a transaction-local
-- GUC set by one call is already gone by the next. The summary and the write
-- therefore have to travel together, in a single function.
--
-- These are `security invoker`: RLS, the rate limit and the location check all
-- still apply as if the user had written the row directly.
-- ---------------------------------------------------------------------------
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
    wikipedia   = nullif(patch->>'wikipedia', '')
  where slug = target_slug and not is_deleted;

  if not found then
    raise exception 'No entry found at %', target_slug;
  end if;
end;
$$;

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
    sources             = coalesce(patch->'sources', sources)
  where slug = target_slug and not is_deleted;

  if not found then
    raise exception 'No entry found at %', target_slug;
  end if;
end;
$$;

grant execute on function edit_celebrity(text, jsonb, text) to authenticated;
grant execute on function edit_asset(text, jsonb, text)      to authenticated;
