/**
 * gen-keys — one-time Ed25519 keypair generation.
 *
 * Prints the private key (base64 PKCS8) to stdout — paste it into the
 * AGP_SIGNING_KEY env var on Vercel / GitHub Actions and NOWHERE ELSE —
 * and writes the public half into public/.well-known/agenticpayments.json,
 * which IS committed.
 */
import { generateKeyPairSync } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalize } from './lib/canonical.ts';
import { PUBLIC_DIR, SITE } from './lib/cuts.ts';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');

const privB64 = privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64');
const pubB64 = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');
// Raw 32-byte key = last 32 bytes of the SPKI DER; handy for non-Node verifiers.
const pubRaw = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');

const wellKnown = {
  site: SITE,
  schema_version: '1.0',
  signing: {
    algorithm: 'ed25519',
    public_key_spki_der_b64: pubB64,
    public_key_raw_b64: pubRaw,
    signed_message: '{id}\\n{canonical_url}\\n{content_hash} (UTF-8)',
    signature_field: 'sig (prefixed "ed25519:", base64)',
  },
  machine_layer: {
    llms_txt: `${SITE}/llms.txt`,
    spine: `${SITE}/spine.jsonl`,
    graph: `${SITE}/graph.json`,
    stock_pattern: `${SITE}/cuts/{id}.stock.json`,
  },
  mcp_endpoint: null,
  content_license: 'CC-BY-4.0',
};

writeFileSync(join(PUBLIC_DIR, '.well-known/agenticpayments.json'), canonicalize(wellKnown), 'utf8');

console.log('✓ Wrote public/.well-known/agenticpayments.json (commit this).');
console.log('\nPrivate key — set as AGP_SIGNING_KEY on Vercel + GitHub Actions, never commit:\n');
console.log(privB64);
