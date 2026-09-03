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
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  // Vercel Cron signs its requests; anything else needs the shared secret.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "collector not configured" }, { status: 503 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: jets } = await db
    .from("assets")
    .select("id, slug, specs")
    .eq("category", "jet")
    .eq("is_deleted", false);

  const tracked = (jets ?? []).filter(
    (a) => typeof (a.specs as Record<string, unknown>)?.icao24 === "string",
  );

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

    // OpenSky caps a query at two days, so walk back in two-day steps.
    for (let day = 0; day < 30; day += 2) {
      const end = now - day * 86_400;
      const begin = end - 2 * 86_400;

      const found = await flightsFor(icao24, begin, end);
      for (const f of found) {
        const path = await trackFor(icao24, f.firstSeen);
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
        if (!error) added += 1;
      }
    }
  }

  await db.rpc("prune_flights");

  return NextResponse.json({
    tracked: tracked.length,
    added,
    ...(problems.length ? { problems } : {}),
  });
}
