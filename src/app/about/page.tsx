import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "How IceTrack sources its entries: what counts as verified, why no precise locations are ever published, and how to request a correction or removal.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — IceTrack",
    description:
      "How IceTrack sources its entries, and how to request a correction or removal.",
    url: "/about",
  },
};

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
    title: "Every edit is recorded",
    body: "Because anyone can edit, every change is kept in a public revision history showing who changed what and when. Nothing is silently rewritten, and any edit can be rolled back.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create an account",
    body: "Sign up with your email and confirm it. That is all — no application, no technical setup.",
  },
  {
    n: "2",
    title: "Add or correct an entry",
    body: "Fill in the form: what the asset is, who owns it, and where you found that out. Corrections to existing entries are as welcome as new ones.",
  },
  {
    n: "3",
    title: "It goes live",
    body: "Your edit publishes immediately and is credited to you in the revision history. There is no approval queue to wait on.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
        About IceTrack
      </h1>

      <p className="mt-6 text-[16px] leading-relaxed text-muted sm:text-[17px]">
        IceTrack is an open database mapping the luxury assets of the
        world&apos;s most visible public figures — the jets, supercars, watches,
        yachts and estates that define modern status culture.
      </p>

      <p className="mt-4 text-[16px] leading-relaxed text-muted sm:text-[17px]">
        The culture already tracks this. Ours is simply the version that shows
        its work.
      </p>

      {/* --- How contributing works ------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Anyone can contribute
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        IceTrack works like a wiki. Create an account, add what you know, cite
        where you found it. Edits appears right away.
      </p>

      {/* --- Corrections and removals ----------------------------------- */}
      <h2
        id="removals"
        className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl"
      >
        Corrections &amp; removals
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        If you are the subject of an entry, or represent them, and something
        here is inaccurate, tell us. You do not need an account to report an
        entry, and you do not need to explain yourself to us first — use the
        report link on any entry, or email us.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Documented corrections are applied promptly, and a contested entry is
        marked Disputed while we review it.
      </p>

      {/* --- Contributing ----------------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Contributing
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Anyone with an account can add entries and correct existing ones,
        directly on this site. Every change is recorded with your username and
        a summary of what you changed, and the full history of an entry is
        public — as is the{" "}
        <Link href="/changes" className="text-accent hover:underline">
          feed of recent changes
        </Link>{" "}
        across the whole database.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        There is no application process and nothing to install. The one thing
        we ask is that you bring a source.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="focus-ring rounded-full bg-ink px-6 py-3 text-[15px] font-medium
                     text-surface transition hover:opacity-90 sm:py-2.5 sm:text-[14px]"
        >
          Create an account
        </Link>
        <Link
          href="/contributors"
          className="focus-ring rounded-full border border-line px-6 py-3 text-[15px]
                     transition hover:bg-sunken sm:py-2.5 sm:text-[14px]"
        >
          See who contributes
        </Link>
      </div>

      {/* --- Disclaimer ------------------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Disclaimer
      </h2>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">
        IceTrack aggregates publicly reported information and is provided for
        informational purposes only. Entries are contributed by the community
        and may be incomplete, outdated or inaccurate. Values are press
        estimates, not appraisals. IceTrack is not affiliated with, endorsed by,
        or representative of any individual or brand listed. See{" "}
        <Link href="/about#removals" className="text-accent hover:underline">
          corrections &amp; removals
        </Link>{" "}
        if something here is wrong.
      </p>
    </div>
  );
}
