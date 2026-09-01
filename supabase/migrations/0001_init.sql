-- IceTrack — initial schema
-- Model: open wiki. Any verified user can create and edit entries.
-- Every write is recorded in a revision, so vandalism is reversible.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('user', 'moderator', 'admin');
create type asset_category as enum ('jet', 'car', 'watch', 'yacht', 'estate', 'jewelry');
create type asset_status as enum ('verified', 'reported', 'unverified', 'former', 'disputed');
create type confidence_level as enum ('high', 'medium', 'low');
create type celebrity_category as enum ('music', 'sports', 'film', 'business', 'fashion', 'media');
create type report_reason as enum ('inaccurate', 'unsourced', 'privacy', 'defamatory', 'spam', 'other');
create type report_status as enum ('open', 'reviewing', 'resolved', 'rejected');

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  display_name text check (char_length(display_name) <= 60),
  role user_role not null default 'user',
  edit_count integer not null default 0,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column profiles.role is
  'Never writable by the user. Enforced by the trigger below, not only by RLS.';

-- ---------------------------------------------------------------------------
-- celebrities
-- ---------------------------------------------------------------------------
create table celebrities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  real_name text check (char_length(real_name) <= 160),
  category celebrity_category not null,
  nationality text check (char_length(nationality) <= 80),
  born_year integer check (born_year between 1900 and 2100),
  bio text check (char_length(bio) <= 600),
  image_url text,
  wikipedia text,
  is_deleted boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- assets
-- ---------------------------------------------------------------------------
create table assets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  celebrity_id uuid not null references celebrities(id) on delete cascade,
  category asset_category not null,
  name text not null check (char_length(name) between 2 and 120),
  make text check (char_length(make) <= 80),
  model text check (char_length(model) <= 80),
  year integer check (year between 1900 and 2100),
  registration text check (char_length(registration) <= 40),
  estimated_value_usd bigint check (estimated_value_usd >= 0),
  acquired_year integer check (acquired_year between 1900 and 2100),
  status asset_status not null default 'unverified',
  confidence confidence_level,
  -- Country or state only. Precise locations are rejected by the trigger below.
  region text check (char_length(region) <= 80),
  summary text check (char_length(summary) <= 600),
  image_url text,
  sources jsonb not null default '[]'::jsonb,
  is_deleted boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- A published claim must carry at least one source.
  constraint published_needs_source check (
    status in ('unverified', 'disputed') or jsonb_array_length(sources) > 0
  )
);

create index assets_celebrity_idx on assets(celebrity_id) where not is_deleted;
create index assets_category_idx on assets(category) where not is_deleted;
create index celebrities_slug_idx on celebrities(slug) where not is_deleted;

-- ---------------------------------------------------------------------------
-- revisions — the audit trail. Without this, vandalism is unrecoverable.
-- ---------------------------------------------------------------------------
create table revisions (
  id bigserial primary key,
  table_name text not null check (table_name in ('celebrities', 'assets')),
  record_id uuid not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  before jsonb,
  after jsonb,
  edited_by uuid references profiles(id) on delete set null,
  edit_summary text check (char_length(edit_summary) <= 300),
  created_at timestamptz not null default now()
);

create index revisions_record_idx on revisions(table_name, record_id, created_at desc);

-- ---------------------------------------------------------------------------
-- reports — how the community flags bad entries
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  table_name text not null check (table_name in ('celebrities', 'assets')),
  record_id uuid not null,
  reason report_reason not null,
  details text check (char_length(details) <= 1000),
  status report_status not null default 'open',
  -- Nullable: subjects and their representatives must be able to report
  -- without creating an account.
  reported_by uuid references profiles(id) on delete set null,
  contact_email text,
  resolved_by uuid references profiles(id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index reports_open_idx on reports(status, created_at desc);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function is_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('moderator', 'admin') and not is_banned
  );
$$;

create or replace function is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and not is_banned
  );
$$;

-- ---------------------------------------------------------------------------
-- Privilege escalation guard.
-- RLS alone is not enough here: a user with UPDATE on their own profile row
-- could otherwise set role = 'admin'. This blocks it in the database itself.
-- ---------------------------------------------------------------------------
create or replace function protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_moderator() then
    new.role := old.role;
    new.is_banned := old.is_banned;
    new.edit_count := old.edit_count;
  end if;
  -- Nobody, moderators included, may grant themselves a higher role.
  if new.role <> old.role and new.id = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;
  return new;
end;
$$;

create trigger protect_profile_fields_trg
  before update on profiles
  for each row execute function protect_profile_fields();

-- ---------------------------------------------------------------------------
-- Privacy guard: no precise locations, ever.
-- This is a hard editorial rule, so it lives in the database rather than
-- relying on the client to behave.
-- ---------------------------------------------------------------------------
create or replace function reject_precise_location()
returns trigger language plpgsql as $$
declare
  haystack text := coalesce(new.region, '') || ' ' || coalesce(new.summary, '');
begin
  if haystack ~* '\m\d{1,5}\s+[A-Za-z][A-Za-z\.]*\s*(street|st|road|rd|avenue|ave|drive|dr|lane|ln|boulevard|blvd|way|court|ct)\M' then
    raise exception 'Precise street addresses are not allowed in IceTrack';
  end if;
  -- Bare latitude/longitude pairs.
  if haystack ~ '\m-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\M' then
    raise exception 'Coordinates are not allowed in IceTrack';
  end if;
  return new;
end;
$$;

create trigger assets_reject_location_trg
  before insert or update on assets
  for each row execute function reject_precise_location();

-- ---------------------------------------------------------------------------
-- Revision recording + updated_at
-- ---------------------------------------------------------------------------
create or replace function record_revision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into revisions(table_name, record_id, operation, before, after, edited_by)
    values (tg_table_name, new.id, 'insert', null, to_jsonb(new), auth.uid());
    return new;
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
    insert into revisions(table_name, record_id, operation, before, after, edited_by)
    values (tg_table_name, new.id, 'update', to_jsonb(old), to_jsonb(new), auth.uid());
    update profiles set edit_count = edit_count + 1 where id = auth.uid();
    return new;
  end if;
  return null;
end;
$$;

create trigger celebrities_revision_trg
  after insert on celebrities
  for each row execute function record_revision();
create trigger celebrities_revision_upd_trg
  before update on celebrities
  for each row execute function record_revision();

create trigger assets_revision_trg
  after insert on assets
  for each row execute function record_revision();
create trigger assets_revision_upd_trg
  before update on assets
  for each row execute function record_revision();

-- ---------------------------------------------------------------------------
-- Rate limit: caps how much damage one account can do per hour.
-- ---------------------------------------------------------------------------
create or replace function enforce_edit_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent integer;
begin
  if is_moderator() then
    return new;
  end if;
  select count(*) into recent
  from revisions
  where edited_by = auth.uid() and created_at > now() - interval '1 hour';

  if recent >= 30 then
    raise exception 'Edit rate limit reached (30/hour). Try again later.';
  end if;
  return new;
end;
$$;

create trigger assets_rate_limit_trg
  before insert or update on assets
  for each row execute function enforce_edit_rate_limit();
create trigger celebrities_rate_limit_trg
  before insert or update on celebrities
  for each row execute function enforce_edit_rate_limit();

-- ---------------------------------------------------------------------------
-- Auto-create a profile on signup
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(replace(new.id::text, '-', ''), 1, 12)
    ),
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===========================================================================
-- Row Level Security
-- Every table is deny-by-default; each policy below opens exactly one door.
-- ===========================================================================
alter table profiles    enable row level security;
alter table celebrities enable row level security;
alter table assets      enable row level security;
alter table revisions   enable row level security;
alter table reports     enable row level security;

-- --- profiles --------------------------------------------------------------
create policy "profiles are public"
  on profiles for select using (true);

create policy "users update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- Note: role/is_banned are stripped by protect_profile_fields_trg above.

create policy "moderators update any profile"
  on profiles for update
  using (is_moderator());

-- --- celebrities -----------------------------------------------------------
create policy "published celebrities are public"
  on celebrities for select
  using (not is_deleted or is_moderator());

create policy "verified users create celebrities"
  on celebrities for insert
  to authenticated
  with check (is_active_user() and created_by = auth.uid());

create policy "verified users edit celebrities"
  on celebrities for update
  to authenticated
  using (is_active_user() and not is_deleted)
  with check (is_active_user());

-- Hard delete is reserved for moderators; everyone else soft-deletes.
create policy "moderators delete celebrities"
  on celebrities for delete
  to authenticated
  using (is_moderator());

-- --- assets ----------------------------------------------------------------
create policy "published assets are public"
  on assets for select
  using (not is_deleted or is_moderator());

create policy "verified users create assets"
  on assets for insert
  to authenticated
  with check (is_active_user() and created_by = auth.uid());

create policy "verified users edit assets"
  on assets for update
  to authenticated
  using (is_active_user() and not is_deleted)
  with check (is_active_user());

create policy "moderators delete assets"
  on assets for delete
  to authenticated
  using (is_moderator());

-- --- revisions -------------------------------------------------------------
-- Public history is the whole point: anyone can audit any change.
create policy "revisions are public"
  on revisions for select using (true);
-- No insert/update/delete policy: only the SECURITY DEFINER trigger writes here,
-- so the audit trail cannot be forged or erased from the client.

-- --- reports ---------------------------------------------------------------
-- Anyone may file a report, including anonymous subjects and their
-- representatives. This is the takedown channel, so it must not require login.
create policy "anyone can file a report"
  on reports for insert
  to anon, authenticated
  with check (status = 'open' and resolved_by is null);

create policy "users see own reports"
  on reports for select
  to authenticated
  using (reported_by = auth.uid() or is_moderator());

create policy "moderators handle reports"
  on reports for update
  to authenticated
  using (is_moderator());

-- ---------------------------------------------------------------------------
-- Rollback helper: restore a record to a previous revision.
-- Moderators only — this is the anti-vandalism tool.
-- ---------------------------------------------------------------------------
create or replace function revert_to_revision(revision_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare
  rev revisions%rowtype;
begin
  if not is_moderator() then
    raise exception 'Only moderators can revert revisions';
  end if;

  select * into rev from revisions where id = revision_id;
  if not found then
    raise exception 'Revision % not found', revision_id;
  end if;
  if rev.before is null then
    raise exception 'Revision % has no prior state to restore', revision_id;
  end if;

  if rev.table_name = 'assets' then
    update assets set
      name = rev.before->>'name',
      make = rev.before->>'make',
      model = rev.before->>'model',
      status = (rev.before->>'status')::asset_status,
      summary = rev.before->>'summary',
      region = rev.before->>'region',
      sources = coalesce(rev.before->'sources', '[]'::jsonb),
      is_deleted = coalesce((rev.before->>'is_deleted')::boolean, false)
    where id = rev.record_id;
  elsif rev.table_name = 'celebrities' then
    update celebrities set
      name = rev.before->>'name',
      real_name = rev.before->>'real_name',
      bio = rev.before->>'bio',
      nationality = rev.before->>'nationality',
      is_deleted = coalesce((rev.before->>'is_deleted')::boolean, false)
    where id = rev.record_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Full-text search
-- ---------------------------------------------------------------------------
create index assets_search_idx on assets
  using gin (to_tsvector('simple',
    coalesce(name,'') || ' ' || coalesce(make,'') || ' ' || coalesce(model,'')));

create index celebrities_search_idx on celebrities
  using gin (to_tsvector('simple',
    coalesce(name,'') || ' ' || coalesce(real_name,'')));
