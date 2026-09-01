# Database

## Applying the schema

Open the Supabase dashboard → **SQL Editor** → paste the contents of
`migrations/0001_init.sql` → **Run**.

Then import the existing JSON dataset:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_secret_key npx tsx scripts/migrate-to-supabase.ts
```

The service role key is in Project Settings → API. **Never commit it** and
never put it in a `NEXT_PUBLIC_` variable — it bypasses Row Level Security
entirely.

## Model

IceTrack is an open wiki: any signed-in, non-banned user can create and edit
entries, and every write is recorded in `revisions`. Nothing is ever hard
deleted by regular users — `is_deleted` hides a record while keeping it
recoverable.

| Table | Who can read | Who can write |
| --- | --- | --- |
| `profiles` | everyone | own row only (role/ban fields are trigger-protected) |
| `celebrities` | everyone (unless deleted) | any signed-in user |
| `assets` | everyone (unless deleted) | any signed-in user |
| `revisions` | everyone | nobody — written only by triggers |
| `reports` | own reports + moderators | anyone, including anonymous |

## Safety mechanisms

These live in the database rather than in application code, so a bug in the
client cannot bypass them.

- **`protect_profile_fields_trg`** — strips `role`, `is_banned` and
  `edit_count` from user-initiated updates, and refuses any attempt to change
  your own role. Without this, RLS alone would let a user grant themselves
  admin.
- **`reject_precise_location`** — rejects street addresses and coordinates on
  insert and update. Cataloguing what someone owns is public interest; a map to
  their front door is a safety risk.
- **`enforce_edit_rate_limit`** — 30 edits per hour for non-moderators, which
  caps how much damage a single compromised or malicious account can do.
- **`published_needs_source`** — a row cannot be `verified` or `reported`
  without at least one source.
- **`revert_to_revision(id)`** — moderator-only rollback, the anti-vandalism
  tool.

## Reports are the takedown channel

`reports` accepts anonymous inserts on purpose. Someone who is the subject of
an inaccurate entry must be able to flag it without creating an account.
Review open reports regularly — with immediate publication, this queue is the
main safeguard.

## Promoting a moderator

Roles cannot be changed from the client. Use the SQL editor:

```sql
update profiles set role = 'moderator' where username = 'someone';
```
