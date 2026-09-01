import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/actions";

/**
 * Edit affordance. Hidden from signed-out visitors: the wiki is open, but the
 * invitation to edit only makes sense once you can actually save.
 */
export async function EditButton({ href }: { href: string }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.is_banned) return null;

  return (
    <Link
      href={href}
      className="focus-ring rounded-full border border-line px-4 py-1.5 text-[13px]
                 transition hover:bg-sunken"
    >
      Edit
    </Link>
  );
}
