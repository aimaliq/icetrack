import Link from "next/link";
import { diff, type Revision } from "@/lib/revisions";

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * A revision log. `showTarget` adds a link to the entry, which is what makes
 * the site-wide feed navigable; per-entry history omits it as redundant.
 */
export function RevisionList({
  revisions,
  showTarget = false,
  slugs,
}: {
  revisions: Revision[];
  showTarget?: boolean;
  slugs?: Map<string, { slug: string; name: string }>;
}) {
  if (revisions.length === 0) {
    return (
      <p className="mt-6 text-[15px] text-muted">No changes recorded yet.</p>
    );
  }

  return (
    <ol className="mt-6 space-y-3">
      {revisions.map((rev) => {
        const changes = diff(rev);
        const target = slugs?.get(rev.record_id);
        const href = target
          ? `/${rev.table_name === "assets" ? "assets" : "celebrities"}/${target.slug}`
          : null;

        return (
          <li key={rev.id} className="rounded-2xl bg-elevated p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span
                className={`text-[11px] uppercase tracking-widest ${
                  rev.operation === "insert" ? "text-money" : "text-faint"
                }`}
              >
                {rev.operation === "insert" ? "Created" : "Edited"}
              </span>

              {showTarget &&
                (href ? (
                  <Link href={href} className="text-[15px] font-medium text-accent hover:underline">
                    {target!.name}
                  </Link>
                ) : (
                  <span className="text-[15px] font-medium text-faint">
                    (removed entry)
                  </span>
                ))}

              <span className="ml-auto text-[12px] text-faint">
                {when(rev.created_at)}
              </span>
            </div>

            <p className="mt-1.5 text-[14px]">
              {rev.editor ? (
                <Link
                  href={`/u/${rev.editor.username}`}
                  className="font-medium text-accent hover:underline"
                >
                  {rev.editor.username}
                </Link>
              ) : (
                <span className="text-faint">A removed account</span>
              )}
              {rev.edit_summary && (
                <span className="text-muted"> — {rev.edit_summary}</span>
              )}
            </p>

            {changes.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[13px]">
                {changes.slice(0, 8).map((c) => (
                  <li key={c.field} className="flex flex-wrap gap-x-2">
                    <span className="text-faint">{c.field}:</span>
                    <span className="text-muted line-through decoration-faint">
                      {c.before.slice(0, 80)}
                    </span>
                    <span aria-hidden className="text-faint">→</span>
                    <span>{c.after.slice(0, 80)}</span>
                  </li>
                ))}
                {changes.length > 8 && (
                  <li className="text-[12px] text-faint">
                    and {changes.length - 8} more field
                    {changes.length - 8 === 1 ? "" : "s"}
                  </li>
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
