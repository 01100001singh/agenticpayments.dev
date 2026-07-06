/**
 * sign — Ed25519 signature over (id, canonical_url, content_hash) for every
 * stock file. The private key lives in the AGP_SIGNING_KEY env var (base64
 * PKCS8 DER) — CI/Vercel secrets only, never in the repo.
 *
 * Public framing: attribution that survives mirroring. CC-BY plus a
 * verifiable signature means anyone can republish and everyone can verify
 * origin against /.well-known/agenticpayments.json.
 *
 * Ed25519 is deterministic, so signing preserves byte-stability.
 */
import { createPrivateKey, sign as edSign } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { canonicalize } from './lib/canonical.ts';
import { PUBLIC_DIR } from './lib/cuts.ts';

const keyB64 = process.env.AGP_SIGNING_KEY;
const onVercelProd = process.env.VERCEL_ENV === 'production';

if (!keyB64) {
  if (onVercelProd) {
    console.error('✗ AGP_SIGNING_KEY is not set in a production build. Refusing to ship unsigned stock.');
    process.exit(1);
  }
  console.warn('⚠ AGP_SIGNING_KEY not set — stock files remain unsigned (fine for local dev).');
  process.exit(0);
}

const privateKey = createPrivateKey({
  key: Buffer.from(keyB64, 'base64'),
  format: 'der',
  type: 'pkcs8',
});

const dir = join(PUBLIC_DIR, 'cuts');
if (!existsSync(dir)) process.exit(0);

let n = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith('.stock.json')).sort()) {
  const path = join(dir, f);
  const stock = JSON.parse(readFileSync(path, 'utf8'));
  const message = Buffer.from(`${stock.id}\n${stock.canonical_url}\n${stock.content_hash}`, 'utf8');
  stock.sig = 'ed25519:' + edSign(null, message, privateKey).toString('base64');
  writeFileSync(path, canonicalize(stock), 'utf8');
  n++;
}
console.log(`✓ Signed ${n} stock file${n === 1 ? '' : 's'}.`);
