/**
 * Structured data for search engines. Rendered as a plain script tag rather
 * than via next/script so it is present in the static HTML that crawlers read.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Names, bios and summaries in here are contributor-written, and a
      // literal "</script>" inside a script tag ends it no matter what the
      // JSON around it says. Escaping "<" closes that door; the JSON parses
      // identically.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
