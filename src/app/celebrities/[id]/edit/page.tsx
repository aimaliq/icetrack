import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrity } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/actions";
import { CelebrityForm } from "@/components/CelebrityForm";

type Props = { params: Promise<{ id: string }> };

// Editing is per-user and never cached or indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditCelebrityPage({ params }: Props) {
  const { id } = await params;
  const [celeb, profile] = await Promise.all([
    getCelebrity(id),
    getCurrentProfile(),
  ]);

  if (!celeb) notFound();
  if (!profile) redirect(`/login?next=/celebrities/${id}/edit`);
  if (profile.is_banned) redirect(`/celebrities/${id}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href={`/celebrities/${id}`}
        className="focus-ring text-[14px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
      >
        ← Cancel
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tightest sm:text-3xl">
        Editing {celeb.name}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Changes go live immediately and are credited to{" "}
        <strong className="text-ink">{profile.username}</strong> in this
        entry&apos;s public history.
      </p>

      <div className="mt-8">
        <CelebrityForm celeb={celeb} />
      </div>
    </div>
  );
}
