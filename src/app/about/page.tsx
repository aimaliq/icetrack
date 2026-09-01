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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">About IceTrack</h1>

      <p className="mt-6 text-[17px] leading-relaxed text-muted">
        IceTrack is an open source database mapping the luxury assets of the
        world&apos;s most visible public figures — the jets, supercars, watches,
        yachts and estates that define modern status culture.
      </p>

      <p className="mt-4 text-[17px] leading-relaxed text-muted">
        The culture already tracks this. Ours is simply the version that shows
        its work.
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Editorial standards
      </h2>

      <div className="mt-8 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
        {RULES.map((r) => (
          <div key={r.title} className="bg-surface p-5 sm:p-6">
            <h3 className="text-[15px] font-semibold">{r.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              {r.body}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Contributing
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        The database lives as plain JSON files in the repository. Add or correct
        an entry, include your source, and open a pull request — the validator
        checks the schema and sourcing rules automatically.
      </p>
      <a
        href="https://github.com/aimaliq/icetrack"
        target="_blank"
        rel="noreferrer"
        className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-surface transition hover:opacity-90 sm:py-2.5 sm:text-[14px]"
      >
        Contribute on GitHub
      </a>

      <h2
        id="removals"
        className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl"
      >
        Corrections &amp; removals
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        If you are the subject of an entry, or represent them, and something
        here is inaccurate, tell us and we will review it. Documented
        corrections are applied promptly, and a contested entry is marked
        Disputed while under review. Open an issue on{" "}
        <a
          href="https://github.com/aimaliq/icetrack/issues"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          GitHub
        </a>
        , or use the report link on any entry.
      </p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">Disclaimer</h2>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">
        IceTrack aggregates publicly reported information and is provided for
        informational purposes only. Entries are community-contributed and may
        be incomplete, outdated or inaccurate. Valuations are press estimates,
        not appraisals. IceTrack is not affiliated with, endorsed by, or
        representative of any individual or brand listed.
      </p>
    </div>
  );
}
