import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const RULES = [
  {
    title: "Every claim carries a source",
    body: "No entry is published as fact without at least one public, linkable source. Entries still awaiting sourcing are labelled Unverified and shown as research placeholders, never as confirmed ownership.",
  },
  {
    title: "Public information only",
    body: "We catalogue what public registries and the press have already published about public figures. We do not publish precise locations — no addresses, no moorings, no hangars. Country or state is the finest granularity we store.",
  },
  {
    title: "Status over certainty",
    body: "Ownership changes constantly. Each entry carries a status — Verified, Reported, Unverified, Former or Disputed — so the database never overstates what it actually knows.",
  },
  {
    title: "Corrections and removals",
    body: "If you are a subject or a representative and an entry is inaccurate, open an issue on GitHub and we will review it. Documented corrections are applied promptly, and contested entries are marked Disputed while under review.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tightest">About IceTrack</h1>

      <p className="mt-6 text-[17px] leading-relaxed text-carbon-300">
        IceTrack is an open source database mapping the luxury assets of the
        world&apos;s most visible public figures — the jets, supercars, watches,
        yachts and estates that define modern status culture.
      </p>

      <p className="mt-4 text-[17px] leading-relaxed text-carbon-300">
        The culture already tracks this. Ours is simply the version that shows
        its work.
      </p>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">
        Editorial standards
      </h2>

      <div className="mt-8 space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
        {RULES.map((r) => (
          <div key={r.title} className="bg-carbon-950 p-6">
            <h3 className="text-[15px] font-semibold text-white">{r.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-carbon-400">
              {r.body}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">
        Contributing
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-carbon-300">
        The database lives as plain JSON files in the repository. Add or correct
        an entry, include your source, and open a pull request — the validator
        checks the schema and sourcing rules automatically.
      </p>
      <a
        href="https://github.com/aimaliq/icetrack"
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-[14px] font-medium text-carbon-950 transition hover:bg-ice-100"
      >
        Contribute on GitHub
      </a>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Disclaimer</h2>
      <p className="mt-4 text-[14px] leading-relaxed text-carbon-400">
        IceTrack aggregates publicly reported information and is provided for
        informational purposes only. Entries are community-contributed and may
        be incomplete, outdated or inaccurate. Valuations are press estimates,
        not appraisals. IceTrack is not affiliated with, endorsed by, or
        representative of any individual or brand listed.
      </p>
    </div>
  );
}
