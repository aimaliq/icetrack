import type { Metadata } from "next";
import { getRecentChanges } from "@/lib/revisions";
import { resolveTargets } from "@/lib/targets";
import { RevisionList } from "@/components/RevisionList";

export const metadata: Metadata = {
  title: "Recent changes",
  description:
    "Every recent edit to the IceTrack database, with the contributor and their summary.",
  alternates: { canonical: "/changes" },
};

// Always current: a stale feed defeats the point of watching for vandalism.
export const dynamic = "force-dynamic";

export default async function ChangesPage() {
  const revisions = await getRecentChanges();
  const targets = await resolveTargets(revisions);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tightest sm:text-4xl">
        Recent changes
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        IceTrack publishes edits immediately, so this page is how the community
        keeps it honest. If something here looks wrong, open the entry and fix
        it — or report it.
      </p>
      <RevisionList revisions={revisions} showTarget slugs={targets} />
    </div>
  );
}
