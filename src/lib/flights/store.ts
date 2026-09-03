import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { cookies } from "next/headers";
import type { TrackPoint } from "./opensky";

export type StoredFlight = {
  id: number;
  icao24: string;
  first_seen: number;
  last_seen: number;
  departure: string | null;
  arrival: string | null;
  path: TrackPoint[];
};

async function reader() {
  try {
    await cookies();
    return await createClient();
  } catch {
    return createPublicClient();
  }
}

/**
 * Recorded flights for one asset, newest first.
 *
 * Thirty days by design: that is as far back as OpenSky retains tracks, so
 * asking for more would show a window the data cannot fill.
 */
export async function flightsForAsset(
  assetUuid: string,
  days = 30,
  limit = 50,
): Promise<StoredFlight[]> {
  const since = Math.floor(Date.now() / 1000) - days * 86_400;
  const db = await reader();

  const { data, error } = await db
    .from("flights")
    .select("id, icao24, first_seen, last_seen, departure, arrival, path")
    .eq("asset_id", assetUuid)
    .gte("last_seen", since)
    .order("last_seen", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as StoredFlight[];
}
