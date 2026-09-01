import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less client for build-time and static contexts — sitemap,
 * generateStaticParams, OG image generation.
 *
 * `cookies()` is unavailable there, and no user session exists anyway: these
 * read only public data, which RLS already exposes to the anon role.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
}
