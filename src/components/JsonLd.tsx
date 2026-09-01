/**
 * Structured data for search engines. Rendered as a plain script tag rather
 * than via next/script so it is present in the static HTML that crawlers read.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own data files, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
