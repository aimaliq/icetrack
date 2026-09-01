-- Widen the celebrity categories.
--
-- The original six left obvious gaps. Royalty and heads of state own the most
-- expensive yachts and aircraft in the world and fitted nowhere. Crypto is
-- kept separate from Business deliberately: founders and executives already
-- belong there, while crypto wealth is its own scene with its own spending.
--
-- `media` keeps its value and gains a clearer label in the app: it always
-- meant online personalities rather than media companies.

alter type celebrity_category add value if not exists 'royalty';
alter type celebrity_category add value if not exists 'crypto';
alter type celebrity_category add value if not exists 'art';
