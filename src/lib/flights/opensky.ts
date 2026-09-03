/**
 * OpenSky Network client.
 *
 * OpenSky publishes ADS-B positions, which aircraft broadcast in the clear and
 * volunteer receivers collect. It is free and, importantly, licensed for
 * non-commercial use only — see docs/FLIGHT-MAP.md before putting advertising
 * or subscriptions on this site.
 *
 * Basic auth was retired in March 2026; this uses the OAuth2 client
 * credentials flow.
 */

const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const API = "https://opensky-network.org/api";

/** One recorded position on a flight path. */
export type TrackPoint = {
  time: number;
  lat: number;
  lon: number;
  altitude: number | null;
};

export type Flight = {
  icao24: string;
  firstSeen: number;
  lastSeen: number;
  departure: string | null;
  arrival: string | null;
  path: TrackPoint[];
};

let cached: { token: string; expires: number } | null = null;

async function token(): Promise<string | null> {
  const id = process.env.OPENSKY_CLIENT_ID;
  const secret = process.env.OPENSKY_CLIENT_SECRET;
  if (!id || !secret) return null;

  if (cached && cached.expires > Date.now() + 30_000) return cached.token;

  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: id,
        client_secret: secret,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  cached = {
    token: json.access_token,
    expires: Date.now() + (json.expires_in ?? 1800) * 1000,
  };
  return cached.token;
}

/** Every call is bounded: one hung request must not pin the whole run. */
const TIMEOUT_MS = 15_000;

async function get<T>(path: string): Promise<T | null> {
  const bearer = await token();

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
      // Positions change constantly; nothing here should be cached by the
      // fetch layer, since we store what we collect ourselves.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return null;
  }
  // Tokens last 30 minutes. On a warm instance the cached one can be stale, so
  // a 401 means "get a new token and try once more", not "give up".
  if (res.status === 401) {
    cached = null;
    const fresh = await token();
    if (!fresh) return null;
    try {
      res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${fresh}` },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return null;
    }
  }

  // 404 means "no data for that window", which is normal for an aircraft that
  // has not flown, not an error worth throwing over.
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return (await res.json()) as T;
}

type RawFlight = {
  icao24: string;
  firstSeen: number;
  lastSeen: number;
  estDepartureAirport: string | null;
  estArrivalAirport: string | null;
};

/**
 * Flights for one aircraft over a window.
 *
 * OpenSky only accepts two-day windows and only serves flights its overnight
 * batch has already processed, so the most recent day or so is never here.
 */
export async function flightsFor(
  icao24: string,
  begin: number,
  end: number,
): Promise<RawFlight[]> {
  const q = `?icao24=${icao24}&begin=${Math.floor(begin)}&end=${Math.floor(end)}`;
  return (await get<RawFlight[]>(`/flights/aircraft${q}`)) ?? [];
}

type RawTrack = {
  icao24: string;
  path: [number, number, number, number, boolean][];
};

/**
 * The flown path for one flight. `time` is any moment during it.
 *
 * Tracks older than 30 days are not retained by OpenSky, which is why we copy
 * what we fetch into our own table.
 */
export async function trackFor(
  icao24: string,
  time: number,
): Promise<TrackPoint[]> {
  const raw = await get<RawTrack>(`/tracks/all?icao24=${icao24}&time=${Math.floor(time)}`);
  if (!raw?.path) return [];

  return raw.path
    .map(([t, lat, lon, alt]) => ({ time: t, lat, lon, altitude: alt }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}
