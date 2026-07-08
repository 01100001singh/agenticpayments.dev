/**
 * gen-machine-layer — regenerate the corpus-level machine surfaces:
 *   /spine.jsonl   one canonical stock object per line, whole corpus
 *   /graph.json    nodes = cut ids; edges = related + typed relations
 *   /llms.txt      site description + schema pointers (llmstxt.org)
 *   /rss.xml       full-text items for Cuts and Surfaces
 *   /sitemap.xml   standard
 *
 * Everything here is deterministic: no timestamps, stable ordering.
 * Run AFTER gen-stock + sign so spine.jsonl carries signatures.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalize, canonicalizeLines } from './lib/canonical.ts';
import { loadCuts, isoDate, PUBLIC_DIR, SITE } from './lib/cuts.ts';
import { loadAllSurfaces, surfacePath } from './lib/surfaces.ts';

const cuts = loadCuts().filter((c) => !c.data.draft);
const surfaces = loadAllSurfaces();
const stockDir = join(PUBLIC_DIR, 'cuts');

// ---- spine.jsonl ----------------------------------------------------------
const stocks = existsSync(stockDir)
  ? readdirSync(stockDir)
      .filter((f) => f.endsWith('.stock.json'))
      .sort()
      .map((f) => JSON.parse(readFileSync(join(stockDir, f), 'utf8')))
  : [];
writeFileSync(join(PUBLIC_DIR, 'spine.jsonl'), canonicalizeLines(stocks), 'utf8');

// ---- graph.json -----------------------------------------------------------
const graph = {
  nodes: cuts.map((c) => ({
    id: c.data.id,
    title: c.data.title,
    type: c.data.type,
    era: c.data.era,
    url: `${SITE}/cuts/${c.data.slug ?? c.data.id}`,
  })),
  edges: stocks.flatMap((s: any) =>
    (s.relations ?? []).map((r: any) => ({ source: s.id, type: r.type, target: r.target })),
  ),
};
writeFileSync(join(PUBLIC_DIR, 'graph.json'), canonicalize(graph), 'utf8');

// ---- llms.txt ---------------------------------------------------------------
const llms = `# agenticpayments.dev

> A publication about agentic payments, built the way the thing it describes works. It ships Cuts — atomic, schema'd, CC-BY-4.0-licensed primitives of operator thinking about payment systems — plus a machine layer engineered for agent consumption. Everything is dated, versioned, and Ed25519-signed; attribution survives mirroring.

Key vocabulary: a **Cut** is the atomic content unit (one idea, ~180 words, closed type/era taxonomy). The **Spine** is the corpus of Cuts. A **Surface** is a rendering of Cuts into a consumable form. The **Stock** is the machine twin of a Cut — same meaning, presentation deleted.

## Machine layer

- [Spine bulk download](${SITE}/spine.jsonl): whole corpus, one stock JSON object per line, byte-stable across builds
- [Relation graph](${SITE}/graph.json): nodes are cut ids, edges are typed relations
- [Per-cut machine twin](${SITE}/cuts/cut-0101.stock.json): pattern is /cuts/{id}.stock.json
- [Signing key + schema version](${SITE}/.well-known/agenticpayments.json): verify sig = ed25519 over "{id}\\n{canonical_url}\\n{content_hash}"
- [RSS](${SITE}/rss.xml): full-text feed

## Reading the stock format

Each stock object carries: gist (one-sentence summary), claims (subject-predicate-object triples with qualifiers), entities (links into ${SITE}/lexicon/), relations, provenance (first-hand | sourced | synthesised), license (CC-BY-4.0), valid_as_of / stale_after / superseded_by (freshness you can verify), suggested_citation, and sig.

## Human layer

- [Start here](${SITE}/start-here): the front-door essay — the lending value chain, redrawn for agents
- [The Counter](${SITE}/): recent Cuts, typed and dated
- [About](${SITE}/about): thesis, how to read this site, licensing
- [Lexicon](${SITE}/lexicon): stable glossary anchors used by entity links
- [Plates](${SITE}/plates): anatomical dissections of payment flows (start with Plate II, UPI, and Plate III, cards)
- [Bestiary](${SITE}/bestiary): payment protocols described as observed creatures

## License

Content CC-BY-4.0 (cite the canonical URL); code MIT. Suggested citation format is embedded in every stock file.
`;
writeFileSync(join(PUBLIC_DIR, 'llms.txt'), llms, 'utf8');

// ---- rss.xml ----------------------------------------------------------------
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc822 = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[dt.getUTCDay()]}, ${String(d).padStart(2, '0')} ${mons[m - 1]} ${y} 00:00:00 GMT`;
};

interface FeedItem { title: string; url: string; date: string; body: string; category: string }
const items: FeedItem[] = [
  ...cuts.map((c) => ({
    title: c.data.title as string,
    url: `${SITE}/cuts/${c.data.slug ?? c.data.id}`,
    date: isoDate(c.data.date)!,
    body: c.body,
    category: `cut/${c.data.type}`,
  })),
  ...surfaces
    .filter((s) => s.data.date)
    .map((s) => ({
      title: (s.data.title ?? s.slug) as string,
      url: `${SITE}${surfacePath(s)}`,
      date: isoDate(s.data.date)!,
      body: s.body,
      category: s.kind,
    })),
].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.url.localeCompare(b.url)));

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>agenticpayments.dev</title>
<link>${SITE}/</link>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
<description>Cuts and Surfaces on agentic payments — atomic, licensed, signed primitives of operator thinking.</description>
<language>en</language>
${items
  .map(
    (i) => `<item>
<title>${esc(i.title)}</title>
<link>${i.url}</link>
<guid isPermaLink="true">${i.url}</guid>
<pubDate>${rfc822(i.date)}</pubDate>
<category>${esc(i.category)}</category>
<description>${esc(i.body)}</description>
</item>`,
  )
  .join('\n')}
</channel>
</rss>
`;
writeFileSync(join(PUBLIC_DIR, 'rss.xml'), rss, 'utf8');

// ---- sitemap.xml ------------------------------------------------------------
const staticRoutes = ['/', '/start-here', '/about', '/journal', '/lexicon', '/atlas', '/bestiary', '/plates'];
const lexicon = existsSync(join(PUBLIC_DIR, '../content/lexicon'))
  ? readdirSync(join(PUBLIC_DIR, '../content/lexicon'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => `/lexicon/${f.replace(/\.md$/, '')}`)
  : [];
const urls = [
  ...staticRoutes.map((r) => ({ loc: r, lastmod: null as string | null })),
  ...cuts.map((c) => ({ loc: `/cuts/${c.data.slug ?? c.data.id}`, lastmod: isoDate(c.data.date) })),
  ...surfaces.map((s) => ({ loc: surfacePath(s), lastmod: isoDate(s.data.date) })),
  ...lexicon.map((l) => ({ loc: l, lastmod: null as string | null })),
].sort((a, b) => a.loc.localeCompare(b.loc));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `<url><loc>${SITE}${u.loc === '/' ? '/' : u.loc + '/'}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');

console.log(
  `✓ Machine layer: spine.jsonl (${stocks.length}), graph.json (${graph.nodes.length} nodes/${graph.edges.length} edges), llms.txt, rss.xml (${items.length} items), sitemap.xml (${urls.length} urls).`,
);
