/**
 * "What would you have to earn to afford this?"
 *
 * A price tag in the tens of millions is a number people read past. Divided
 * into a wage — this much every hour, every day — it lands, because everyone
 * already knows what their own hour is worth.
 *
 * The arithmetic is deliberately naive: no interest, no tax, no compounding.
 * It is a way of feeling a number, not a savings plan, and pretending
 * otherwise would make it worse rather than more useful.
 *
 * Shared by the page component and the share card so the figure someone reads
 * on the page is the figure their followers see.
 */

/** Slider stops. Uneven on purpose — a linear scale spends most of its travel
 *  in a range nobody picks, so the stops are the spans people actually mean. */
export const STOPS = [
  { months: 1, label: "1 month" },
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "1 year" },
  { months: 24, label: "2 years" },
  { months: 60, label: "5 years" },
  { months: 120, label: "10 years" },
  { months: 240, label: "20 years" },
  { months: 480, label: "40 years" },
] as const;

/** 1 year. Long enough to be a real span, short enough to bite. */
export const DEFAULT_STOP = 3;

/** 365.25 days a year, so a leap year does not skew the daily figure. */
const DAYS_PER_MONTH = 365.25 / 12;

export type Row = { label: string; amount: number; note?: string };

/**
 * Money at wildly different magnitudes in one column: $2.4M a month next to
 * $0.79 a second. Fixed decimals would print either noise or nothing, so the
 * precision follows the size of the number.
 */
export function money(n: number): string {
  if (n >= 1000) {
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (n >= 1) {
    return `$${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  // Below a dollar, two decimals would round most values to $0.00.
  return `$${n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}

/**
 * Every rate for one value over one span.
 *
 * "Per year" leads and is dropped by the caller when the span is under a year,
 * where it would state an annual figure for a period that is not a year.
 */
export function breakdown(value: number, months: number): Row[] {
  const days = months * DAYS_PER_MONTH;

  return [
    { label: "Per year", amount: value / (months / 12) },
    { label: "Per month", amount: value / months },
    { label: "Per week", amount: value / (days / 7) },
    { label: "Per day", amount: value / days },
    { label: "Per hour", amount: value / (days * 24), note: "24/7" },
    { label: "Per working hour", amount: value / (days * 8), note: "8h days" },
    { label: "Per minute", amount: value / (days * 24 * 60) },
    { label: "Per second", amount: value / (days * 24 * 60 * 60) },
  ];
}
