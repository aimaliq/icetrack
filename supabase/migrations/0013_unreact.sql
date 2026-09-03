-- Removing a reaction.
--
-- Reactions are one per visitor: picking a second replaces the first, and
-- clicking the same one again clears it. Both need a way to take a count back
-- down, which `react` alone cannot do.
--
-- Like `react`, this is a function rather than an update grant, so the only
-- possible write is "subtract one from a counter that exists". The count can
-- never go below zero, and nobody can set it to an arbitrary value.

create or replace function unreact(target_slug text, chosen text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  target uuid;
  total integer;
begin
  if chosen not in ('heart_eyes', 'heart', 'wow', 'money', 'thumbs_down', 'poop') then
    raise exception 'Unknown reaction';
  end if;

  select id into target from assets where slug = target_slug and not is_deleted;
  if target is null then
    raise exception 'No entry at %', target_slug;
  end if;

  update reactions
  set count = greatest(0, count - 1)
  where asset_id = target and emoji = chosen
  returning count into total;

  -- Nothing to take away from is not an error: a visitor whose stored choice
  -- has outlived the count should not see a failure.
  return coalesce(total, 0);
end;
$$;

grant execute on function unreact(text, text) to anon, authenticated;
