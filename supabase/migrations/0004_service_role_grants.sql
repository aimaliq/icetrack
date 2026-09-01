-- Grants for the service role.
--
-- The project was created with "Automatically expose new tables" disabled, so
-- no role receives privileges implicitly — service_role included. It bypasses
-- RLS, but RLS is only consulted after table-level GRANTs pass, so without
-- these the seed import fails with 42501 "permission denied for table".
--
-- This role is never used by the website. It is reserved for trusted
-- server-side maintenance: the one-off dataset import, and future backfills.

grant usage on schema public to service_role;

grant all privileges on all tables    in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- Tables added later should inherit the same access.
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;
