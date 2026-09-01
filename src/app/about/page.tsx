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

/** One size for every paragraph on the page. */
const P = "mt-4 text-[16px] leading-relaxed text-muted";
const H2 = "mt-12 text-xl font-semibold tracking-tight sm:mt-14 sm:text-2xl";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
        About
      </h1>

      <p className={P}>
        IceTrack is a database of the expensive things owned by famous people:
        jets, cars, watches, yachts and houses.
      </p>

      <p className={P}>
        This information is already all over the internet, spread across forums,
        car pages and watch accounts. Most of it is repeated without anyone
        saying where it came from. Here, every entry has to say where it came
        from.
      </p>

      <h2 className={H2}>Why the name</h2>

      <p className={P}>
        In music, <em>ice</em> means diamonds, and more broadly expensive
        things. <em>Track</em> means keeping a record — not of people, but of
        who claimed what and on what evidence. Every entry keeps its sources and
        a full history of edits.
      </p>

      <h2 className={H2}>How it works</h2>

      <p className={P}>
        Nothing is published as a fact without a link to back it up. Entries
        that nobody has sourced yet are marked Unverified, which means they are
        a starting point for research and not something we know.
      </p>

      <p className={P}>
        We only use information that registries and the press have already made
        public. We never publish addresses or exact locations. Country or state
        is as specific as we get.
      </p>

      <p className={P}>
        Ownership changes often, so every entry says how certain we are:
        Verified, Reported, Unverified, Former or Disputed. That way the site
        never claims to know more than it does.
      </p>

      <p className={P}>
        Anyone can edit, so every change is saved with the name of the person
        who made it. Nothing is changed quietly, and any edit can be undone.
      </p>

      <h2 className={H2}>Contributing</h2>

      <p className={P}>
        You need an email address to sign up. We send you a link to sign in, so
        there is no password. Once you are in, you can add entries and fix
        existing ones, and your changes appear immediately.
      </p>

      <p className={P}>
        Correcting something wrong is as useful as adding something new. The
        only thing we ask is that you say where your information comes from. You
        can see{" "}
        <Link href="/changes" className="text-accent hover:underline">
          every recent change
        </Link>{" "}
        and{" "}
        <Link href="/contributors" className="text-accent hover:underline">
          who made it
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

      <h2 id="removals" className={`${H2} scroll-mt-24`}>
        Corrections and removals
      </h2>

      <p className={P}>
        If an entry is about you, or about someone you represent, and something
        is wrong, tell us. You do not need an account.
      </p>

      <p className={P}>
        Corrections that come with documents are applied quickly. Anything
        disputed is marked as such while we look into it.
      </p>

      <h2 className={H2}>Disclaimer</h2>

      <p className={P}>
        Entries come from the public and may be incomplete, out of date or
        wrong. Values are press estimates, not appraisals. IceTrack is not
        connected to, endorsed by, or speaking for anyone listed here.
      </p>
    </div>
  );
}
