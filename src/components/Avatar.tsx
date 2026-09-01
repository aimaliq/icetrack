import type { Celebrity } from "@/lib/types";

const SIZES = {
  sm: "h-11 w-11 text-[13px]",
  md: "h-16 w-16 text-lg",
  lg: "h-28 w-28 text-3xl sm:h-32 sm:w-32",
} as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Instagram-style circular profile photo, with a monogram fallback. */
export function Avatar({
  person,
  size = "md",
}: {
  person: Pick<Celebrity, "name" | "imageUrl">;
  size?: keyof typeof SIZES;
}) {
  return (
    <div
      className={`${SIZES[size]} relative shrink-0 overflow-hidden rounded-full
                  border border-line bg-sunken`}
    >
      {person.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={person.imageUrl}
          alt={person.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center font-semibold text-faint">
          {initials(person.name)}
        </span>
      )}
    </div>
  );
}
