/** Shared loading + parsing for the content pipeline scripts. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

export const ROOT = new URL('../..', import.meta.url).pathname;
export const CUTS_DIR = join(ROOT, 'content/cuts');
export const LEXICON_DIR = join(ROOT, 'content/lexicon');
export const PUBLIC_DIR = join(ROOT, 'public');
export const SITE = 'https://agenticpayments.dev';

export const CUT_TYPES = ['principle', 'scar', 'observation', 'parable', 'frame', 'datapoint', 'entry'] as const;
export const CUT_ERAS = ['ppi-india', 'upi', 'venmo', 'cards', 'agentic', 'crypto', 'universal'] as const;

export interface CutFile {
  id: string;
  file: string;
  raw: string; // LF-normalized full file
  body: string; // LF-normalized body (after frontmatter)
  data: Record<string, any>;
  claims: Record<string, any> | null; // optional human-reviewed sidecar
}

/** Normalize to LF — byte stability must not depend on checkout line endings. */
export function lf(s: string): string {
  return s.replace(/\r\n/g, '\n');
}

export function loadCuts(): CutFile[] {
  if (!existsSync(CUTS_DIR)) return [];
  return readdirSync(CUTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const raw = lf(readFileSync(join(CUTS_DIR, f), 'utf8'));
      const { data, content } = matter(raw);
      const claimsPath = join(CUTS_DIR, f.replace(/\.md$/, '.claims.json'));
      const claims = existsSync(claimsPath) ? JSON.parse(readFileSync(claimsPath, 'utf8')) : null;
      return { id: data.id, file: f, raw, body: content.trim(), data, claims };
    });
}

export function lexiconSlugs(): Set<string> {
  if (!existsSync(LEXICON_DIR)) return new Set();
  return new Set(
    readdirSync(LEXICON_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, '')),
  );
}

export function isoDate(d: unknown): string | null {
  if (d == null) return null;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}
