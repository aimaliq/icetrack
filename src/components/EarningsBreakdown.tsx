"use client";

import { useMemo, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { DEFAULT_STOP, STOPS, breakdown, money } from "@/lib/earnings";

/**
 * Brand marks, drawn rather than imported: Lucide is an interface icon set and
 * carries no company logos, and a logo pack for four glyphs is not worth the
 * bytes. Each path is the official mark, which is what makes these buttons
 * recognisable at a glance.
 */
const brand = {
  className: "h-4 w-4 shrink-0 fill-current",
  viewBox: "0 0 24 24",
} as const;

function XIcon() {
  return (
    <svg {...brand}>
      <path d="M18.9 1.2h3.7l-8.1 9.2 9.5 12.5h-7.4l-5.8-7.6-6.7 7.6H.4l8.6-9.8L0 1.2h7.6l5.2 6.9zm-1.3 19.5h2L6.5 3.2H4.3z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...brand}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg {...brand}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 3.31 1.34 6.31 3.52 8.48l-2.2 2.2c-.4.4-.12 1.09.45 1.09H12c6.63 0 12-5.37 12-12S18.63 0 12 0m5.01 10.2a1.5 1.5 0 0 1 .49 2.92 3 3 0 0 1 .04.5c0 2.5-2.92 4.54-6.52 4.54s-6.52-2.03-6.52-4.54q0-.25.05-.5a1.5 1.5 0 1 1 1.65-2.45 8 8 0 0 1 4.36-1.38l.82-3.88a.31.31 0 0 1 .37-.24l2.7.57a1.09 1.09 0 1 1-.12.6l-2.41-.51-.74 3.47a8 8 0 0 1 4.3 1.38 1.5 1.5 0 0 1 1.53-.48M8.67 12.5a1.09 1.09 0 1 0 0 2.18 1.09 1.09 0 0 0 0-2.18m6.66 0a1.09 1.09 0 1 0 0 2.18 1.09 1.09 0 0 0 0-2.18m-.4 3.65a.29.29 0 0 1 .4.42 4.6 4.6 0 0 1-3.33 1.04 4.6 4.6 0 0 1-3.33-1.04.29.29 0 1 1 .4-.42c.6.6 1.87.81 2.93.81s2.33-.21 2.93-.81" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg {...brand}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.96-.94 1.16-.35.22-.65.07a8.1 8.1 0 0 1-2.39-1.47 9 9 0 0 1-1.65-2.06c-.17-.3-.02-.46.13-.61s.3-.35.45-.52.2-.3.3-.5a.55.55 0 0 0-.03-.52c-.07-.15-.67-1.61-.92-2.21s-.49-.5-.67-.51h-.57a1.1 1.1 0 0 0-.8.37 3.35 3.35 0 0 0-1.04 2.48 5.8 5.8 0 0 0 1.22 3.09 13.3 13.3 0 0 0 5.1 4.5c.71.3 1.27.49 1.7.63a4.1 4.1 0 0 0 1.88.12 3.07 3.07 0 0 0 2.01-1.42 2.5 2.5 0 0 0 .17-1.41c-.07-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1 1.51-12.4 9.86 9.86 0 0 1 16.83 6.98 9.87 9.87 0 0 1-9.96 10.05M20.52 3.45A11.8 11.8 0 0 0 12.05 0C5.5 0 .17 5.33.17 11.89a11.8 11.8 0 0 0 1.58 5.94L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.88-5.33 11.89-11.89a11.8 11.8 0 0 0-3.47-8.46" />
    </svg>
  );
}

/**
 * Where the card can go.
 *
 * Plain intent URLs, not vendor SDKs: those load third-party script that
 * tracks the reader whether or not they ever click. A link costs nothing and
 * works with JavaScript off.
 *
 * Instagram and TikTok are missing because neither accepts a share URL —
 * their links get pasted, which is what the Copy button is for.
 */
const NETWORKS = [
  {
    name: "X",
    color: "#000000",
    Icon: XIcon,
    href: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    Icon: FacebookIcon,
    // Facebook takes no text: it reads the page's own Open Graph tags.
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    color: "#FF4500",
    Icon: RedditIcon,
    href: (url: string, text: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(text)}`,
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    Icon: WhatsAppIcon,
    href: (url: string, text: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${text} ${url}`,
      )}`,
  },
] as const;

export function EarningsBreakdown({
  value,
  assetName,
  ownerName,
  url,
  startAt,
}: {
  value: number;
  assetName: string;
  ownerName?: string;
  url: string;
  /** The span a shared link was read at, so someone arriving from a social
   *  post sees the figures the post showed rather than the default. */
  startAt?: number | null;
}) {
  const [index, setIndex] = useState(startAt ?? DEFAULT_STOP);
  const [copied, setCopied] = useState(false);

  const stop = STOPS[index];

  const rows = useMemo(
    () => breakdown(value, stop.months),
    [value, stop],
  );

  const shown = stop.months >= 12 ? rows : rows.slice(1);

  const perDay = rows.find((r) => r.label === "Per day")!.amount;

  const shareText = `${assetName}${
    ownerName ? ` (${ownerName})` : ""
  } costs ${money(value)}. To buy it in ${
    stop.label
  } you'd need ${money(perDay)} a day. — IceTrack`;

  // The chosen span rides along, so the card the followers see shows the
  // figures the sharer was actually looking at rather than the default.
  const shareUrl = index === DEFAULT_STOP ? url : `${url}?t=${index}`;

  /** For everywhere the buttons above do not reach: Instagram, TikTok, a
   *  message to one person. The named networks have their own buttons, so
   *  this one no longer opens the native sheet — that would put a second
   *  chooser in front of a choice already made. */
  async function share() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked, or the page is not on a secure origin. The link is
      // in the address bar either way.
    }
  }

  return (
    <section className="mt-10 sm:mt-12">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent sm:text-[14px]">
        What it takes to afford it
      </h2>

      <div className="mt-4 rounded-2xl bg-elevated p-5 sm:mt-5 sm:p-6">
        <div className="text-center">
          <p className="text-[14px] text-muted">
            To buy this in{" "}
            <span className="font-semibold text-ink">{stop.label}</span>, you
            would need
          </p>

          {/* The headline figure, restated from the table below: a daily wage
              is the one everybody can measure themselves against. */}
          <p className="mt-2.5 text-[40px] font-semibold leading-none tracking-tightest tabular-nums text-money sm:text-[52px]">
            {money(perDay)}
            <span className="ml-2.5 align-middle text-[13px] font-normal uppercase tracking-widest text-faint">
              a day
            </span>
          </p>

          <p className="mt-3 text-[15px] text-faint tabular-nums">
            {money(value)} total
          </p>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">How long to save for it</span>
          <input
            type="range"
            min={0}
            max={STOPS.length - 1}
            step={1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="slider w-full"
            aria-valuetext={stop.label}
          />
        </label>

        <div
          className="mt-2 flex justify-between text-[13px] font-medium text-muted sm:text-[14px]"
          aria-hidden
        >
          <span>{STOPS[0].label}</span>
          <span>{STOPS[STOPS.length - 1].label}</span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {shown.map((r) => (
            <div key={r.label} className="rounded-xl bg-sunken px-3 py-4 text-center">
              <dd className="text-[19px] font-semibold tracking-tight tabular-nums sm:text-[21px]">
                {money(r.amount)}
              </dd>
              <dt className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
                {r.label}
                {r.note && <span className="normal-case"> · {r.note}</span>}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-center text-[12px] uppercase tracking-widest text-faint">
            Share this
          </p>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {NETWORKS.map((n) => (
              <a
                key={n.name}
                href={n.href(shareUrl, shareText)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Share on ${n.name}`}
                style={{ backgroundColor: n.color }}
                className="focus-ring flex items-center gap-2 rounded-full px-4 py-2.5
                           text-[13px] font-semibold text-white
                           transition-transform duration-150 ease-out-strong
                           active:scale-[0.97] hover:opacity-90 sm:px-5"
              >
                <n.Icon aria-hidden />
                <span className="hidden sm:inline">{n.name}</span>
              </a>
            ))}

            {/* Copying is the one that works everywhere the others do not —
                Instagram and TikTok take a pasted link, not a share URL. */}
            <button
              type="button"
              onClick={() => void share()}
              className="focus-ring flex items-center gap-2 rounded-full border border-line
                         bg-surface px-4 py-2.5 text-[13px] font-semibold
                         transition-transform duration-150 ease-out-strong
                         active:scale-[0.97] hover:bg-sunken sm:px-5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
