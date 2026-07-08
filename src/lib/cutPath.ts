// Human URL path for a Cut: keyword slug when the Cut declares one, atomic
// id otherwise. The machine twin stays id-addressed (/cuts/{id}.stock.json)
// either way — slugs do the wayfinding, ids do the bookkeeping.
export const cutPath = (d: { id: string; slug?: string }) => `/cuts/${d.slug ?? d.id}/`;
