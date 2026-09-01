import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeScript } from "@/components/ThemeScript";
import { UserMenu } from "@/components/UserMenu";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const TITLE = "IceTrack — Mapping VIP premium assets";
const DESCRIPTION =
  "An open source, community-sourced database mapping the luxury assets of public figures. Every entry carries its source.";

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
    "open source database",
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
  { href: "/changes", label: "Changes" },
  { href: "/about", label: "About" },
];

async function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/80 backdrop-blur-xl">
      {/* Mobile centres the wordmark, so the theme toggle is pulled out of the
          flow to keep it from shifting the centre. */}
      <nav className="relative mx-auto flex h-14 max-w-6xl items-center justify-center px-4
                      sm:justify-between sm:px-6">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-lg">
          <span className="text-xl" aria-hidden>
            💎
          </span>
          <span className="text-[20px] font-semibold tracking-tight">IceTrack</span>
        </Link>

        <div className="absolute right-4 flex items-center gap-1
                        sm:static sm:right-auto sm:gap-6">
          {/* Full nav on tablet and up. */}
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
          <UserMenu />
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile: a centred row instead of a hamburger — three links do not
          justify hiding navigation behind a tap. */}
      <div className="flex justify-center gap-1 border-t border-line px-3 pb-2 pt-1.5 sm:hidden">
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
          <a
            href="https://github.com/aimaliq/icetrack"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink"
          >
            GitHub
          </a>
          <Link href="/contributors" className="hover:text-ink">
            Contributors
          </Link>
          <Link href="/about#removals" className="hover:text-ink">
            Corrections &amp; removals
          </Link>
          <span>Open source</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
