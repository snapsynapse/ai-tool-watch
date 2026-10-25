# Project roadmap
Last reconciled: 2026-10-24. Scope and owner decisions live in [INTENT.md](../INTENT.md); the actionable maintenance queue and dated evidence live in [MAINTENANCE.md](MAINTENANCE.md).
## Current direction
The October 11 owner decision narrowed the reference to major hosted consumer AI products and retained the year-end review. Self-hosted runtimes and open-model access are frozen in the archive. Meta AI is active. Distribution campaigns wait for reliable scheduled verification.
## Delivered foundation
- Canonical ontology records drive capability-first and implementation-first pages, static JSON APIs, bridge pages, and the read-only MCP server.
- `scripts/prepare-publication.js` synchronizes evidence, validates source and generated structures, checks human/API/MCP coherence, and writes the verified publication manifest.
- GitHub Pages consumes the reviewed artifact. The PAICE FTP workflow and duplicate evidence-alert workflow were retired on October 11.
- The verification cascade retains source-grounded model observations and human review findings. Only adequate no-change evidence can advance Checked; editorial review owns factual corrections and Verified dates.
- Cookieless website analytics use the shared Snap Synapse PostHog project with hostname isolation. Direct API/MCP use remains unmeasured.
- Read-only MCP distribution manifests and an earlier isolated tarball install were validated locally. npm/Registry publication and post-publication acceptance remain pending.
- The October 3 bounded competitor comparison and sampled Claude Voice/Gemini consistency repairs are completed historical work. They do not establish current market superiority or adoption.
## Maintenance recovery
1. Complete the local Perplexity source repair and its publication-artifact/offline validation. Keep factual dates unchanged unless the complete record is reviewed.
2. Reconcile the missing scheduled-approval variable with the recorded October 11 decision. Both spend limits are configured, but the last four scheduled runs were blocked with no provider calls. Activation remains held under the October 24 no-push/no-publication instruction.
3. Reconcile open issues and retained review metadata. The current dated staleness query and proposed issue responses are in the maintenance queue; issue titles are not live inventory counts.
4. Process remaining active-product source-audit decisions against current data. Preserve evidence, exclude frozen archive records, and keep paid work bounded.
5. Audit credibility indicators and existing discovery-page indexing before considering distribution. Keep sitemap curation intact.
## Review-period evidence
Continue maintenance through 2026-12-31 under `INTENT.md`, then assess citation/link evidence or measured use. Refresh website-use evidence before making adoption claims. The October 11 analytics snapshot is historical; no current traffic result was collected in this recovery. Distribution targets and tactics stay private in LocalBrain, and sends remain owner-approved.
## Deferred work
- Tool Check: any task-to-capability experience must use canonical mappings and distinguish commercial entitlement from organization policy.
- TypeSafe suggestions: prepare a destination-specific plan only after the owner reopens this hypothesis; historical authored-query results are not production acceptance.
- Category filtering and the legacy `other` bucket: align with capability groups only when a demonstrated navigation need warrants the work.
- Evidence consolidation: make evidence ontology-native without introducing a second factual source.
- Performance polishing: require a fresh measurement and a maintenance justification before changing the site.
- New products: apply [SCOPE.md](SCOPE.md); the watchlist does not reopen frozen domains.
- npm/MCP Registry publication: separate approval and cold-install verification are still needed.
## Data and publication contracts
`data/` owns facts, `scripts/build.js` generates `docs/`, and `scripts/mcp-server.js` reads generated JSON. Never edit generated output directly. Finish data/script changes with `node scripts/prepare-publication.js` and run the CI-equivalent offline suite with `node scripts/test-offline.js`. Source and generated outputs travel together when delivery is authorized.
Stable IDs, provenance, visible freshness, human/API/MCP coherence, the curated discovery set, and the usable legacy implementation view remain invariants. Local tests do not establish deployment or live-byte identity.
