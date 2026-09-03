-- Grants for the flights table.
--
-- Migration 0004 granted the service role everything in the schema and set
-- default privileges for tables created later. Default privileges only apply
-- to tables created by the same role that set them, though, and `flights` was
-- created from the SQL editor — so it inherited nothing and the collector's
-- writes failed with 42501, permission denied.
--
-- The symptom was a request that ran until the platform timed it out rather
-- than an error, because the failure happened per row inside the loop.

grant all privileges on table flights to service_role;
grant usage, select on sequence flights_id_seq to service_role;

grant execute on function prune_flights() to service_role;

-- Any table added from the SQL editor from now on needs the same treatment;
-- repeating the blanket grant is the reliable way to catch them.
grant all privileges on all tables    in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;
