# AI Tool Watch — agent instructions

## Build pipeline — IMPORTANT for agents

**`docs/` is generated, not source.** Every `.html` file under `docs/`, every API JSON under `docs/api/v1/`, plus `docs/agents.json`, `docs/llms.txt`, `docs/sitemap.xml`, `docs/robots.txt`, and `docs/index.xml` are produced by `scripts/build.js`. Direct edits to any generated `docs/` file will be overwritten on the next build.

**`scripts/prepare-publication.js` is the finisher. Run it before committing any change to `data/` or `scripts/`.** There is no `npm run build` wrapper. `prepare-publication.js` chains the canonical sync, validation, build, generated-structure, and human/API/MCP coherence checks used by CI, then writes `docs/publication-manifest.json` and verifies the artifact against it:

```bash
node scripts/prepare-publication.js
```

`scripts/build.js` does not write `docs/publication-manifest.json` — only `prepare-publication.js` does. Running the individual scripts and committing leaves the manifest holding hashes from the previous build, and `tests/publication-manifest.test.js` then fails in CI.

**That failure names the wrong file.** The test tampers with `index.html` and expects `artifact hash mismatch for index.html`, but `scripts/verify-publication-manifest.js` reports whichever manifest entry mismatches first in sorted order. With a stale manifest the reported path is normally `agents.json`, which reads like an `agents.json` bug. It is not. Re-run `node scripts/prepare-publication.js` and commit the regenerated manifest.

The individual scripts remain useful while developing and diagnosing a change:

```bash
node scripts/sync-evidence.js             # Sync canonical evidence records
node scripts/validate-ontology.js         # Validate cross-record integrity
node scripts/validate-claims.js           # Talking-point prose vs structured fields
node scripts/build.js                     # Generate docs/ (no publication manifest)
node scripts/validate-structured-data.js  # Parse/shape-check generated JSON-LD
node scripts/validate-publication.js      # Human, API, and MCP coherence
node scripts/verify-features.js           # Multi-model verification cascade
node scripts/check-links.js               # Link integrity check
node scripts/scan-secrets.js              # Secret scan
```

Run the test suite the way CI does:

```bash
node scripts/test-offline.js
```

Plain `node --test tests/` does not work: it picks up `tests/smoke-live.test.js`, which requires live third-party network access. `scripts/test-offline.js` excludes that file and runs the rest.

Key templates inside `scripts/build.js`:

- `renderSharedFooter()` near line 1127 — site-wide footer (copyright, social, Substack/LinkedIn/Every AI Law links)
- Multiple inline `Organization` JSON-LD blocks (search for `"@id": "https://snapsynapse.com/#organization"`) — publisher schema across page types
- `agents.json` generator near line 4602 — `maintainer` field at line 4620
- `llms.txt` generator near line 4498

Always edit at the source level, then regenerate with the finisher:

```bash
# After editing scripts/build.js or data/
node scripts/prepare-publication.js
git add scripts/ data/ docs/   # commit source AND its outputs together
```

Safe to edit directly: `LICENSE`, `README.md`, `data/` (source data), `skills/` (skill bundles), `scripts/` themselves, `.github/`, `assets/` source. When in doubt, grep `scripts/build.js` for the file path before editing.

## Stewardship and use

AI Tool Watch is an open reference under Snap Synapse LLC stewardship, authored by Sam Rogers. It is used indirectly by PAICE.work (`https://paice.work/`). A planned MCP integration will expose AI Tool Watch to PAICE so behavioral-reliability assessments stay current with product changes and PAICE Pro features. The reference remains MIT-licensed and free for any use.
