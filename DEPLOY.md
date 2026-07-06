# Deploy runbook — agenticpayments.dev

One-time setup, in order. Everything after this is `git push` → auto-deploy.

## 1. Vercel project

1. vercel.com → **Add New → Project** → import `01100001singh/agenticpayments.dev`.
2. Framework preset: **Astro** (auto-detected). Build command `npm run build`,
   output `dist/` — defaults are correct, don't override.
3. **Environment variables** (Settings → Environment Variables, all environments):

   | Name | Value |
   |---|---|
   | `AGP_SIGNING_KEY` | contents of `signing-key.local.txt` (local only, never committed) |
   | `PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |

   Note: a production build **fails on purpose** if `AGP_SIGNING_KEY` is missing
   (unsigned stock must never ship). The subscribe form simply doesn't render
   until the Supabase vars exist, so you can deploy before Supabase is ready.

4. Deploy once and check:
   - `/cuts/cut-0101.stock.json` → has a real `"sig": "ed25519:…"`
   - `/spine.jsonl`, `/llms.txt`, `/graph.json`, `/rss.xml`, `/sitemap.xml`
   - `/.well-known/agenticpayments.json`

## 2. Domains

1. Vercel project → Settings → Domains:
   - add `agenticpayments.dev` → set as **primary**
   - add `www.agenticpayments.dev` → redirect to primary (308)
   - add `agenticpayment.dev` (singular) → **Redirect to** `agenticpayments.dev` (308)
   - add `www.agenticpayment.dev` → same redirect
2. At the registrar for **both** domains, point DNS per Vercel's instructions
   (A `76.76.21.21` apex + CNAME `cname.vercel-dns.com` for www, or Vercel nameservers).
3. Verify: `curl -sI https://agenticpayment.dev | grep -i location` → must be
   `https://agenticpayments.dev/`.

## 3. Supabase

1. Create project (any region; Mumbai is fine).
2. SQL Editor → run `supabase/schema.sql` (creates `subscribers` with insert-only
   RLS for the anon key — no select/update/delete).
3. Copy Project URL + anon key into the Vercel env vars above; redeploy.
4. Test the footer form; confirm the row lands in Table Editor → subscribers.
   Second submit of the same email should show "Already on the list."

## 4. GitHub Actions secret (CI signing parity)

Repo → Settings → Secrets and variables → Actions → new secret
`AGP_SIGNING_KEY`, same value as Vercel. (CI builds pass without it — the
sign step warns and skips — but adding it exercises the exact production path.)

## 5. Analytics

Vercel project → Analytics tab → Enable. The tracking script is already in the
layout (`/_vercel/insights/script.js`); custom events (`prompt_copy`,
`subscribe`) appear once analytics is on a plan that supports them.

## Key rotation (if the signing key ever leaks)

1. `npm run gen:keys` → new keypair; commit the new `.well-known` file.
2. Replace `AGP_SIGNING_KEY` on Vercel + GitHub; redeploy (all stock re-signs).
