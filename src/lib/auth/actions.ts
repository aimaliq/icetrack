"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Sign-in is a six-digit code rather than a magic link.
 *
 * A link has to be opened in the same browser that asked for it, because the
 * PKCE verifier lives there. On a phone the link opens in the mail app's
 * in-app browser instead, which is a different context — so the flow that is
 * hardest to get right is also the most common one. A code carries no
 * browser-local state: it works wherever it is typed.
 */
export type AuthState = {
  error?: string;
  /** Set once a code has been sent, and carried back on the verify step. */
  sent?: string;
} | null;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

/** Turn a Supabase auth error into something the reader can act on. */
function friendly(error: { code?: string; message: string }): string {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();

  if (code === "otp_disabled" || message.includes("signups not allowed")) {
    return "No account uses that email. Check the address, or sign up to create one.";
  }
  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "Too many codes have been sent recently. Wait a minute and try again.";
  }
  if (code === "otp_expired" || message.includes("expired")) {
    return "That code has expired. Request a new one.";
  }
  if (message.includes("invalid") || code === "invalid_credentials") {
    return "That code is not right. Check the digits and try again.";
  }
  return error.message;
}

/**
 * Step one of signing up: claim a username and send a code.
 *
 * The username travels in user metadata, where the `handle_new_user` trigger
 * reads it when creating the profile row. Availability is checked first —
 * finding out about a clash after entering the code would leave the account
 * with a generated name.
 */
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !username) return { error: "Email and username are required." };
  if (!USERNAME_RE.test(username)) {
    return {
      error:
        "Username must be 3–24 characters, using letters, numbers or underscores.",
    };
  }

  const pub = createPublicClient();
  const { data: taken, error: lookupError } = await pub
    .from("profiles")
    .select("username")
    .ilike("username", username)
    .maybeSingle();

  if (lookupError) return { error: "Could not check that username. Try again." };
  if (taken) return { error: `“${username}” is already taken.` };

  const db = await createClient();
  const { error } = await db.auth.signInWithOtp({
    email,
    options: { data: { username } },
  });

  if (error) return { error: friendly(error) };
  return { sent: email };
}

/** Step one of signing in: send a code to an existing account. */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const db = await createClient();
  const { error } = await db.auth.signInWithOtp({
    email,
    // Signing in must not create an account: a typo should say "no account",
    // not silently register a new user under a generated username.
    options: { shouldCreateUser: false },
  });

  if (error) return { error: friendly(error) };
  return { sent: email };
}

/** Step two, for both flows: exchange the code for a session. */
export async function verifyCode(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  // People paste codes with spaces in them.
  const token = String(formData.get("token") ?? "").replace(/\D/g, "");

  if (!email) return { error: "Something went wrong. Start again." };
  if (token.length !== 6) {
    return { error: "Enter the six digits from the email.", sent: email };
  }

  const db = await createClient();
  const { error } = await db.auth.verifyOtp({ email, token, type: "email" });

  if (error) return { error: friendly(error), sent: email };
  redirect("/");
}

export async function signOut() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/");
}

/** The signed-in user's profile, or null. Safe to call from any server component. */
export async function getCurrentProfile() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;

  const { data } = await db
    .from("profiles")
    .select("id, username, display_name, role, edit_count, is_banned")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}
