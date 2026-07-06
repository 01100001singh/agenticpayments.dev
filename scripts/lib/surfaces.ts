/** Loader for Surface content (bestiary, plates, parables, dialogues, receipts, journal, notebook). */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { ROOT, lf } from './cuts.ts';

export const SURFACE_KINDS = [
  'bestiary',
  'plates',
  'parables',
  'dialogues',
  'receipts',
  'journal',
  'notebook',
] as const;
export type SurfaceKind = (typeof SURFACE_KINDS)[number];

export interface SurfaceFile {
  kind: SurfaceKind;
  slug: string;
  body: string;
  data: Record<string, any>;
}

export function loadSurfaces(kind: SurfaceKind): SurfaceFile[] {
  const dir = join(ROOT, 'content/surfaces', kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .sort()
    .map((f) => {
      const raw = lf(readFileSync(join(dir, f), 'utf8'));
      const { data, content } = matter(raw);
      return { kind, slug: f.replace(/\.mdx?$/, ''), body: content.trim(), data };
    })
    .filter((s) => !s.data.draft);
}

export function loadAllSurfaces(): SurfaceFile[] {
  return SURFACE_KINDS.flatMap((k) => loadSurfaces(k));
}

export function surfacePath(s: SurfaceFile): string {
  return `/${s.kind}/${s.slug}`;
}
