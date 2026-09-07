# Project Context — AI Tool Watch

## What this is

AI Tool Watch is a plain-English, verified reference for AI tool capabilities, plan gates, and constraints — built for both humans and agents. It answers questions like "Is ChatGPT Agent Mode available on the $8/mo plan?" or "Can I use Claude Cowork on Windows?" with current, sourced answers instead of scattered marketing pages.

There is no database or framework: canonical data lives as Markdown/YAML under `data/`, and a single zero-dependency Node script (`scripts/build.js`) generates the static site, JSON API, and SEO bridge pages into `docs/`.

Canonical URL: https://aitool.watch/
Repo: https://github.com/snapsynapse/ai-tool-watch

## Audience

- AI facilitators, educators, and developers who need to answer "can tool X do Y, and on which plan" without digging through vendor marketing pages.
- AI agents that need machine-readable, current data — via the JSON API (`docs/api/v1/`), the MCP server (`scripts/mcp-server.js`, config in `mcp.json`), or `llms.txt`.
- Contributors who want to fix or extend coverage without a dev environment — editing a markdown/YAML file and opening a PR is enough.

## Style / tone

- Plain English, verified, and specific — answers state the concrete plan tier, platform, or constraint rather than vague marketing language (e.g. "No, Plus or higher" rather than "depends on your plan").
- Evidence-backed: every claim traces to a source link that is included or preserved on update.
- Neutral and factual across vendors — no editorializing about which product is "best."
- Documentation (README, AGENTS.md, design docs) is direct and technically precise, written for both human contributors and coding agents simultaneously.

## Key URLs

- Site: https://aitool.watch/
- JSON API usage guide: `docs/api/v1/USAGE.md`
- Architecture rationale: `design/ARCHITECTURE_PATTERNS.md`
- Scope criteria: `design/SCOPE.md`
- Watchlist (candidate products not yet in scope): `design/WATCHLIST.md`
- Verification cascade docs: `VERIFICATION.md`
- Companion project (WCAG audit skill): https://github.com/snapsynapse/skill-a11y-audit
- Companion/consumer project: PAICE.work (behavioral-reliability assessments; planned MCP integration to consume this data)
- Deployment target: PAICE.work (FTP deploy on push/schedule, per `.github/workflows/deploy-ftp.yml`)

## Current status

Active. The original five-phase roadmap (ontology-backed data model, dual-view site, JSON API, 125 SEO bridge pages, MCP read layer, verification cascade) is complete per `design/ROADMAP.md` (last updated 2026-03-15). The repo has scheduled dashboard builds and a twice-weekly provider cascade. The T04 collector contract permits Checked updates only from adequate no-change evidence in a healthy or adequately review-required run; Verified dates and change acceptance require editorial review. Model-consensus candidates remain pending and the verification workflow does not auto-resolve them. These local repairs require separate hosted delivery and verification; operational email and independent missed-run monitoring remain unconfigured. Outstanding work is tracked in `design/ROADMAP.md` — notably a deferred "Tool Check" interactive feature, legacy `Category` field cleanup, evidence-model consolidation, and SEO bridge page validation/measurement.

Stewardship: open reference under Snap Synapse LLC, authored by Sam Rogers. MIT-licensed, free for any use.
