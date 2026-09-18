/**
 * JSON-LD is a script tag with a payload, not a React tree. Keep it in one
 * component so every page emits identical, valid structured data.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
