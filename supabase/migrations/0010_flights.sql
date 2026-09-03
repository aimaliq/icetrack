-- Recorded flights for tracked aircraft.
--
-- These come from OpenSky Network, which aggregates ADS-B — the position
-- broadcasts aircraft transmit in the clear and volunteer receivers pick up.
-- Nothing here is private data: it is what the aeroplane itself announces.
--
-- We keep our own copy because OpenSky's rate limits make querying on page
-- load impossible, not to build an archive: the site shows the last 30 days,
-- which is also as far back as OpenSky retains tracks. The collector prunes
-- anything older, so this table stays small and nothing accumulates a longer
-- movement history than the source itself offers.
--
-- OpenSky's terms are non-commercial use only.

create table if not exists flights (
  id            bigserial primary key,
  asset_id      uuid not null references assets(id) on delete cascade,
  icao24        text not null check (icao24 ~ '^[0-9a-f]{6}$'),

  -- Unix seconds, as OpenSky reports them.
  first_seen    bigint not null,
  last_seen     bigint not null,

  -- ICAO airport codes where OpenSky could infer them; often null for private
  -- flights into small fields.
  departure     text,
  arrival       text,

  -- [{time, lat, lon, altitude}, ...]
  path          jsonb not null default '[]'::jsonb,

  recorded_at   timestamptz not null default now(),

  -- One row per flight: the job re-runs over overlapping windows.
  unique (icao24, first_seen)
);

create index if not exists flights_asset_idx
  on flights(asset_id, last_seen desc);

comment on table flights is
  'ADS-B derived flight history from OpenSky Network. Non-commercial use only.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table flights enable row level security;

-- Anyone may read: this is public broadcast data attached to public entries.
create policy "flights are public"
  on flights for select
  using (true);

-- Nobody writes from the client. The collector uses the service role, which
-- bypasses RLS, so no insert policy is granted here on purpose: a contributor
-- must not be able to fabricate a flight path.

grant select on flights to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pruning
--
-- The site shows 30 days. Keeping more would quietly build a longer record of
-- where identified people have been than the source itself retains, which is
-- not what this is for.
-- ---------------------------------------------------------------------------
create or replace function prune_flights()
returns void language sql security definer set search_path = public as $$
  delete from flights
  where last_seen < extract(epoch from now() - interval '31 days');
$$;
