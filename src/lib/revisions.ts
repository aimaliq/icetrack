import { createClient } from "@/lib/supabase/server";

export type Revision = {
  id: number;
  table_name: "celebrities" | "assets";
  record_id: string;
  operation: "insert" | "update" | "delete";
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  edit_summary: string | null;
  created_at: string;
  editor: { username: string } | null;
};

const COLS =
  "id, table_name, record_id, operation, before, after, edit_summary, created_at, editor:profiles!revisions_edited_by_fkey(username)";

/** One entry's history, newest first. */
export async function getHistory(
  table: "celebrities" | "assets",
  recordId: string,
): Promise<Revision[]> {
  const db = await createClient();
  const { data, error } = await db
    .from("revisions")
    .select(COLS)
    .eq("table_name", table)
    .eq("record_id", recordId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(`Failed to load history: ${error.message}`);
  return normalise(data);
}

/** Site-wide recent changes — the safety net of an open wiki. */
export async function getRecentChanges(limit = 60): Promise<Revision[]> {
  const db = await createClient();
  const { data, error } = await db
    .from("revisions")
    .select(COLS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load changes: ${error.message}`);
  return normalise(data);
}

export async function getUserChanges(
  userId: string,
  limit = 60,
): Promise<Revision[]> {
  const db = await createClient();
  const { data, error } = await db
    .from("revisions")
    .select(COLS)
    .eq("edited_by", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load contributions: ${error.message}`);
  return normalise(data);
}

/** The client types an embedded to-one relation as an array. */
function normalise(rows: unknown): Revision[] {
  return (rows as (Omit<Revision, "editor"> & {
    editor: { username: string } | { username: string }[] | null;
  })[]).map((r) => ({
    ...r,
    editor: Array.isArray(r.editor) ? (r.editor[0] ?? null) : r.editor,
  }));
}

/** Fields that are noise in a diff: bookkeeping, not content. */
const SKIP = new Set(["id", "updated_at", "created_at", "created_by"]);

export type FieldChange = { field: string; before: string; after: string };

/** Field-level diff between two revision snapshots. */
export function diff(rev: Revision): FieldChange[] {
  const before = rev.before ?? {};
  const after = rev.after ?? {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  const changes: FieldChange[] = [];
  for (const key of keys) {
    if (SKIP.has(key)) continue;
    const a = render(before[key]);
    const b = render(after[key]);
    if (a !== b) changes.push({ field: label(key), before: a, after: b });
  }
  return changes.sort((x, y) => x.field.localeCompare(y.field));
}

function render(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) {
    return v.length === 0
      ? "—"
      : v
          .map((s) =>
            typeof s === "object" && s !== null && "title" in s
              ? String((s as { title: unknown }).title)
              : JSON.stringify(s),
          )
          .join(", ");
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function label(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\busd\b/i, "USD")
    .replace(/^./, (c) => c.toUpperCase());
}
