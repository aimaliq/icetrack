"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { NETWORKS } from "@/lib/share";

/**
 * A share control that stays out of the way: one button that opens a small
 * menu of networks. The earnings card spells its options out in a row
 * because sharing is the point of that card; here sharing is an offer
 * beside the content, so it collapses to a single affordance.
 */
export function ShareButton({
  url,
  text,
  label,
  align = "right",
}: {
  url: string;
  text: string;
  /** Visible label; omit for the icon alone. */
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // A menu that ignores Escape or a click elsewhere feels stuck.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      // Clipboard blocked, or an insecure origin. The link is in the address
      // bar either way.
    }
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Share"
        className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5
                   text-[13px] text-muted transition-colors duration-150
                   ease-out-strong hover:text-ink"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        {label && <span>{label}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className={`animate-fade-up absolute z-20 mt-1 flex gap-1.5 rounded-full
                      border border-line bg-elevated p-1.5 shadow-lg
                      ${align === "right" ? "right-0" : "left-0"}`}
        >
          {NETWORKS.map((n) => (
            <a
              key={n.name}
              href={n.href(url, text)}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              aria-label={`Share on ${n.name}`}
              title={n.name}
              style={{ backgroundColor: n.color }}
              className="focus-ring grid h-8 w-8 place-items-center rounded-full
                         text-white transition-transform duration-150
                         ease-out-strong hover:scale-110 active:scale-95"
            >
              <n.Icon aria-hidden />
            </a>
          ))}
          <button
            type="button"
            onClick={() => void copy()}
            role="menuitem"
            aria-label="Copy link"
            title="Copy link"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full
                       border border-line transition-transform duration-150
                       ease-out-strong hover:scale-110 active:scale-95"
          >
            {copied ? (
              <Check className="h-4 w-4 text-accent" aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
