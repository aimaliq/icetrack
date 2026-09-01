import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAsset } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/actions";
import { AssetForm } from "@/components/AssetForm";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params;
  const [found, profile] = await Promise.all([
    getAsset(id),
    getCurrentProfile(),
  ]);

  if (!found) notFound();
  if (!profile) redirect(`/login?next=/assets/${id}/edit`);
  if (profile.is_banned) redirect(`/assets/${id}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <Link
        href={`/assets/${id}`}
        className="focus-ring text-[14px] text-muted transition hover:text-ink"
      >
        ← Cancel
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tightest sm:text-3xl">
        Editing {found.asset.name}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Changes go live immediately and are credited to{" "}
        <strong className="text-ink">{profile.username}</strong> in this
        entry&apos;s public history.
      </p>

      <div className="mt-8">
        <AssetForm asset={found.asset} />
      </div>
    </div>
  );
}
