-- Emoji reactions on entries.
--
-- Anyone can react, signed in or not. The bar to leaving one has to be lower
-- than the bar to editing, or nobody leaves one — and unlike an edit, a
-- reaction asserts nothing about the world, so an anonymous one costs the
-- database no credibility.
--
-- Counts are stored per emoji rather than one row per vote. That means no
-- record of who reacted to what, which is the right default for a site about
-- other people's private property: there is nothing to leak and nothing to
-- subpoena. The trade is that a person can react repeatedly; the client keeps
-- its own choice in localStorage, which discourages the casual case without
-- pretending to be a real defence.

create table if not exists reactions (
  asset_id  uuid not null references assets(id) on delete cascade,
  emoji     text not null,
  count     integer not null default 0 check (count >= 0),
  primary key (asset_id, emoji)
);

comment on table reactions is
  'Per-emoji counts. Deliberately holds no identity: nobody is recorded as having reacted.';

alter table reactions enable row level security;

create policy "reactions are public"
  on reactions for select
  using (true);

grant select on reactions to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Adding a reaction
--
-- A function rather than an insert grant, so the only write anyone can make is
-- "add one to a counter I am allowed to add to". Nobody can set a count, write
-- an arbitrary emoji, or reduce someone else's.
-- ---------------------------------------------------------------------------
create or replace function react(target_slug text, chosen text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  target uuid;
  total integer;
begin
  -- The set is fixed here, not passed in: an open emoji field is an open text
  -- field, and this one is written to by anonymous callers.
  if chosen not in ('heart_eyes', 'heart', 'wow', 'money', 'thumbs_down', 'poop') then
    raise exception 'Unknown reaction';
  end if;

  select id into target from assets where slug = target_slug and not is_deleted;
  if target is null then
    raise exception 'No entry at %', target_slug;
  end if;

  insert into reactions (asset_id, emoji, count)
  values (target, chosen, 1)
  on conflict (asset_id, emoji)
  do update set count = reactions.count + 1
  returning count into total;

  return total;
end;
$$;

grant execute on function react(text, text) to anon, authenticated;
