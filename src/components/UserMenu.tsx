import Link from "next/link";
import { getCurrentProfile, signOut } from "@/lib/auth/actions";

/** Sign-in link, or the current user's username with a sign-out control. */
export async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Link
        href="/login"
        className="focus-ring rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium
                   text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/u/${profile.username}`}
        className="focus-ring max-w-[10ch] truncate rounded-full px-3 py-1.5
                   text-[13px] font-medium transition-colors duration-150 ease-out-strong hover:bg-sunken sm:max-w-none"
      >
        {profile.username}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="focus-ring rounded-full px-2 py-1.5 text-[13px] text-faint
                     transition-colors duration-150 ease-out-strong hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
