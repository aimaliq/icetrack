import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/actions";
import { NewCelebrityForm } from "@/components/NewCelebrityForm";

export const metadata: Metadata = {
  title: "Add a public figure",
  robots: { index: false, follow: false },
};

export default async function NewCelebrityPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/celebrities/new");
  if (profile.is_banned) redirect("/celebrities");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href="/celebrities"
        className="focus-ring text-[14px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
      >
        ← Cancel
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tightest sm:text-3xl">
        Add a public figure
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        IceTrack catalogues public figures only — people whose lives are already
        matters of public record.
      </p>

      <div className="mt-8">
        <NewCelebrityForm />
      </div>
    </div>
  );
}
