---
skill_bundle: resolve-issue
file_role: reference
version: 3
version_date: 2026-03-15
previous_version: 2
change_summary: >
  Added research fallback hierarchy, temporary state change handling,
  and structured batch assessment format based on learnings from resolving
  29 verification issues across all platforms.
---

# Changelog

## 3 — 2026-03-15

Third iteration based on patterns from resolving 29 issues (25 original + 4 from re-run).

- **Research fallback hierarchy**: Documented three-level research strategy (Perplexity → official URL fetch → model consensus + internal consistency) with confidence downgrades when operating in degraded mode.
- **Temporary state handling**: Added pattern for representing temporary promotions/trials — keep default gating, use ⚠️ rows, mention both states in talking point, let next cycle catch expiration.
- **Batch assessment format**: Added structured markdown template for multi-issue resolution — per-issue sections with conflict summary, consistency check, research, assessment with confidence, and proposed changes, plus summary table.

## 2 — 2026-03-15

Second iteration after resolving 25 issues and running skill-creator evaluation (6 test cases with grading).

- **Internal consistency checks**: Expanded Step 2 to check gating vs availability table, talking point vs data, platform completeness, and source URLs before assessing the issue itself.
- **Removed blanket phrasing heuristic**: The "close if phrasing/terminology difference" rule was too aggressive — it let real gating mismatches slip through (DALL-E, Vision). Replaced with nuance: phrasing differences that touch gating/pricing/platforms still trigger research.
- **Mandatory Claude external research**: Made it non-negotiable that Claude/Anthropic features always require external verification (Perplexity or URL fetch), even for obvious no-change closes. Added to both Step 4 and Important Rules.
- **Audit trail for no-change closes**: Required naming specific fields verified and sources checked, not just "data is correct."

## 1 — 2026-03-15

Initial skill creation for the AI Capability Reference project.

- Seven-step workflow: fetch issue, read data, assess, research, update, close, report.
- Heuristic-based assessment with duplicate detection, no-change closes, and research triggers.
- Perplexity API integration for external research.
- Structured closing comments with audit trail.
- Batch mode support for platform-wide resolution.
