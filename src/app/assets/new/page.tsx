import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrities } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/actions";
import { NewAssetForm } from "@/components/NewAssetForm";

type Props = { searchParams: Promise<{ owner?: string }> };

export const metadata: Metadata = {
  title: "Add an asset",
  robots: { index: false, follow: false },
};

export default async function NewAssetPage({ searchParams }: Props) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/assets/new");
  if (profile.is_banned) redirect("/assets");

  const { owner } = await searchParams;
  const celebrities = await getCelebrities();

  if (celebrities.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tightest">
          Add a person first
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          An asset belongs to someone, and there is nobody in the database yet.
        </p>
        <Link
          href="/celebrities/new"
          className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-2.5
                     text-[14px] font-medium text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90"
        >
          Add a public figure
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href="/assets"
        className="focus-ring text-[14px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
      >
        ← Cancel
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tightest sm:text-3xl">
        Add an asset
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Publicly reported ownership only. If you have no source yet, leave the
        status as unverified — the entry will be labelled a research
        placeholder rather than a fact.
      </p>

      <div className="mt-8">
        <NewAssetForm
          owners={celebrities.map((c) => ({ slug: c.id, name: c.name }))}
          defaultOwner={owner}
        />
      </div>
    </div>
  );
}
