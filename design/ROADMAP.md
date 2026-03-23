# Project Status

Last updated: 2026-03-15

## What's built

The original five-phase roadmap is complete. The project now has:

- **Ontology-backed data model** — first-class records for capabilities, providers, products, implementations, model-access, and evidence with cross-record validation
- **Dual-view site** — capability-first homepage and feature-first detailed availability, both generated from the same canonical source
- **Machine-readable API** — 10 JSON files at `docs/api/v1/` with stable IDs, cross-links, and freshness metadata
- **SEO bridge pages** — 125 programmatic pages (`/can/`, `/compare/`, `/capability/`, `/best-for/`) with schema.org structured data
- **MCP read layer** — 15 read-only tools via `scripts/mcp-server.js` (zero dependencies, stdio transport)
- **Verification cascade** — weekly multi-model cross-check with human review gate

## Outstanding work

### Tool Check (deferred)

An interactive "can this AI do X?" experience that consumes the canonical data model. Prerequisites are now met, but activation requires:

- consuming canonical mappings rather than bespoke metadata
- handling corporate-policy caveats explicitly
- preserving the distinction between commercial entitlement and org-admin restriction

### Category field cleanup

The `Category` field on implementation records (especially the `other` bucket) is a legacy taxonomy that predates the capability-first model. It still drives filtering on the implementations page. Work needed:

- reduce dependence on `Category` as a primary filter
- clean up or retire the `other` bucket
- align filtering with capability groups where possible

### Evidence consolidation

Evidence currently lives in two places: inline in `data/platforms/` feature records and in `data/evidence/index.json` (synced by `scripts/sync-evidence.js`). The goal is to make evidence fully ontology-native so it no longer depends on parsing platform markdown.

### Structured data validation

125 bridge pages embed JSON-LD structured data with no build-time validation. Add a CI check that parses every `<script type="application/ld+json">` block to catch regressions before Google Search Console does.

### Bridge page measurement

The SEO bridge pages are live but not yet validated against search indexing. Periodically check Google Search Console for indexing status, crawl errors, and query impressions to confirm the pages are capturing traffic as intended.

### Page Optimizations

Lighthouse scores are consistently in the 90+ range, but some small tweaks could likely send every page on this site to a near-perfect score. 

### Ongoing

- Keep data accurate through the twice-weekly verification cascade
- Expand implementation coverage as products ship new capabilities
- Admit new products from the [watchlist](design/WATCHLIST.md) when they meet scope criteria

## Data contracts

- `data/platforms/` — authoritative source for implementation details, plan constraints, surfaces, changelog, and evidence inputs
- `data/capabilities/`, `data/providers/`, `data/products/`, `data/model-access/`, `data/implementations/index.yml` — first-class ontology records kept coherent by the build and validation pipeline
- `scripts/build.js` — generates the site, JSON API, and bridge pages from the same canonical source
- `scripts/mcp-server.js` — reads from generated JSON artifacts; not a second source of truth
- `scripts/validate-ontology.js` — enforcement point for cross-record integrity
- Canonical skill sources live under `skills/<name>/src/`; platform-local install folders are not source of truth

## Standing invariants

- Ontology validation passes for all entity types and cross-references
- Capability-first and feature-first views reflect the same canonical entities
- JSON export includes stable IDs, freshness fields, source links, and search vocabulary
- Bridge pages are generated from canonical data, never maintained by hand
- The legacy feature-first view remains usable while capability-first stays the primary framing
- New UX work must consume the shared model, not invent a second source of truth
