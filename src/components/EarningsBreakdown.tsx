"use client";

import { useMemo, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { DEFAULT_STOP, STOPS, breakdown, money } from "@/lib/earnings";
import { NETWORKS } from "@/lib/share";


/** "Roman Abramovich" -> "Roman Abramovich's", "Travis Scott" -> "Travis
 *  Scott's", but "Beyoncé Knowles" -> "Beyoncé Knowles'". A name already
 *  ending in s takes the bare apostrophe. */
function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

export function EarningsBreakdown({
  value,
  assetName,
  ownerName,
  categoryLabel,
  url,
  startAt,
}: {
  value: number;
  assetName: string;
  ownerName?: string;
  /** "Superyacht", "Private jet" — the words the share text calls it. */
  categoryLabel: string;
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

  // Written to be read aloud, and to end on a question: a post that asks
  // something gets replied to, where one that only states a number gets
  // scrolled past. The first person is deliberate — the reader is being
  // invited to compare themselves, not lectured at.
  const owned = ownerName ? `${possessive(ownerName)} ` : "";
  const shareText = [
    `${owned}${money(value)} ${categoryLabel.toLowerCase()}, ${assetName}.`,
    `To buy it in ${stop.label}, I'd need to earn ${money(perDay)} a day.`,
    `How long would it take you?`,
  ].join("\n");

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
          <p className="mt-2.5 text-[40px] font-bold leading-none tracking-tightest tabular-nums text-money sm:text-[52px]">
            {money(perDay)}
            <span className="ml-2.5 align-middle text-[13px] font-normal uppercase tracking-widest text-faint">
              a day
            </span>
          </p>

          <p className="mt-3 text-[15px] text-muted tabular-nums">
            <span className="font-bold">{money(value)}</span> total
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
              <dd className="text-[19px] font-bold tracking-tight tabular-nums sm:text-[21px]">
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
