import type { Metadata } from "next";
import { getAssets, getCelebrities } from "@/lib/db";
import { PriceGame } from "@/components/PriceGame";
import type { Contender } from "@/lib/game";

export const metadata: Metadata = {
  title: "Which costs more?",
  description:
    "Two luxury assets, one question: which one costs more? Guess right and keep the streak alive — every figure is a published estimate from the IceTrack database.",
  alternates: { canonical: "/play" },
  openGraph: {
    title: "Which costs more? — IceTrack",
    description:
      "Two luxury assets, one question. How long can you keep the streak alive?",
    url: "/play",
  },
};

export default async function PlayPage() {
  const [assets, celebrities] = await Promise.all([
    getAssets(),
    getCelebrities(),
  ]);
  const nameBySlug = new Map(celebrities.map((c) => [c.id, c.name]));

  // Only what the game needs: sending whole assets would ship sources and
  // summaries to the browser for no reason.
  const pool: Contender[] = assets.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    estimatedValueUsd: a.estimatedValueUsd,
    imageUrl: a.imageUrl,
    ownerId: a.ownerId,
    ownerName: nameBySlug.get(a.ownerId),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
        Which costs more?
      </h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
        Pick the pricier of the two. One wrong answer ends the run.
      </p>

      <PriceGame pool={pool} />
    </div>
  );
}
