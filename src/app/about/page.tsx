import Link from "next/link";
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
    title: "Every edit is recorded",
    body: "Because anyone can edit, every change is kept in a public revision history showing who changed what and when. Nothing is silently rewritten, and any edit can be rolled back.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create an account",
    body: "Sign up with your email and confirm it. That is all — no GitHub account, no technical setup.",
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
        where you found it. Your edit appears straight away.
      </p>

      <ol className="mt-8 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4 bg-surface p-5 sm:p-6">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full
                         bg-accent-soft text-[13px] font-semibold text-accent"
              aria-hidden
            >
              {s.n}
            </span>
            <div>
              <h3 className="text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[14px] leading-relaxed text-muted">
        Publishing immediately is a deliberate choice: a database nobody can
        edit is a database nobody corrects. What keeps it honest is that every
        edit is attributed and reversible, and that anyone — including the
        people we write about — can flag an entry.
      </p>

      {/* --- Editorial standards ---------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Editorial standards
      </h2>

      <div className="mt-8 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
        {RULES.map((r) => (
          <div key={r.title} className="bg-surface p-5 sm:p-6">
            <h3 className="text-[15px] font-semibold">{r.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{r.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[14px] leading-relaxed text-muted">
        Some limits are enforced by the database itself rather than left to good
        intentions: an entry cannot be marked Verified or Reported without a
        source, and street addresses and coordinates are rejected outright.
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

      {/* --- Open source ------------------------------------------------ */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Open source
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        The code behind IceTrack is public. If you want to report a bug, suggest
        a feature, or read exactly how the sourcing rules are enforced, the
        repository is the place.
      </p>
      <a
        href="https://github.com/aimaliq/icetrack"
        target="_blank"
        rel="noreferrer"
        className="focus-ring mt-6 inline-block rounded-full border border-line px-6
                   py-3 text-[15px] transition hover:bg-sunken sm:py-2.5 sm:text-[14px]"
      >
        View the code on GitHub ↗
      </a>

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
