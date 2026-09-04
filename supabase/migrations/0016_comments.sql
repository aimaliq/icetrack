-- Discussion threads on assets.
--
-- Reddit-shaped: comments nest under a parent, and removing one leaves a
-- tombstone rather than orphaning its replies. Writing requires an account
-- in good standing — unlike a reaction, a comment asserts something, and
-- the site's credibility depends on being able to say who asserted it.
--
-- Nothing is hard deleted, matching the rest of the schema: authors and
-- moderators flip is_deleted, and the body stays recoverable for moderation.

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  asset_id   uuid not null references assets(id) on delete cascade,
  parent_id  uuid references comments(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comments_asset_idx on comments (asset_id, created_at);

alter table comments enable row level security;

-- Read: public, like the entries they discuss. Tombstones stay visible so
-- threads keep their shape; the UI renders them as "[removed]".
create policy "comments are public"
  on comments for select
  using (true);

-- Write: signed-in, non-banned, and only as yourself.
create policy "contributors comment"
  on comments for insert
  to authenticated
  with check (author_id = auth.uid() and is_active_user());

-- The only edit is removal: authors their own, moderators any. A policy
-- cannot compare old and new rows, so the trigger below pins everything
-- except is_deleted.
create policy "authors and moderators remove comments"
  on comments for update
  to authenticated
  using (author_id = auth.uid() or is_moderator());

create or replace function comments_guard()
returns trigger language plpgsql as $$
begin
  if new.body       is distinct from old.body
     or new.author_id  is distinct from old.author_id
     or new.asset_id   is distinct from old.asset_id
     or new.parent_id  is distinct from old.parent_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Comments cannot be edited, only removed';
  end if;
  return new;
end;
$$;

create trigger comments_guard_trg
  before update on comments
  for each row execute function comments_guard();

-- A reply must sit under a comment on the same asset, or threads leak
-- across entries.
create or replace function comments_parent_check()
returns trigger language plpgsql as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from comments where id = new.parent_id and asset_id = new.asset_id
  ) then
    raise exception 'Parent comment is not on this entry';
  end if;
  return new;
end;
$$;

create trigger comments_parent_trg
  before insert on comments
  for each row execute function comments_parent_check();

-- Five comments a minute is conversation; more is flooding.
create or replace function comments_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent integer;
begin
  if is_moderator() then return new; end if;
  select count(*) into recent from comments
  where author_id = auth.uid() and created_at > now() - interval '1 minute';
  if recent >= 5 then
    raise exception 'You are commenting too fast. Wait a minute.';
  end if;
  return new;
end;
$$;

create trigger comments_rate_trg
  before insert on comments
  for each row execute function comments_rate_limit();

grant select on comments to anon, authenticated;
grant insert, update on comments to authenticated;
