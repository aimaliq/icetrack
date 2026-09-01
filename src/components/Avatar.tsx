import type { Celebrity } from "@/lib/types";

const SIZES = {
  sm: "h-12 w-12 text-[14px]",
  md: "h-20 w-20 text-xl",
  lg: "h-32 w-32 text-4xl sm:h-40 sm:w-40",
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
                  bg-sunken ring-1 ring-line`}
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
