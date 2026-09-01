"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/site";

export type AuthState = { error?: string; sent?: string } | null;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

/**
 * Sign-up: email + username, delivered as a magic link.
 *
 * The username rides along in user metadata, where the `handle_new_user`
 * trigger reads it when creating the profile row. It is checked for
 * availability first — discovering a clash only after clicking the emailed
 * link would strand the user with a fallback username.
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
    options: {
      data: { username },
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { sent: email };
}

/** Sign-in for an existing account: email only. */
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const db = await createClient();
  const { error } = await db.auth.signInWithOtp({
    email,
    // Sign-in must not create an account: a typo should say "no account",
    // not silently register a new user with a generated username.
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return error.message.toLowerCase().includes("signups not allowed")
      ? { error: "No account uses that email. Sign up instead." }
      : { error: error.message };
  }
  return { sent: email };
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
