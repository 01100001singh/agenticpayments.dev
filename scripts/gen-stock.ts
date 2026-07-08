/**
 * gen-stock — generate the machine twin (.stock.json) for every Cut.
 *
 * The twin is generated, never hand-edited, so the two renditions cannot
 * drift. Where a Cut ships a human-reviewed sidecar (cut-XXXX.claims.json)
 * its gist/claims/entities/relations/version override the derived defaults.
 *
 * Output is canonical (sorted keys, LF, no timestamps): two builds from the
 * same source are byte-identical. Signing happens in a separate step.
 */
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalize } from './lib/canonical.ts';
import { loadCuts, lexiconSlugs, isoDate, PUBLIC_DIR, SITE } from './lib/cuts.ts';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const outDir = join(PUBLIC_DIR, 'cuts');
mkdirSync(outDir, { recursive: true });

const slugs = lexiconSlugs();
const cuts = loadCuts().filter((c) => !c.data.draft);

// Remove orphaned twins of Cuts that no longer exist (or went draft) —
// a superseded Cut keeps its page and twin; a deleted Cut keeps neither.
const live = new Set(cuts.map((c) => `${c.data.id}.stock.json`));
for (const f of readdirSync(outDir).filter((f) => f.endsWith('.stock.json'))) {
  if (!live.has(f)) unlinkSync(join(outDir, f));
}

for (const cut of cuts) {
  const fm = cut.data;
  const url = `${SITE}/cuts/${fm.slug ?? fm.id}`;
  const date = isoDate(fm.date)!;
  const [y, m] = date.split('-');
  const contentHash = 'sha256:' + createHash('sha256').update(cut.raw, 'utf8').digest('hex');

  // Derived defaults; the sidecar (human-reviewed) overrides.
  const firstPara = cut.body.split(/\n\n+/)[0].replace(/\n/g, ' ').trim();
  const entities: Record<string, string> = {};
  for (const tag of fm.tags ?? []) {
    if (slugs.has(tag)) entities[tag] = `lexicon/${tag}`;
  }

  const stock = {
    id: fm.id,
    canonical_url: url,
    content_hash: contentHash,
    version: cut.claims?.version ?? 1,
    gist: cut.claims?.gist ?? firstPara,
    claims: cut.claims?.claims ?? [],
    entities: cut.claims?.entities ?? entities,
    relations:
      cut.claims?.relations ??
      (fm.related ?? []).map((target: string) => ({ type: 'related', target })),
    provenance: fm.provenance,
    license: fm.license,
    valid_as_of: isoDate(fm.valid_as_of),
    stale_after: isoDate(fm.stale_after) ?? null,
    superseded_by: fm.superseded_by ?? null,
    suggested_citation: `agenticpayments.dev, "${fm.title}" (${fm.id}), ${MONTHS[Number(m) - 1]} ${y}, ${url}`,
    sig: null, // filled by scripts/sign.ts
  };

  writeFileSync(join(outDir, `${fm.id}.stock.json`), canonicalize(stock), 'utf8');
}

console.log(`✓ Stock generated for ${cuts.length} Cut${cuts.length === 1 ? '' : 's'}.`);
