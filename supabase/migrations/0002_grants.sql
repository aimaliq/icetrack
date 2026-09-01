-- Grants for the Data API roles.
--
-- RLS policies decide WHICH ROWS a role may touch, but table-level GRANTs
-- decide whether the role may touch the table at all. Without these, every
-- request fails with 42501 "permission denied" before RLS is even evaluated.
--
-- The project was created with "Automatically expose new tables" disabled,
-- which is the safer setting — it means access is granted deliberately, here.

-- Public read access. RLS still filters out soft-deleted rows.
grant select on public.celebrities to anon, authenticated;
grant select on public.assets      to anon, authenticated;
grant select on public.profiles    to anon, authenticated;
grant select on public.revisions   to anon, authenticated;

-- Signed-in users can create and edit entries (open wiki model).
grant insert, update on public.celebrities to authenticated;
grant insert, update on public.assets      to authenticated;
grant update          on public.profiles    to authenticated;

-- Deletes are moderator-only, and that is enforced by the RLS policy;
-- the grant merely allows the attempt.
grant delete on public.celebrities to authenticated;
grant delete on public.assets      to authenticated;

-- Reports are the takedown channel: anonymous users must be able to file one.
grant insert         on public.reports to anon, authenticated;
grant select, update on public.reports to authenticated;

-- revisions is append-only from triggers. Deliberately no insert/update/delete
-- grant to any client role, so the audit trail cannot be forged or erased.

-- Sequence needed by revisions.id (bigserial), written by the trigger.
grant usage, select on all sequences in schema public to authenticated;
