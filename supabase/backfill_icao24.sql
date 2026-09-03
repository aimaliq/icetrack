-- One-off: record the ICAO 24-bit transponder address for each tracked jet.
--
-- ADS-B messages carry this address rather than the tail number painted on the
-- aircraft, so it is what a flight lookup needs. US registrations encode it
-- arithmetically, but the FAA scheme is awkward enough that deriving it in code
-- was not worth the risk of getting it wrong and mapping the wrong aircraft.
-- These were read off the public trackers by hand.
--
-- Two are outside the US block and have no formula at all: LX-GOL is
-- Luxembourg-registered, PR-SMK Brazilian.
--
-- The field is now part of the jet spec form, so anyone adding an aircraft
-- supplies it and the map works without a step like this.

update assets set specs = specs || '{"icao24":"a835af"}'::jsonb
  where slug = 'elon-musk-gulfstream-g650er';        -- N628TS

update assets set specs = specs || '{"icao24":"a21fe6"}'::jsonb
  where slug = 'michael-jordan-gulfstream-g650er';   -- N236MJ

update assets set specs = specs || '{"icao24":"a22b0b"}'::jsonb
  where slug = 'michael-jordan-gulfstream-g550';     -- N239MJ

update assets set specs = specs || '{"icao24":"ab013e"}'::jsonb
  where slug = 'tom-cruise-gulfstream-iv';           -- N808T

update assets set specs = specs || '{"icao24":"a3e6f0"}'::jsonb
  where slug = 'tom-cruise-challenger-300';          -- N350XX

update assets set specs = specs || '{"icao24":"aa688a"}'::jsonb
  where slug = 'tom-cruise-hondajet';                -- N77VA

update assets set specs = specs || '{"icao24":"a65f8f"}'::jsonb
  where slug = 'tom-cruise-p51-mustang';             -- N51EW

update assets set specs = specs || '{"icao24":"4d0226"}'::jsonb
  where slug = 'cristiano-ronaldo-global-express';   -- LX-GOL

update assets set specs = specs || '{"icao24":"e4835d"}'::jsonb
  where slug = 'neymar-citation-sovereign';          -- PR-SMK
