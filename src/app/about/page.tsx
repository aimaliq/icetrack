import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "What IceTrack is, where the name comes from, how entries are sourced, and how to get something corrected or removed.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — IceTrack",
    description:
      "What IceTrack is, how entries are sourced, and how to get something corrected.",
    url: "/about",
  },
};

const RULES = [
  {
    title: "Every claim carries a source",
    body: "Nothing is published as fact without a public link behind it. Entries nobody has sourced yet are marked Unverified and shown as a starting point for research, not as something we know.",
  },
  {
    title: "Public information only",
    body: "We collect what registries and the press have already made public. We never publish precise locations — no addresses, no moorings, no hangars. Country or state is as close as we get.",
  },
  {
    title: "We say how sure we are",
    body: "Ownership changes constantly. Every entry carries a status — Verified, Reported, Unverified, Former or Disputed — so the site never claims to know more than it does.",
  },
  {
    title: "Every edit is on the record",
    body: "Anyone can edit, so every change is kept along with the name of whoever made it. Nothing gets quietly rewritten, and anything can be rolled back.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create an account",
    body: "An email address is all it takes. We send you a link to sign in, so there is no password to remember.",
  },
  {
    n: "2",
    title: "Add or fix an entry",
    body: "Say what the asset is, who owns it, and where you found that out. Fixing something wrong counts as much as adding something new.",
  },
  {
    n: "3",
    title: "It goes live",
    body: "Your edit appears straight away, credited to you. There is no queue and nobody to wait on.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
        About
      </h1>

      <p className="mt-6 text-[16px] leading-relaxed text-muted sm:text-[17px]">
        IceTrack maps the luxury assets of the world&apos;s most visible people
        — the jets, cars, watches, yachts and houses that make up modern status
        culture.
      </p>

      <p className="mt-4 text-[16px] leading-relaxed text-muted sm:text-[17px]">
        The internet already tracks all of this, scattered across forums, car
        pages and watch accounts. Ours is the version that shows its work.
      </p>

      {/* --- The name ---------------------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Why &ldquo;IceTrack&rdquo;
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        In hip-hop, <em>ice</em> has meant diamonds — and then luxury in general
        — for decades. The watch, the chain, the car in the driveway. It is the
        word the culture itself uses for this stuff.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        <em>Track</em> is the other half, and the more important one. Not
        tracking people: tracking claims. Who said what, when, and on what
        evidence. Every entry keeps its sources and its full edit history, so
        any fact here can be followed back to where it came from.
      </p>

      {/* --- How it works ------------------------------------------------ */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        How it works
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Four rules keep an open database from turning into a rumour mill.
      </p>
      <ol className="mt-6 space-y-px overflow-hidden rounded-2xl bg-elevated">
        {RULES.map((r) => (
          <li key={r.title} className="p-5 sm:p-6">
            <h3 className="text-[15px] font-semibold tracking-tight">
              {r.title}
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
              {r.body}
            </p>
          </li>
        ))}
      </ol>

      {/* --- Contributing ------------------------------------------------ */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Anyone can contribute
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        IceTrack works like a wiki: you add what you know, and cite where you
        found it. All we ask is that you bring a source.
      </p>

      <ol className="mt-6 space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4 rounded-2xl bg-elevated p-5 sm:p-6">
            <span
              aria-hidden
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                         rounded-full bg-sunken text-[13px] font-semibold tabular-nums"
            >
              {s.n}
            </span>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        Everything that changes shows up in the{" "}
        <Link href="/changes" className="text-accent hover:underline">
          feed of recent changes
        </Link>
        , and the people doing the work are listed on{" "}
        <Link href="/contributors" className="text-accent hover:underline">
          contributors
        </Link>
        .
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="focus-ring rounded-full bg-ink px-6 py-3 text-[15px] font-medium
                     text-surface transition-opacity duration-150 ease-out-strong
                     hover:opacity-90 sm:py-2.5 sm:text-[14px]"
        >
          Create an account
        </Link>
        <Link
          href="/celebrities"
          className="focus-ring rounded-full border border-line px-6 py-3 text-[15px]
                     transition-colors duration-150 ease-out-strong hover:bg-sunken
                     sm:py-2.5 sm:text-[14px]"
        >
          Browse the database
        </Link>
      </div>

      {/* --- Corrections and removals ------------------------------------ */}
      <h2
        id="removals"
        className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl"
      >
        Corrections &amp; removals
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        If you are the subject of an entry, or represent someone who is, and
        something here is wrong, tell us. You do not need an account, and you do
        not owe us an explanation first.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Corrections that come with documentation are applied quickly, and
        anything contested is marked Disputed while we look at it.
      </p>

      {/* --- Disclaimer --------------------------------------------------- */}
      <h2 className="mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl">
        Disclaimer
      </h2>
      <p className="mt-4 text-[14px] leading-relaxed text-muted">
        IceTrack collects publicly reported information and is provided for
        information only. Entries come from the community and may be incomplete,
        out of date or wrong. Values are press estimates, not appraisals.
        IceTrack is not affiliated with, endorsed by, or speaking for anyone or
        any brand listed here.
      </p>
    </div>
  );
}
