/**
 * validate — frontmatter validation for every Cut in the Spine.
 * Closed enums for `type` and `era`; free-text values fail the build.
 * Also checks: id matches filename, `related` ids exist, dates are ISO,
 * superseded_by (when set) exists.
 */
import { z } from 'zod';
import { loadCuts, CUT_TYPES, CUT_ERAS, isoDate } from './lib/cuts.ts';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be an ISO date (YYYY-MM-DD)');

const cutSchema = z
  .object({
    id: z.string().regex(/^cut-\d{4}$/, 'id must look like cut-0142'),
    date: isoDateString,
    type: z.enum(CUT_TYPES),
    title: z.string().min(3).max(120),
    era: z.enum(CUT_ERAS),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(8),
    related: z.array(z.string().regex(/^cut-\d{4}$/)).default([]),
    license: z.literal('CC-BY-4.0'),
    length: z.string().optional(),
    remixable_as: z.array(z.string()).optional(),
    provenance: z.enum(['first-hand', 'sourced', 'synthesised']),
    valid_as_of: isoDateString,
    stale_after: isoDateString.nullable().optional(),
    superseded_by: z.string().regex(/^cut-\d{4}$/).nullable().default(null),
    draft: z.boolean().optional(),
  })
  .strict();

const cuts = loadCuts().map((c) => ({
  ...c,
  data: {
    ...c.data,
    date: isoDate(c.data.date),
    valid_as_of: isoDate(c.data.valid_as_of),
    stale_after: isoDate(c.data.stale_after),
  },
}));

const ids = new Set(cuts.map((c) => c.data.id));
const errors: string[] = [];

for (const cut of cuts) {
  const where = `content/cuts/${cut.file}`;
  const parsed = cutSchema.safeParse(cut.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${where}: ${issue.path.join('.')} — ${issue.message}`);
    }
    continue;
  }
  const fm = parsed.data;
  if (`${fm.id}.md` !== cut.file) errors.push(`${where}: id "${fm.id}" does not match filename`);
  for (const rel of fm.related) {
    if (!ids.has(rel)) errors.push(`${where}: related id "${rel}" does not exist in the Spine`);
  }
  if (fm.superseded_by && !ids.has(fm.superseded_by)) {
    errors.push(`${where}: superseded_by "${fm.superseded_by}" does not exist in the Spine`);
  }
  if (!cut.body || cut.body.length < 40) errors.push(`${where}: body is empty or too short to be a Cut`);
}

if (errors.length) {
  console.error(`✗ Spine validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}):\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`✓ Spine valid — ${cuts.length} Cut${cuts.length === 1 ? '' : 's'}.`);
