import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrity, getRecordId } from "@/lib/db";
import { getHistory } from "@/lib/revisions";
import { RevisionList } from "@/components/RevisionList";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const celeb = await getCelebrity(id);
  return {
    title: celeb ? `History of ${celeb.name}` : "History",
    robots: { index: false },
  };
}

export default async function CelebrityHistoryPage({ params }: Props) {
  const { id } = await params;
  const celeb = await getCelebrity(id);
  if (!celeb) notFound();

  const recordId = await getRecordId("celebrities", id);
  const revisions = recordId ? await getHistory("celebrities", recordId) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href={`/celebrities/${id}`}
        className="focus-ring text-[14px] text-muted transition hover:text-ink"
      >
        ← {celeb.name}
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tightest sm:text-3xl">
        Revision history
      </h1>
      <p className="mt-2 text-[14px] text-muted">
        Every change to this entry, most recent first.
      </p>
      <RevisionList revisions={revisions} />
    </div>
  );
}
