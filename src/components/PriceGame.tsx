"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, X } from "lucide-react";
import { CATEGORY_META } from "@/lib/categories";
import { CATEGORY_SILHOUETTE } from "@/lib/silhouettes";
import { formatValue, formatValueExact } from "@/lib/format";
import { buildRounds, winner, type Contender, type Round } from "@/lib/game";
import { ShareButton } from "@/components/ShareButton";

/**
 * "Which costs more?" — two entries, pick the pricier one.
 *
 * The run ends at the first wrong answer, so the tension is the point: every
 * round is the one that might end it. The streak is the score; the running
 * total in dollars is colour beside it, because "I got 7 in a row" is what
 * people say to each other, not "I accumulated $2.1B".
 *
 * Every figure shown is an estimate the database already publishes, so the
 * game teaches the dataset rather than sitting beside it.
 */

const ROUNDS = 24;

/** How long the answer stays on screen before the next pair. Long enough to
 *  read the two numbers, short enough not to break the rhythm. */
const REVEAL_MS = 1400;

type Phase = "playing" | "revealing" | "over";

function Card({
  asset,
  side,
  onPick,
  state,
  disabled,
}: {
  asset: Contender;
  side: "left" | "right";
  onPick: (side: "left" | "right") => void;
  /** null while unanswered; otherwise what this card turned out to be. */
  state: "won" | "lost" | null;
  disabled: boolean;
}) {
  const meta = CATEGORY_META[asset.category];

  return (
    <button
      type="button"
      onClick={() => onPick(side)}
      disabled={disabled}
      className={`focus-ring group relative flex flex-1 flex-col overflow-hidden rounded-2xl
                  bg-elevated text-left transition-[transform,box-shadow] duration-150
                  ease-out-strong disabled:cursor-default
                  ${
                    state === null
                      ? "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 active:scale-[0.99]"
                      : ""
                  }
                  ${state === "won" ? "ring-2 ring-money" : ""}
                  ${state === "lost" ? "opacity-60" : ""}`}
    >
      <div className="relative grid h-36 w-full place-items-center overflow-hidden bg-sunken sm:h-52">
        {asset.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={asset.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="h-1/3 w-1/3 text-accent/25">
            {CATEGORY_SILHOUETTE[asset.category]}
          </span>
        )}

        {state !== null && (
          <span
            className={`animate-pop absolute grid h-12 w-12 place-items-center rounded-full
                        text-surface ${
                          state === "won" ? "bg-money" : "bg-ink/70"
                        }`}
          >
            {state === "won" ? (
              <Check className="h-6 w-6" aria-hidden />
            ) : (
              <X className="h-6 w-6" aria-hidden />
            )}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] uppercase tracking-widest text-faint">
          {meta.label}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-snug tracking-tight sm:text-[17px]">
          {asset.name}
        </p>
        {asset.ownerName && (
          <p className="mt-0.5 text-[13px] text-muted">{asset.ownerName}</p>
        )}

        {/* The number is the answer, so it only appears once the guess is in. */}
        <p className="mt-auto pt-2 text-[17px] font-bold tabular-nums text-money sm:text-[20px]">
          {state === null ? (
            <span className="text-faint">?</span>
          ) : (
            formatValueExact(asset.estimatedValueUsd ?? 0)
          )}
        </p>
      </div>
    </button>
  );
}

export function PriceGame({ pool }: { pool: Contender[] }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [picked, setPicked] = useState<"left" | "right" | null>(null);
  const [streak, setStreak] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [best, setBest] = useState(0);

  const start = useCallback(() => {
    setRounds(buildRounds(pool, ROUNDS));
    setIndex(0);
    setStreak(0);
    setWallet(0);
    setPicked(null);
    setPhase("playing");
  }, [pool]);

  // Rounds are built in the browser: a server-rendered order would be the
  // same for everyone until the cache expired.
  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem("icetrack-game-best") ?? 0));
    } catch {
      // Private browsing; the record just does not persist.
    }
  }, []);

  const round = rounds[index];

  function pick(side: "left" | "right") {
    if (phase !== "playing" || !round) return;

    const right = winner(round);
    const correct = side === right;
    setPicked(side);
    setPhase("revealing");

    const high = Math.max(
      round.left.estimatedValueUsd ?? 0,
      round.right.estimatedValueUsd ?? 0,
    );
    const low = Math.min(
      round.left.estimatedValueUsd ?? 0,
      round.right.estimatedValueUsd ?? 0,
    );

    if (correct) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setWallet((w) => w + high);
      if (nextStreak > best) {
        setBest(nextStreak);
        try {
          localStorage.setItem("icetrack-game-best", String(nextStreak));
        } catch {
          // As above.
        }
      }
    } else {
      // A wrong guess still costs: the cheaper of the two comes off the pile.
      setWallet((w) => w - low);
    }

    window.setTimeout(() => {
      if (!correct || index + 1 >= rounds.length) {
        setPhase("over");
      } else {
        setIndex((i) => i + 1);
        setPicked(null);
        setPhase("playing");
      }
    }, REVEAL_MS);
  }

  const shareText = useMemo(
    () =>
      [
        `I got ${streak} in a row on IceTrack's "Which costs more?"`,
        wallet !== 0 ? `${formatValue(Math.abs(wallet))} ${wallet > 0 ? "banked" : "in the red"}.` : "",
        "Can you beat it?",
      ]
        .filter(Boolean)
        .join(" "),
    [streak, wallet],
  );

  if (rounds.length === 0) {
    return (
      <p className="mt-10 text-[15px] text-muted">
        Not enough entries with values to play yet.
      </p>
    );
  }

  if (phase === "over") {
    return (
      <div className="mt-10 rounded-2xl bg-elevated p-6 text-center sm:mt-12 sm:p-10">
        <p className="text-[12px] uppercase tracking-widest text-faint">
          {index + 1 >= rounds.length && picked === winner(rounds[index])
            ? "You finished the run"
            : "Run over"}
        </p>

        <p className="mt-3 text-[56px] font-bold leading-none tracking-tightest tabular-nums sm:text-[72px]">
          {streak}
        </p>
        <p className="mt-1 text-[14px] text-muted">
          {streak === 1 ? "correct answer" : "correct in a row"}
        </p>

        <div className="mx-auto mt-6 flex max-w-sm justify-center gap-8">
          <div>
            <p
              className={`text-[20px] font-bold tabular-nums ${
                wallet >= 0 ? "text-money" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {wallet < 0 ? "−" : ""}
              {formatValue(Math.abs(wallet)) ?? "$ 0"}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-faint">
              Portfolio
            </p>
          </div>
          <div>
            <p className="text-[20px] font-bold tabular-nums">{best}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-widest text-faint">
              Your best
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={start}
            className="focus-ring flex items-center gap-2 rounded-full bg-ink px-6 py-2.5
                       text-[14px] font-medium text-surface
                       transition-transform duration-150 ease-out-strong active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Play again
          </button>
          <ShareButton
            url="https://icetrack.vip/play"
            text={shareText}
            label="Share"
          />
        </div>

        <p className="mt-8 text-[12px] text-faint">
          Every figure is a published estimate ·{" "}
          <Link href="/assets" className="hover:text-ink">
            browse the database
          </Link>
        </p>
      </div>
    );
  }

  const right = winner(round);

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-muted">
          Round <span className="font-semibold text-ink">{index + 1}</span>
          <span className="text-faint"> / {rounds.length}</span>
        </p>
        <div className="flex items-center gap-5">
          <p className="text-[13px] text-muted">
            Streak <span className="font-semibold text-ink">{streak}</span>
          </p>
          <p
            className={`text-[13px] font-semibold tabular-nums ${
              wallet >= 0 ? "text-money" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {wallet < 0 ? "−" : ""}
            {formatValue(Math.abs(wallet)) ?? "$ 0"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-center text-[15px] text-muted sm:text-[16px]">
        Which one costs more?
      </p>

      <div className="mt-4 flex gap-3 sm:mt-5 sm:gap-4">
        <Card
          asset={round.left}
          side="left"
          onPick={pick}
          disabled={phase !== "playing"}
          state={phase === "playing" ? null : right === "left" ? "won" : "lost"}
        />
        <Card
          asset={round.right}
          side="right"
          onPick={pick}
          disabled={phase !== "playing"}
          state={phase === "playing" ? null : right === "right" ? "won" : "lost"}
        />
      </div>
    </div>
  );
}
