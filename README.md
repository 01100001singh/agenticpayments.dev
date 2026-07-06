# agenticpayments.dev

A publication about agentic payments, built the way the thing it describes works.

Most publishing ships finished articles — presentation and meaning fused, one shape for
every reader. This site ships **Cuts**: atomic, schema'd, open-licensed primitives of
operator thinking about payment systems. Humans read the authored **Surfaces** (dissection
plates, a bestiary of protocols, parables, receipts). Readers' agents cook the raw corpus
into whatever form the reader actually wants. Software increasingly consumes the web on
people's behalf; this repo is one attempt at publishing built for that, end to end.

**Read it:** [agenticpayments.dev](https://agenticpayments.dev) ·
**Feed your agent:** [`/llms.txt`](https://agenticpayments.dev/llms.txt) ·
[`/spine.jsonl`](https://agenticpayments.dev/spine.jsonl)

---

## The format

### Cuts

A **Cut** is the atomic unit: one idea, one screen, one breath, ~180 words, in a single
markdown file under [`content/cuts/`](content/cuts/). Frontmatter is validated in CI
against [`schema/cut.schema.json`](schema/cut.schema.json). Two taxonomies are **closed**
— free-text values fail the build:

- `type`: `principle` · `scar` · `observation` · `parable` · `frame` · `datapoint` · `entry`
- `era`: `ppi-india` · `upi` · `venmo` · `cards` · `agentic` · `crypto` · `universal`

A Cut must make sense with zero surrounding context. Context travels *as structure* —
`era`, `provenance`, `valid_as_of`, `stale_after`, `superseded_by` — never as prose
preamble. The corpus of all Cuts is the **Spine**.

### The Stock — every Cut has a machine twin

For every Cut, the build generates `cuts/{id}.stock.json`: same meaning, presentation
deleted, engineered for machine consumption ([`schema/stock.schema.json`](schema/stock.schema.json)).
It carries a one-sentence `gist`, subject–predicate–object `claims`, `entities` linking
into the site's Lexicon, typed `relations` to other Cuts, provenance, license, freshness
fields, and a suggested citation.

The twin is generated from the Cut (plus an optional human-reviewed
`{id}.claims.json` sidecar) and never hand-edited, so the two renditions cannot drift.

**Byte-stability is a feature, not an accident.** Canonical serialization: UTF-8, LF,
keys sorted lexicographically at every level, no timestamps, no nondeterministic fields.
Two builds from the same source are byte-identical — CI asserts this by building twice
and diffing. If you're caching the Spine in an agent's context, unchanged content means
unchanged bytes means your prompt cache holds.

### Signatures — attribution that survives mirroring

Each stock file carries an Ed25519 signature over `(id, canonical_url, content_hash)`.
The public key lives at
[`/.well-known/agenticpayments.json`](https://agenticpayments.dev/.well-known/agenticpayments.json).
Content is CC-BY-4.0: republish freely, remix freely — and anyone, anywhere, can verify
what came from here. The signing key exists only in CI secrets.

### The machine layer

| Artifact | Path | What it is |
|---|---|---|
| llms.txt | `/llms.txt` | Site + schema description per [llmstxt.org](https://llmstxt.org) |
| Spine bulk | `/spine.jsonl` | Whole corpus, one stock object per line, byte-stable |
| Graph | `/graph.json` | Nodes = cut ids; edges = typed relations |
| Stock | `/cuts/{id}.stock.json` | Per-cut machine twin |
| Keys | `/.well-known/agenticpayments.json` | Signing pubkey, schema version |
| RSS / sitemap | `/rss.xml` · `/sitemap.xml` | Standard, full-text |

## Repo layout

```
content/            the corpus (CC-BY-4.0)
  cuts/             the Spine — one .md per Cut (+ optional .claims.json sidecar)
  surfaces/         authored renderings: bestiary, plates, parables, dialogues,
                    receipts, journal, notebook
  lexicon/          glossary; stable anchors that stock `entities` point at
schema/             JSON Schemas for Cut frontmatter and stock files
scripts/            the pipeline: validate → gen-stock → sign → gen-machine-layer
src/                the Astro site (MIT)
public/.well-known/ signing public key
```

## Build

```bash
npm install
npm run pipeline   # validate → stock → sign (if AGP_SIGNING_KEY set) → machine layer
npm run dev        # or: npm run build
```

CI validates every PR; unsigned production builds fail. Deploys are static — every page
is prerendered, and the machine layer is plain files on a CDN.

## License

Code **MIT** ([LICENSE-CODE](LICENSE-CODE)) · content **CC-BY-4.0**
([LICENSE-CONTENT](LICENSE-CONTENT)). Cite the canonical URL; every stock file
includes a `suggested_citation`.
