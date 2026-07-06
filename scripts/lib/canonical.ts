/**
 * Canonical JSON serialization — the byte-stability contract (§3.2 of the format).
 *
 * Rules: UTF-8, LF, keys sorted lexicographically at every level, no
 * nondeterministic fields, stable array order (as declared by the producer).
 * Two builds from the same source MUST produce byte-identical output;
 * CI asserts this by building twice and diffing.
 */

export function canonicalize(value: unknown): string {
  return serialize(value) + '\n';
}

/** JSONL variant: one canonical object per line, no trailing blank line beyond final LF. */
export function canonicalizeLines(values: unknown[]): string {
  return values.map((v) => serialize(v)).join('\n') + '\n';
}

function serialize(value: unknown): string {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Non-finite number in canonical output: ${value}`);
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(serialize).join(',')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${serialize(v)}`).join(',')}}`;
  }
  throw new Error(`Unserializable value of type ${typeof value}`);
}
