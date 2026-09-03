-- Page view counts.
--
-- A single number per page, incremented on each visit. No visitor identity, no
-- timestamps, no addresses — nothing that could be turned into a record of who
-- looked at whom. That rules out unique-visitor counts, which is a fair trade
-- on a site about other people's property.
--
-- Views are stored by table and slug rather than by foreign key, so a count
-- survives an entry being renamed or removed and comes back if it returns.

create table if not exists page_views (
  table_name text not null check (table_name in ('celebrities', 'assets')),
  slug       text not null,
  count      bigint not null default 0 check (count >= 0),
  primary key (table_name, slug)
);

comment on table page_views is
  'Per-page view counts. Holds no visitor identity by design.';

alter table page_views enable row level security;

create policy "view counts are public"
  on page_views for select
  using (true);

grant select on page_views to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Recording a view
--
-- A function rather than an insert grant, so the only possible write is
-- "add one to a counter for a page that exists".
-- ---------------------------------------------------------------------------
create or replace function record_view(target_table text, target_slug text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  total bigint;
  found boolean;
begin
  if target_table not in ('celebrities', 'assets') then
    raise exception 'Unknown page type';
  end if;

  -- Refuse to open a counter for a page that does not exist, so the table
  -- cannot be filled with junk slugs.
  if target_table = 'celebrities' then
    select exists(select 1 from celebrities where slug = target_slug and not is_deleted)
      into found;
  else
    select exists(select 1 from assets where slug = target_slug and not is_deleted)
      into found;
  end if;

  if not found then
    return 0;
  end if;

  insert into page_views (table_name, slug, count)
  values (target_table, target_slug, 1)
  on conflict (table_name, slug)
  do update set count = page_views.count + 1
  returning count into total;

  return total;
end;
$$;

grant execute on function record_view(text, text) to anon, authenticated;
