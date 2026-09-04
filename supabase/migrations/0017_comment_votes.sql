-- Votes on comments.
--
-- One vote per account per comment, up or down, changeable and retractable.
-- Votes order the discussion, so unlike the anonymous reaction counters they
-- need integrity: a row per voter, keyed to the session, no double counting.
--
-- Who voted on what is nobody's business but the voter's: row-level access
-- is restricted to your own votes, and totals flow through a view that
-- aggregates before anything leaves the table. The view intentionally runs
-- with owner rights - that is what lets it sum rows the caller may not see,
-- while exposing nothing but comment_id and the sum.

create table if not exists comment_votes (
  comment_id uuid not null references comments(id) on delete cascade,
  voter_id   uuid not null references profiles(id) on delete cascade,
  value      smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (comment_id, voter_id)
);

alter table comment_votes enable row level security;

-- Your own votes only: the UI needs "which way did I vote", nothing more.
create policy "voters see their own votes"
  on comment_votes for select
  to authenticated
  using (voter_id = auth.uid());

create policy "voters cast their own votes"
  on comment_votes for insert
  to authenticated
  with check (voter_id = auth.uid() and is_active_user());

create policy "voters change their own votes"
  on comment_votes for update
  to authenticated
  using (voter_id = auth.uid());

create policy "voters retract their own votes"
  on comment_votes for delete
  to authenticated
  using (voter_id = auth.uid());

grant select, insert, update, delete on comment_votes to authenticated;

-- Aggregate scores, readable by everyone. Owner rights by design: see above.
create or replace view comment_scores as
  select comment_id, coalesce(sum(value), 0)::integer as score
  from comment_votes
  group by comment_id;

grant select on comment_scores to anon, authenticated;
