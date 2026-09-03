import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { flightsFor, trackFor } from "@/lib/flights/opensky";

/**
 * Collects recent flights for every tracked aircraft.
 *
 * Run on a schedule rather than on page load: OpenSky's rate limits are far
 * too tight to query per visitor, and its flight index is built by an
 * overnight batch, so the most recent day is never available anyway.
 *
 * Writes with the service role because the flights table grants no insert to
 * any client role — a contributor must not be able to fabricate a flight path.
 */
/**
 * Vercel caps this by plan — 60s on Hobby — and the platform kills the
 * function without warning when it overruns. Ask for 60 and keep the internal
 * budget well under it, so the run stops on its own terms and reports back.
 */
export const maxDuration = 60;

/**
 * How far back to look for an aircraft's most recent flight.
 *
 * The collector stops at the first day that has one, so a jet that flew
 * yesterday costs a single request. Only aircraft that have been sitting still
 * for weeks walk the full window, and they are the cheap case anyway: no
 * flights means no track fetches.
 *
 * `?days=` raises it, and `?all=1` keeps going instead of stopping at the
 * first day with flights, for a full backfill.
 */
const DEFAULT_DAYS = 30;

export async function GET(request: NextRequest) {
  // Vercel Cron sends the secret as a bearer token. A browser or a shell that
  // mangles headers can pass ?key= instead, which is no weaker: both carry the
  // same secret over TLS, and the query string is not logged anywhere we keep.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const query = request.nextUrl.searchParams.get("key");
    const given = (bearer ?? query ?? "").trim();

    if (given !== secret.trim()) {
      return NextResponse.json(
        {
          error: "unauthorized",
          hint: given
            ? "That key does not match CRON_SECRET on the server."
            : "Send the secret as an Authorization: Bearer header, or as ?key=",
        },
        { status: 401 },
      );
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "collector not configured" }, { status: 503 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: jets, error: listError } = await db
    .from("assets")
    .select("id, slug, specs")
    .eq("category", "jet")
    .eq("is_deleted", false);

  if (listError) {
    return NextResponse.json(
      { error: "could not list aircraft", detail: listError.message },
      { status: 500 },
    );
  }

  // ?only=<slug or icao24> narrows the run to one aircraft, which is how to
  // check the pipeline without waiting on the whole fleet.
  const only = request.nextUrl.searchParams.get("only")?.toLowerCase().trim();

  const hexOf = (a: { specs: unknown }) =>
    String((a.specs as Record<string, unknown>)?.icao24 ?? "")
      .toLowerCase()
      .trim();

  const tracked = (jets ?? [])
    // Six hex characters, the same shape the table's check constraint wants.
    // An empty string used to pass here, and OpenSky takes twenty seconds to
    // reject one — enough on its own to time the whole run out.
    .filter((a) => /^[0-9a-f]{6}$/.test(hexOf(a)))
    .filter((a) => {
      if (!only) return true;
      return a.slug.toLowerCase().includes(only) || hexOf(a) === only;
    });

  // Track fetches cost about five seconds each, so a run has to watch the
  // clock: Vercel kills the function at 300s and everything not yet written
  // is lost. Stop early and leave the rest for the next run.
  const startedAt = Date.now();
  const BUDGET_MS = 45_000;
  const outOfTime = () => Date.now() - startedAt > BUDGET_MS;

  // ?probe=1 exercises each step once and reports how long it took, which is
  // the only way to see inside a function that dies on a gateway timeout.
  if (request.nextUrl.searchParams.get("probe") === "1") {
    const steps: Record<string, string> = {};
    const time = async <T,>(name: string, fn: () => Promise<T>): Promise<T | null> => {
      const t0 = Date.now();
      try {
        const out = await fn();
        steps[name] = `${Date.now() - t0}ms`;
        return out;
      } catch (e) {
        steps[name] = `failed after ${Date.now() - t0}ms: ${
          e instanceof Error ? e.message : String(e)
        }`;
        return null;
      }
    };

    const first = tracked[0];
    if (!first) {
      return NextResponse.json({
        error: "no aircraft with a valid icao24",
        checked: (jets ?? []).length,
      });
    }
    const hex = hexOf(first);

    const DAY = 86_400;
    const midnight = Math.floor(Date.now() / 1000 / DAY) * DAY;

    const found = await time("openskyFlights", () =>
      flightsFor(hex, midnight - DAY, midnight),
    );
    if (found?.[0]) {
      await time("openskyTrack", () => trackFor(hex, found[0].firstSeen));
    }

    await time("supabaseWrite", async () => {
      const { error } = await db.from("flights").upsert(
        {
          asset_id: first.id,
          icao24: hex,
          first_seen: 1,
          last_seen: 2,
          path: [],
        },
        { onConflict: "icao24,first_seen", ignoreDuplicates: true },
      );
      if (error) throw new Error(`${error.code} ${error.message}`);
      return true;
    });

    return NextResponse.json({
      aircraft: first?.slug ?? "(none)",
      icao24: hex,
      flightsFound: found?.length ?? 0,
      steps,
    });
  }

  const requested = Number(request.nextUrl.searchParams.get("days"));
  const days =
    Number.isFinite(requested) && requested > 0
      ? Math.min(requested, 30)
      : DEFAULT_DAYS;

  // By default take the most recent flights and stop; ?all=1 walks the whole
  // window, which is what a first run or a backfill wants.
  const wantAll = request.nextUrl.searchParams.get("all") === "1";

  const now = Math.floor(Date.now() / 1000);
  let added = 0;
  const problems: string[] = [];

  for (const jet of tracked) {
    const icao24 = String((jet.specs as Record<string, unknown>).icao24)
      .toLowerCase()
      .trim();
    if (!/^[0-9a-f]{6}$/.test(icao24)) {
      problems.push(`${jet.slug}: icao24 "${icao24}" is not six hex characters`);
      continue;
    }

    // OpenSky rejects a window that spans more than two calendar days, not
    // two arbitrary 24-hour periods, so query one UTC day at a time.
    const DAY = 86_400;
    const midnight = Math.floor(now / DAY) * DAY;
    let foundAny = false;

    if (outOfTime()) break;

    for (let back = 1; back <= days; back++) {
      const begin = midnight - back * DAY;
      const end = begin + DAY;

      try {
        const found = await flightsFor(icao24, begin, end);
        if (found.length > 0) foundAny = true;

        for (const f of found) {
          // The flight row matters more than its path: write it first, so a
          // run that runs out of time still leaves the record behind. Paths
          // are filled in by a later pass.
          const path = outOfTime() ? [] : await trackFor(icao24, f.firstSeen);

          const { error } = await db.from("flights").upsert(
            {
              asset_id: jet.id,
              icao24,
              first_seen: f.firstSeen,
              last_seen: f.lastSeen,
              departure: f.estDepartureAirport,
              arrival: f.estArrivalAirport,
              path,
            },
            { onConflict: "icao24,first_seen", ignoreDuplicates: true },
          );
          if (error) {
            // 42501 is permission denied: it will fail identically for every
            // row, so stop rather than grinding through the fleet.
            if (error.code === "42501") {
              return NextResponse.json(
                {
                  error: "cannot write flights",
                  detail: error.message,
                  fix: "Apply supabase/migrations/0011_flights_grants.sql",
                },
                { status: 500 },
              );
            }
            problems.push(`${jet.slug}: ${error.message}`);
          } else {
            added += 1;
          }
        }
      } catch (e) {
        // One bad day should not abort the run and return an opaque 500.
        problems.push(
          `${jet.slug} day -${back}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }

      // Found the aircraft's latest activity; no need to keep walking back.
      if (foundAny && !wantAll) break;
    }
  }

  const { error: pruneError } = await db.rpc("prune_flights");
  if (pruneError) problems.push(`prune: ${pruneError.message}`);

  return NextResponse.json({
    tracked: tracked.length,
    days,
    mode: wantAll ? "full" : "latest",
    added,
    seconds: Math.round((Date.now() - startedAt) / 1000),
    ...(outOfTime() ? { note: "stopped on time budget; run again to continue" } : {}),
    ...(problems.length ? { problems } : {}),
  });
}
