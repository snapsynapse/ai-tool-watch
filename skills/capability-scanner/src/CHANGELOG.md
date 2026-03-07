---
skill_bundle: capability-scanner
file_role: reference
version: 2.1.0
version_date: 2026-03-07
previous_version: 2.0.0
change_summary: >
  Added a lightweight scan-workflow reference, switched the bundle to semver,
  and kept the skill itself lean while restoring explicit scanner guidance.
---

# Changelog

## 2.1.0 — 2026-03-07

- Added `references/SCAN_WORKFLOW.md` so the bundle once again includes explicit scanning guidance without reintroducing Perplexity-specific operational scaffolding.
- Switched the canonical skill bundle to semver.
- Kept `SKILL.md` focused on assessment and judgment while moving source-gathering and recommendation workflow details into a separate reference file.

## 2.0.0 — 2026-03-07

- Rebuilt the bundle as a portable Perplexity/Claude/Codex-oriented scanner skill.
- Removed automation-heavy operational guidance, token handling, and hard-coded local paths.
- Aligned the skill with the repo's ontology-first model and current scope heuristic.
- Replaced the old feature-tracker ontology with the current entity model and capability taxonomy.
- Reduced the bundle to a lean core skill plus one governance reference file.

## 1.0.0 — 2026-03-07

- Initial capability-scanner bundle.
