import type { ImageCredit as Credit } from "@/lib/types";

/**
 * Attribution line. CC BY-SA and most Commons licences require crediting the
 * author, so this renders wherever a licensed image is shown.
 */
export function ImageCredit({ credit }: { credit?: Credit }) {
  if (!credit?.author && !credit?.license) return null;

  const body = (
    <>
      {credit.author && <>Photo: {credit.author}</>}
      {credit.author && credit.license && " · "}
      {credit.license}
    </>
  );

  return (
    <p className="mt-2 text-[11px] leading-relaxed text-faint">
      {credit.sourcePage ? (
        <a
          href={credit.sourcePage}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {body}
        </a>
      ) : (
        body
      )}
    </p>
  );
}
