import type { Metadata } from "next";
import { getAllViews, getCelebritiesWithAssets } from "@/lib/db";
import { AddButton } from "@/components/AddButton";
import { CelebrityBrowser } from "@/components/CelebrityBrowser";

export const metadata: Metadata = {
  title: "Celebrities",
  description:
    "Public figures tracked on IceTrack, ranked by the estimated value of their documented luxury assets.",
  alternates: { canonical: "/celebrities" },
  openGraph: {
    title: "Celebrities — IceTrack",
    description:
      "Public figures ranked by the estimated value of their documented luxury assets.",
    url: "/celebrities",
  },
};

export default async function CelebritiesPage() {
  const [celebrities, views] = await Promise.all([
    getCelebritiesWithAssets(),
    getAllViews("celebrities"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
          Celebrities
        </h1>
        <AddButton href="/celebrities/new" label="Add a person" />
      </div>

      <CelebrityBrowser celebrities={celebrities} views={views} />
    </div>
  );
}
