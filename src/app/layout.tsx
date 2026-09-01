import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IceTrack — Mapping VIP premium assets",
    template: "%s — IceTrack",
  },
  description:
    "An open source, community-sourced database mapping the luxury assets of public figures. Every entry carries its source.",
};

function Nav() {
  const links = [
    { href: "/celebrities", label: "Celebrities" },
    { href: "/assets", label: "Assets" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-carbon-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            ❄
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            IceTrack
          </span>
        </Link>
        <div className="flex items-center gap-7 text-[13px] text-carbon-300">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/aimaliq/icetrack"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-3.5 py-1.5 text-white transition hover:bg-white hover:text-carbon-950"
          >
            Contribute
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-[15px] font-semibold tracking-tight">
          IceTrack — Mapping VIP premium assets
        </p>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-carbon-400">
          IceTrack catalogues publicly reported information about public
          figures. Entries are community-contributed and may be incomplete or
          out of date. Nothing here is an appraisal, and no precise location
          data is published. See{" "}
          <Link href="/about" className="text-ice-300 hover:text-white">
            About
          </Link>{" "}
          for our sourcing and removal policy.
        </p>
        <p className="mt-6 text-[12px] text-carbon-500">
          Open source · Contributions welcome
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
