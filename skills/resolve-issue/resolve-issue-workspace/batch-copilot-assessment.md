# Batch Assessment: Microsoft Copilot Issues #270, #271

**Date:** 2026-03-15
**Platform:** Microsoft Copilot
**Data file:** `data/platforms/copilot.md`

---

## Issue #270 — Copilot Voice

**Feature:** Copilot Voice
**Issue type:** verification-inconclusive (2/3 confirmations)
**Resolution type:** No data change — bump Checked date only

### Current Data

- Status: ga
- Gating: free
- Platforms: Windows, macOS, iOS, Android, web
- Regional: Available globally
- Verified: 2026-03-08
- Checked: 2026-03-15

### Assessment

The inconclusive result stems from Perplexity finding insufficient sources specifically about "Copilot Voice," while Gemini confirmed the feature's current state. Gemini's findings align with our existing data:

- **Status:** GA — confirmed. Voice is available across Copilot platforms.
- **Gating:** Free — confirmed. Gemini states "Microsoft Copilot Voice is free to all users."
- **Platforms:** Windows, macOS, iOS, Android, web — confirmed. Gemini reports availability on "Android, Windows, iOS, Mac, and Web."
- **Regional:** Global — confirmed. Available in 170+ markets.

Gemini mentions a new voice mode called "Mico" unveiled March 5, 2026, and "Hey Copilot" hands-free activation. These are incremental UX improvements/new sub-features, not changes to the core feature's status, gating, pricing tiers, platform availability, or regional availability. Per the skill heuristics, incremental UX improvements do not warrant a data change.

The Checked date is already set to 2026-03-15, so no change is needed.

### Proposed Changes

None. Checked date already current (2026-03-15).

---

## Issue #271 — GPT-4 Access

**Feature:** GPT-4 Access
**Issue type:** verification-inconclusive (2/3 confirmations), potential "Deprecated status" flagged
**Resolution type:** No data change — bump Checked date only

### Current Data

- Status: ga
- Gating: paid
- Free tier: Limited (falls back to faster models at peak)
- Copilot Pro: Priority GPT-4 access
- Platforms: Windows, macOS, iOS, Android, web
- Regional: Available globally
- Verified: 2026-03-08
- Checked: 2026-03-15

### Assessment

The issue flagged a potential "Deprecated status" for GPT-4 Access, but neither model confirms deprecation:

- **Gemini** says GPT-4 Turbo is available in free Copilot ("Creative" and "Precise" modes) and that Copilot Pro provides "priority access to the latest AI models, including GPT-4 Turbo." Status is described as GA.
- **Perplexity** says GPT-4 access requires paid plans (Pro/Business/Enterprise) and is "Generally Available (GA)" with "no indications of Beta, Preview, or Deprecated status."

The two models actually disagree on gating (Gemini says free users get GPT-4 Turbo; Perplexity says free tier "lacks premium model access"). However, our current data already reflects this nuance correctly: Free tier has limited/conditional access (falls back during peak), while Pro guarantees priority access. The gating is listed as "paid" because consistent access requires a paid plan.

Neither model reports deprecation. The "deprecated" flag in the issue likely arose from the evolving model naming (GPT-4 vs GPT-4 Turbo vs GPT-4o), but the underlying feature — access to premium OpenAI models via Copilot — remains GA.

The Checked date is already set to 2026-03-15, so no change is needed.

### Proposed Changes

None. Checked date already current (2026-03-15).

---

## Summary

| Issue | Feature | Resolution | Data Change? |
|-------|---------|-----------|--------------|
| #270 | Copilot Voice | No change — Perplexity insufficient sources, Gemini confirms existing data | No |
| #271 | GPT-4 Access | No change — neither model confirms deprecation, current data accurate | No |

Both issues can be closed with "no data change needed" comments. No flags for data changes required.
