# Database

## Applying the schema

Open the Supabase dashboard → **SQL Editor** → paste the contents of
`migrations/0001_init.sql` → **Run**.

Then import the existing JSON dataset.

The importer needs the **service role key**, which bypasses Row Level Security
entirely — it can read and delete anything, including auth tables. Treat it
like a root password:

- Do **not** put it in `.env.local`, in the repo, or in Vercel.
- Do **not** prefix it with `NEXT_PUBLIC_` (that would ship it to every
  visitor's browser).
- Pass it only for the lifetime of the command, then clear it.

You need it once, for this import. The website itself never uses it.

Find it in **Project Settings → API → `service_role`** (click to reveal).

**PowerShell (Windows):**

```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "paste_key_here"
npx tsx scripts/migrate-to-supabase.ts
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
```

**bash / zsh (macOS, Linux, Git Bash):**

```bash
SUPABASE_SERVICE_ROLE_KEY="paste_key_here" npx tsx scripts/migrate-to-supabase.ts
```

The bash form keeps the key out of your shell history file and unsets it
automatically once the command exits.

If the key ever leaks, rotate it immediately in Project Settings → API.

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
