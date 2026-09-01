import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Contributors",
  description:
    "The people building IceTrack, ranked by the number of edits they have contributed.",
  alternates: { canonical: "/contributors" },
  openGraph: {
    title: "Contributors — IceTrack",
    description: "The people building IceTrack, ranked by edits contributed.",
    url: "/contributors",
  },
};

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  edits: number;
  creations: number;
  last_edit_at: string | null;
};

export default async function ContributorsPage() {
  const db = await createClient();
  const { data } = await db
    .from("contributor_stats")
    .select("id, username, display_name, role, edits, creations, last_edit_at")
    .order("edits", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as Row[];
  const active = rows.filter((r) => r.edits > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tightest sm:text-4xl">
        Contributors
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        IceTrack is built by whoever shows up. Every entry here was written,
        sourced or corrected by someone on this list.
      </p>

      {active.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-elevated p-6 text-center sm:p-8">
          <p className="text-[15px] font-medium">No contributions yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">
            The database is still seeded from its original import. The first
            person to correct an entry appears here.
          </p>
          <Link
            href="/signup"
            className="focus-ring mt-5 inline-block rounded-full bg-ink px-6 py-2.5
                       text-[14px] font-medium text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90"
          >
            Create an account
          </Link>
        </div>
      ) : (
        <ol className="mt-8 overflow-hidden rounded-2xl bg-elevated">
          {active.map((r, i) => (
            <li
              key={r.id}
              className="flex items-center gap-4 px-4 py-4 sm:px-6"
            >
              <span className="w-6 shrink-0 text-[15px] tabular-nums text-faint">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/u/${r.username}`}
                  className="focus-ring text-[15px] font-medium tracking-tight hover:text-accent"
                >
                  {r.username}
                </Link>
                {r.role !== "user" && (
                  <span className="ml-2 text-[11px] uppercase tracking-widest text-accent">
                    {r.role}
                  </span>
                )}
                <p className="mt-0.5 text-[13px] text-faint">
                  {r.creations > 0
                    ? `${r.creations} created · ${r.edits - r.creations} edited`
                    : `${r.edits} edit${r.edits === 1 ? "" : "s"}`}
                </p>
              </div>
              <span className="text-[20px] font-semibold tabular-nums sm:text-[22px]">
                {r.edits}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
