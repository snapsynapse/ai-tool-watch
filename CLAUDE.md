# CLAUDE.md — AI Tool Watch

Agent guidance for working in this repo. See `AGENTS.md` for the canonical build-pipeline rules (this file supplements it, doesn't replace it).

## Purpose

A plain-English, verified reference for AI tool capabilities, plan gates, and constraints — for humans and agents. Canonical URL: https://aitool.watch/. Covers 18 capabilities, ~87 implementations, and 9 open-model access records across ChatGPT, Claude, Copilot, Gemini, Perplexity, Grok, and self-hosted runtimes (Ollama, LM Studio, etc.).

## Stack

- Zero dependencies. No framework, no database, no `package.json`.
- Plain Markdown + YAML data files under `data/`.
- A single Node.js script (`scripts/build.js`) generates the entire static site (HTML, JSON API, bridge pages, sitemap) into `docs/`.
- Deployed via GitHub Actions on push to `main` and on a Mon/Thu scheduled rebuild.

## Directory layout

- `data/` — canonical source of truth. `platforms/` (editorial source per product), `capabilities/`, `providers/`, `products/`, `model-access/`, `implementations/index.yml`, `evidence/index.json` (generated, do not hand-edit), `watchlist/`, `archive/`. Format documented in `data/_schema.md` (legacy/transitional) and `design/SCHEMA_PROPOSAL.md` (target ontology).
- `docs/` — **generated output, not source.** Every `.html`, `docs/api/v1/*.json`, `docs/agents.json`, `docs/llms.txt`, `docs/sitemap.xml`, `docs/robots.txt`, `docs/index.xml` are produced by `scripts/build.js`. Direct edits are overwritten on next build.
- `scripts/` — zero-dependency Node tooling: `prepare-publication.js` (the canonical finisher — chains everything below and writes `docs/publication-manifest.json`), `build.js` (site generator), `sync-evidence.js`, `validate-ontology.js`, `validate-claims.js` (talking-point prose vs structured fields), `validate-structured-data.js` (JSON-LD parse + shape check on generated `docs/`), `validate-publication.js` (human/API/MCP coherence), `verify-publication-manifest.js` (artifact vs manifest), `test-offline.js` (the test runner CI uses), `verify-features.js` (multi-model cascade), `check-links.js` / `check-links-browser.js`, `scan-secrets.js`, `mcp-server.js` (read-only MCP server over generated JSON, config in `mcp.json`), `generate-framing.js`, `build-skill-bundles.js`, `lib/` (shared modules: `cascade.js`, `link-engine.js`, `parser.js`, `consistency.js`, etc.).
- `skills/` — canonical skill sources (`skills/<name>/src/`). Platform-local install folders (`.claude/skills/`, `.perplexity/skills/`) are never canonical and should not be committed. See `skills/README.md`.
- `design/` — architecture rationale, ontology docs, roadmap/status (`design/ROADMAP.md`), scope criteria (`design/SCOPE.md`), watchlist (`design/WATCHLIST.md`).
- `tests/` — Node test files (`*.test.js`) plus `fixtures/`; see `tests/README.md`.
- `AGENTS.md` — the authoritative agent-facing build-pipeline instructions; `CONTRIBUTING.md` — human contributor workflow; `VERIFICATION.md` — verification cascade documentation; `SECURITY.md`, `SPONSORS.md`, `LICENSE`.

## Conventions

- Edit **source**, never generated output: `data/`, `scripts/`, `skills/src/`, docs at repo root (`README.md`, `AGENTS.md`, etc.) are safe to hand-edit. `docs/` (the build output directory) is not, except where noted otherwise in `AGENTS.md`.
- After editing `scripts/build.js` or anything under `data/`, regenerate with `node scripts/prepare-publication.js` — the canonical finisher — and commit source + regenerated `docs/` together. `node scripts/build.js` alone is not enough: it does not write `docs/publication-manifest.json`, so the commit ships a stale manifest and fails CI.
- Evidence links must be included or preserved when updating a platform record.
- Key `scripts/build.js` landmarks (per `AGENTS.md`): `renderSharedFooter()` (~line 1127), `Organization` JSON-LD blocks (search `"@id": "https://snapsynapse.com/#organization"`), `agents.json` generator (~line 4602, `maintainer` field ~4620), `llms.txt` generator (~line 4498).
- MIT-licensed, stewarded by Snap Synapse LLC, authored by Sam Rogers. Used indirectly by PAICE.work.

## Build / validate / test (from docs — do not execute without explicit instruction)

`scripts/prepare-publication.js` is the finisher. Any change to `data/` or `scripts/` ends with it:

```bash
node scripts/prepare-publication.js  # Canonical: sync → validate → build → verify artifact
```

It chains `sync-evidence.js` → `validate-ontology.js` → `validate-claims.js` → `build.js` → `validate-structured-data.js` → `validate-publication.js`, then writes `docs/publication-manifest.json` and verifies the built artifact against it. `build.js` does not write that manifest; only `prepare-publication.js` does.

The individual commands below remain useful while developing and diagnosing a change, but none of them finishes a commit:

```bash
node scripts/build.js               # Build the site into docs/ (no publication manifest)
node scripts/sync-evidence.js       # Sync evidence records
node scripts/validate-ontology.js   # Validate cross-record integrity
node scripts/validate-claims.js     # Cross-check talking-point prose vs structured fields
node scripts/validate-structured-data.js  # Parse/shape-check JSON-LD in docs/ (run after build.js)
node scripts/validate-publication.js      # Human, API, and MCP publication coherence
node scripts/verify-features.js     # Multi-model verification cascade (see VERIFICATION.md)
node scripts/check-links.js         # Link integrity check
node scripts/scan-secrets.js        # Secret scan
```

Tests live under `tests/*.test.js`. CI runs them via `node scripts/test-offline.js`; use the same command locally. Plain `node --test tests/` does not work — it picks up `tests/smoke-live.test.js`, which requires live third-party network access. See `tests/README.md` and `AGENTS.md`.

If `tests/publication-manifest.test.js` fails with `artifact hash mismatch for agents.json`, the cause is almost always a stale `docs/publication-manifest.json`, not `agents.json`. `scripts/verify-publication-manifest.js` reports the first mismatching entry in sorted path order, so a manifest left behind by a bare `build.js` run surfaces under the alphabetically earliest generated file. Re-run `node scripts/prepare-publication.js` and commit the regenerated manifest.

CI (`.github/workflows/`): `build.yml` (build + deploy, push/PR to main, Mon/Thu schedule), `deploy-ftp.yml` (deploy to PAICE.work, same schedule), `verify-features.yml` (twice-weekly four-model cascade, Mon/Thu), `check-links.yml` (weekly, Saturdays), `evidence-alerts.yml` (staleness alerts, Mon/Thu), `scan-secrets.yml` (push/PR to main).

## Current state (as of 2026-07-12)

Per `design/ROADMAP.md`: the original five-phase roadmap is complete (ontology-backed data model, dual-view site, JSON API, 125 SEO bridge pages, MCP read layer, verification cascade). Repo is active — commits land almost daily via automated dashboard rebuilds and Checked/Verified date updates, plus occasional feature work (e.g. cascade signal-suppression fix).

Outstanding / open work (see `design/ROADMAP.md` for full detail):
- **Tool Check** (deferred) — interactive "can this AI do X?" experience; prerequisites met but not yet built.
- **Category field cleanup** — legacy `Category` taxonomy on implementation records needs reduction/retirement in favor of capability-first filtering.
- **Evidence consolidation** — evidence currently split between inline platform markdown and `data/evidence/index.json`; goal is fully ontology-native evidence.
- **Structured data validation** — no build-time validation of the JSON-LD on the 125 bridge pages yet.
- **Bridge page measurement** — SEO bridge pages live but not yet validated against Search Console data.
- **Page optimizations** — Lighthouse scores are 90+; room for near-perfect scores.
