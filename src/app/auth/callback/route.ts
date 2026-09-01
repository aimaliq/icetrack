import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing point.
 *
 * A link can arrive in either of two shapes:
 *
 *   ?code=…                       PKCE, exchanged for a session
 *   ?token_hash=…&type=magiclink  verification, checked as a one-time token
 *
 * PKCE only completes in the same browser that started the flow, because the
 * exchange needs a verifier stored there. Opening the link anywhere else — a
 * different browser, a webmail preview, a link the server requested — fails
 * with "code verifier not found". A one-time token has no such requirement, so
 * when the PKCE exchange fails we fall back to verifying the code as a token
 * rather than sending the user back to sign in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") as EmailOtpType | null) ?? "magiclink";

  // `next` is attacker-controllable, so only same-site paths are honoured.
  const requested = searchParams.get("next") ?? "/";
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  const db = await createClient();
  const done = () => NextResponse.redirect(`${origin}${next}`);
  const failed = (message: string) =>
    NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`,
    );

  if (code) {
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return done();

    // Same value, verified the other way — this is what rescues a link opened
    // outside the browser that requested it.
    const fallback = await db.auth.verifyOtp({ token_hash: code, type });
    if (!fallback.error) return done();

    return failed(error.message);
  }

  if (tokenHash) {
    const { error } = await db.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return done();
    return failed(error.message);
  }

  return failed("link_expired");
}
