import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserChanges } from "@/lib/revisions";
import { resolveTargets } from "@/lib/targets";
import { RevisionList } from "@/components/RevisionList";

type Props = { params: Promise<{ username: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}`,
    description: `Contributions by ${username} on IceTrack.`,
    alternates: { canonical: `/u/${username}` },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const db = await createClient();

  const { data } = await db
    .from("contributor_stats")
    .select("id, username, display_name, role, edits, creations, created_at")
    .ilike("username", username)
    .maybeSingle();

  if (!data) notFound();
  const profile = data as {
    id: string;
    username: string;
    display_name: string | null;
    role: string;
    edits: number;
    creations: number;
    created_at: string;
  };

  const revisions = await getUserChanges(profile.id);
  const targets = await resolveTargets(revisions);

  const joined = new Date(profile.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tightest sm:text-4xl">
        {profile.username}
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        {profile.role !== "user" && (
          <span className="uppercase tracking-widest text-accent">
            {profile.role} ·{" "}
          </span>
        )}
        Contributing since {joined}
      </p>

      <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl bg-elevated text-center">
        <div className="px-3 py-5 sm:px-4">
          <dd className="text-xl font-semibold tabular-nums sm:text-2xl">
            {profile.edits}
          </dd>
          <dt className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
            Edits
          </dt>
        </div>
        <div className="px-3 py-5 sm:px-4">
          <dd className="text-xl font-semibold tabular-nums sm:text-2xl">
            {profile.creations}
          </dd>
          <dt className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
            Entries created
          </dt>
        </div>
      </dl>

      <h2 className="mt-10 text-xl font-semibold tracking-tight sm:text-2xl">
        Contributions
      </h2>
      <RevisionList revisions={revisions} showTarget slugs={targets} />

      <p className="mt-10 text-center text-[13px]">
        <Link href="/contributors" className="text-accent hover:underline">
          All contributors →
        </Link>
      </p>
    </div>
  );
}
