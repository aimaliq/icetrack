import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/actions";

/** "Add" affordance, shown only to signed-in contributors. */
export async function AddButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile || profile.is_banned) return null;

  return (
    <Link
      href={href}
      className="focus-ring rounded-full bg-ink px-4 py-2 text-[13px] font-medium
                 text-surface transition hover:opacity-90"
    >
      {label}
    </Link>
  );
}
