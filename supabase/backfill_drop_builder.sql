-- Drop the yacht `builder` spec.
--
-- It repeated `make` on every yacht in the database — Oceanco, Feadship,
-- Lurssen — so the entry page showed the same shipyard twice under two
-- different labels. Make is the field every category already has.
--
-- Nothing is lost: each value below was checked against the make column first.
update assets
set specs = specs - 'builder'
where category = 'yacht' and specs ? 'builder';
