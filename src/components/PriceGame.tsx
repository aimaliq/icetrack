"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, X } from "lucide-react";
import { CATEGORY_META } from "@/lib/categories";
import { CATEGORY_SILHOUETTE } from "@/lib/silhouettes";
import { formatValue, formatValueExact } from "@/lib/format";
import { buildRounds, winner, type Contender, type Round } from "@/lib/game";
import { ShareButton } from "@/components/ShareButton";
import { RunChart, runGrid } from "@/components/RunChart";

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

/**
 * The figure rolls up to its value instead of appearing, the way a slot
 * machine settles. Short — 650ms — because it sits inside the reveal pause
 * and the round has to keep moving.
 *
 * Under prefers-reduced-motion the number simply appears: a spinning
 * counter is exactly what that setting exists to stop.
 */
function SpinningValue({
  value,
  durationMs = 650,
  compact = false,
  startAt,
}: {
  value: number;
  durationMs?: number;
  /** Compact renders "$ 4.1B"; otherwise the figure in full. */
  compact?: boolean;
  /** Where the first roll begins. Revealing a price counts up from zero;
   *  a running total carries on from where it was. */
  startAt?: number;
}) {
  const [shown, setShown] = useState(startAt ?? value);
  // Where this roll starts. A ref, not state: changing it must not itself
  // trigger a render, or the roll restarts from wherever it had reached.
  const from = useRef(startAt ?? value);

  useEffect(() => {
    const start = from.current;
    if (
      start === value ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(value);
      from.current = value;
      return;
    }

    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(Math.round(start + (value - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  if (compact) {
    return (
      <>
        {shown < 0 ? "−" : ""}
        {formatValue(Math.abs(shown)) ?? "$ 0"}
      </>
    );
  }
  return <>{formatValueExact(shown)}</>;
}

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
      className={`focus-ring group relative flex flex-1 flex-col rounded-2xl
                  bg-elevated text-left transition-[transform,box-shadow] duration-150
                  ease-out-strong disabled:cursor-default
                  ${
                    state === null
                      ? "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 active:scale-[0.99]"
                      : ""
                  }
                  ${
                    state === "won"
                      ? "animate-win border-runner ring-2 ring-money"
                      : ""
                  }
                  ${state === "lost" ? "animate-lose opacity-60" : ""}`}
    >
      <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-t-2xl bg-sunken sm:h-52">
        {asset.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={asset.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-accent/25">
            <span className="h-16 w-16">
              {CATEGORY_SILHOUETTE[asset.category]}
            </span>
          </span>
        )}

        {state !== null && (
          // Two elements, because one cannot both hold a centring translate
          // and animate a scale: the keyframe's transform replaces the
          // translate and the badge slides off-centre as it pops. The outer
          // span centres, the inner one animates.
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span
              className={`animate-pop grid h-12 w-12 place-items-center rounded-full
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
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center p-3 text-center sm:p-4">
        <p className="text-[11px] uppercase tracking-widest text-faint">
          {meta.label}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-snug tracking-tight sm:text-[17px]">
          {asset.name}
        </p>
        {asset.ownerName && (
          <p className="mt-0.5 text-[13px] text-muted">{asset.ownerName}</p>
        )}

        {/* The number is the answer, so it only appears once the guess is in.
            It counts up rather than snapping: the pause is the moment the
            round turns, and a figure that climbs draws the eye to it. */}
        <div className="mt-auto pt-2.5 text-[20px] font-bold tabular-nums text-money sm:text-[26px]">
          {state === null ? (
            <span className="text-faint">?</span>
          ) : (
            <SpinningValue value={asset.estimatedValueUsd ?? 0} startAt={0} />
          )}
        </div>
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
  /** One entry per answered round, for the chart and the shareable grid. */
  const [history, setHistory] = useState<{ ok: boolean; balance: number }[]>([]);
  const [best, setBest] = useState(0);

  const start = useCallback(() => {
    setRounds(buildRounds(pool, ROUNDS));
    setIndex(0);
    setStreak(0);
    setWallet(0);
    setHistory([]);
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

    const balance = wallet + (correct ? high : -low);
    setHistory((h) => [...h, { ok: correct, balance }]);

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

  // Wordle's real trick is that the result pastes as text anywhere — no
  // image, no link preview required. The grid carries the whole run.
  const shareText = useMemo(
    () =>
      [
        `IceTrack · Which costs more?`,
        `${streak} in a row · ${wallet < 0 ? "−" : ""}${
          formatValue(Math.abs(wallet)) ?? "$ 0"
        }`,
        runGrid(history),
        "Can you beat it?",
      ].join("\n"),
    [streak, wallet, history],
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

        <RunChart points={history} />

        {/* The same grid the share text carries, so what you post is what you
            saw. */}
        <p className="mt-3 text-[17px] leading-relaxed tracking-[0.12em] break-all">
          {runGrid(history)}
        </p>

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
      {/* Three columns so the streak sits dead centre whatever the side
          figures are: it is the number people quote to each other, and the
          only one that deserves the eye. Both flanks are labelled — an
          unlabelled figure makes the reader work out what it counts. */}
      <div className="grid grid-cols-3 items-end gap-3">
        <div>
          {/* No denominator: the 24-round cap is how far the data stretches,
              not a goal the player is working toward. Showing it invites a
              question the run never answers, since one wrong ends it. */}
          <p className="text-[20px] font-bold tabular-nums sm:text-[24px]">
            {index + 1}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
            Round
          </p>
        </div>

        <div className="text-center">
          <p
            // Re-keyed on the value so the animation restarts each time it
            // changes; without the key React reuses the node and the
            // keyframe never replays.
            key={streak}
            className={`${streak > 0 ? "animate-streak-up" : ""}
              text-[40px] font-bold leading-none tabular-nums sm:text-[52px] ${
                streak >= 5
                  ? "text-amber-500"
                  : streak > 0
                    ? "text-ink"
                    : "text-faint"
              }`}
          >
            {streak}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
            {/* Past five the run is worth showing off about. */}
            {streak >= 5 ? "🔥 On fire" : "Streak"}
          </p>
        </div>

        <div className="text-right">
          <p
            className={`text-[20px] font-bold tabular-nums sm:text-[24px] ${
              wallet >= 0 ? "text-money" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            <SpinningValue value={wallet} durationMs={800} compact />
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
            Total guessed
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex gap-3 sm:mt-7 sm:gap-4">
        {/* Sits over the gap, so the pair reads as a head-to-head rather
            than as two list items that happen to be adjacent. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-10 w-10
                     -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full
                     border border-line bg-surface text-[12px] font-bold uppercase
                     tracking-wide text-muted shadow-md sm:h-12 sm:w-12 sm:text-[13px]"
        >
          vs
        </span>
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
