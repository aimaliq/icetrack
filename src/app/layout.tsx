import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeScript } from "@/components/ThemeScript";
import { UserMenu } from "@/components/UserMenu";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * Wordmark face. Self-hosted by next/font, so it costs no extra request and
 * cannot shift the layout while it loads. Only the wordmark uses it — body
 * text stays on the system stack, which is faster and more legible at size.
 */
const wordmark = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  display: "swap",
  variable: "--font-wordmark",
});

const TITLE = "IceTrack";
const DESCRIPTION =
  "A database mapping the luxury assets of public figures.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — IceTrack" },
  description: DESCRIPTION,
  applicationName: "IceTrack",
  keywords: [
    "celebrity assets",
    "luxury assets database",
    "private jets",
    "supercars",
    "yachts",
    "celebrity net worth",
    "community database",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "IceTrack",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "reference",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const LINKS = [
  { href: "/celebrities", label: "Celebrities" },
  { href: "/assets", label: "Assets" },
  { href: "/about", label: "About" },
];

/** Deliberately not sticky: the header scrolls away with the page. */
async function Nav() {
  return (
    <header className="border-b border-line/60 bg-elevated">
      {/* Three columns rather than flex spacing, so the links sit on the page
          centre instead of the midpoint between logo and controls. */}
      <nav className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center
                      gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="focus-ring flex w-fit items-center gap-2 rounded-lg"
        >
          <span className="text-xl" aria-hidden>
            💎
          </span>
          <span className="font-wordmark text-[26px] leading-none tracking-[-0.01em]">
            IceTrack
          </span>
        </Link>

        {/* Full nav on tablet and up; below that it moves to its own row. */}
        <div className="hidden items-center gap-6 text-[13px] text-muted sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="focus-ring rounded transition hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <span className="sm:hidden" />

        <div className="flex items-center justify-end gap-1">
          <UserMenu />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile: a centred row instead of a hamburger — three links do not
          justify hiding navigation behind a tap. */}
      <div className="flex justify-center gap-1 px-3 pb-2 sm:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-[13px]
                       text-muted transition hover:bg-sunken hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 bg-sunken sm:mt-24">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-12">
        <p className="text-[15px] font-semibold tracking-tight">
          IceTrack — Mapping VIP premium assets
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          IceTrack catalogues publicly reported information about public
          figures. Entries are community-contributed and may be incomplete or
          out of date. Values are press estimates, not appraisals, and no
          precise location data is published. See{" "}
          <Link href="/about" className="text-accent hover:underline">
            About
          </Link>{" "}
          for our sourcing and removal policy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px] text-faint">
          <Link href="/contributors" className="hover:text-ink">
            Contributors
          </Link>
          <Link href="/changes" className="hover:text-ink">
            Recent changes
          </Link>
          <Link href="/about#removals" className="hover:text-ink">
            Corrections &amp; removals
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={wordmark.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* Must be the first thing in body: it sets the theme before the page
            paints, so dark-theme users never see a white flash. */}
        <ThemeScript />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
