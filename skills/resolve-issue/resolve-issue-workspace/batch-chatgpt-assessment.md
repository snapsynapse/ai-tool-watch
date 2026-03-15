# Batch ChatGPT Issue Assessment

**Date:** 2026-03-15
**Platform:** ChatGPT
**Data file:** `data/platforms/chatgpt.md`
**Note:** External research (Perplexity API, WebFetch) was unavailable during this assessment. Analysis is based on model responses included in the issues and comparison against current data.

---

## Issue #255 — DALL-E Image Generation

**Type:** verification-conflict
**Labels:** needs-review, verification-conflict

### Current Data
- Status: ga
- Gating: paid
- Free: limited (~2/day), Go/Plus/Pro: increasing limits

### Model Responses Summary
- **Gemini Flash:** Says image gen is available to ALL users including free. Notes GPT-4o has replaced DALL-E 3 as the built-in image generation model.
- **Perplexity:** Says free users get 2-3 images/day, paid users get more. Mentions "ChatGPT Go" plan with DALL-E 3.5. Notes DALL-E 3 treated as legacy but still supported. Says gating is "paid-only for meaningful access."

### Assessment
**Resolution: No data change needed — bump Checked date only.**

Reasoning:
1. The "conflict" is about terminology/framing, not substance. Both models agree free users have very limited access (~2-3/day) and paid users get more. Our data already reflects this (Free: "~2/day", Go/Plus/Pro with increasing limits).
2. The gating value of "paid" in our data is debatable since free users DO get ~2/day, but we already show Free as "limited" in the availability table, which is accurate. The talking point already says "available on all plans including free" with caveats. This is consistent.
3. The GPT-4o replacing DALL-E 3 claim from Gemini is about the underlying model, not a change to the feature's availability, gating, or status. The feature section is titled "DALL-E Image Generation" which still accurately describes the image generation capability in ChatGPT, even if the backend model has evolved. This is a naming/branding nuance, not a data change.
4. No changes to status (still GA), platform availability, or regional availability reported.

### Proposed Changes
- Bump Checked date to 2026-03-15 (already done per current file)

---

## Issue #259 — Canvas

**Type:** verification-inconclusive
**Labels:** needs-review, verification-inconclusive

### Current Data
- Status: ga
- Gating: free
- All plans: full access
- Platforms: Windows, macOS, web (desktop); iOS/Android marked as "Coming soon"

### Model Responses Summary
- **Gemini Flash:** Says Canvas is in Beta, available to Plus/Team/Enterprise only (paid-only). Plans to expand to free users after beta. Available on Web, Windows, macOS. Mobile planned for future.
- **Perplexity:** Very limited information. Says Canvas is available on Business plan. Cannot confirm other details.

### Assessment
**Resolution: No data change needed — bump Checked date only.**

Reasoning:
1. Gemini's claim that Canvas is "Beta" and "paid-only" appears to be outdated information from its initial launch period (late 2024). Canvas was indeed initially rolled out to paid users, then expanded to all users including free. Our data showing ga/free reflects the current state after full rollout.
2. Perplexity had insufficient sources and could not provide meaningful verification. Its vague mention of "Business plan" does not contradict our data (Business plans do have access).
3. The inconclusive nature of this issue stems from one model using stale information and the other lacking sources — neither presents a specific, sourced claim that contradicts our current data.
4. Our data already correctly shows iOS/Android as "Coming soon" which aligns with Gemini's note that mobile is planned for future release.
5. No credible evidence of changes to status, gating, or platform availability.

### Proposed Changes
- Bump Checked date to 2026-03-15 (already done per current file)

---

## Issue #260 — ChatGPT Search

**Type:** verification-inconclusive
**Labels:** needs-review, verification-inconclusive
**Potential Changes flagged:** [status] Deprecated status

### Current Data
- Status: ga
- Gating: free
- All plans: access with varying limits
- Available on all major platforms including API

### Model Responses Summary
- **Gemini Flash:** Confirms GA, free for all users including logged-out. Available on web, desktop, and mobile. Notes recent shopping and image search improvements.
- **Perplexity:** Confirms GA across supported tiers. Free with tiered enhancements. No indications of deprecated status. No Search-specific changes in last 30 days.

### Assessment
**Resolution: No data change needed — bump Checked date only.**

Reasoning:
1. Despite the issue title flagging a potential "Deprecated status," BOTH models confirm ChatGPT Search is GA and available to all users. There is zero evidence of deprecation.
2. Both models confirm it is free (our gating: free is correct) with tiered limits (our availability table is correct).
3. The "potential changes" flag for deprecated status appears to be a false positive from the automated system.
4. Recent changes mentioned (shopping features, image search improvements) are incremental UX improvements, not changes to status, gating, pricing tiers, platform availability, or regional availability.
5. Our data accurately reflects the current state.

### Proposed Changes
- Bump Checked date to 2026-03-15 (already done per current file)

---

## Issue #261 — Codex (Code Agent)

**Type:** verification-inconclusive
**Labels:** needs-review, verification-inconclusive
**Potential Changes flagged:** [status] preview status

### Current Data
- Status: ga
- Gating: paid
- Free: not available, Go: not available
- Plus/Pro/Team/Enterprise: available
- Platforms: Windows, macOS, web, API, iOS/Android (limited)

### Model Responses Summary
- **Gemini Flash:** Says Codex is GA (graduated from paid preview). Available on Free/Go (limited time promotional), Plus, Pro, Business, Edu, Enterprise. Mentions Codex CLI, IDE extensions (VS Code, Cursor, Windsurf), terminal. Notes GPT-5.4 integration, Windows app launch.
- **Perplexity:** Confirms GA. Plus/Pro/Business/Enterprise/Edu. Limited-time promotion for Free and Go users (announced Feb 2, 2026). Detailed usage limits by tier. Mentions CLI and IDE extension availability.

### Assessment
**FLAG: Potential data change needed — requires external verification.**

Reasoning:
1. **Status (ga):** Both models confirm GA. Our data is correct. The issue title flagging "preview status" appears to be a false positive.
2. **Free/Go promotional access:** Both models report that Free and Go users have temporary/limited-time promotional access to Codex (since Feb 2, 2026). Our data shows Free/Go as "not available." If this promotion is ongoing, this could warrant a note in the availability table, but temporary promotions are not the same as permanent gating changes.
3. **Terminal/CLI platform:** Both models mention Codex CLI as a major surface. Our data shows terminal as "not available" which appears incorrect — Codex CLI is a terminal tool. This could warrant a platform update.
4. **IDE extensions:** Gemini mentions VS Code, Cursor, Windsurf IDE extensions. These are not reflected in our platforms table.
5. **Business/Edu plans:** Both models mention Business and Edu plan access. Our data does not include these plan tiers in the availability table.

**However**, without external verification, I cannot confirm the specific details of the Free/Go promotional access or the exact current state of CLI/IDE availability. The core gating (paid) and status (ga) appear correct.

### Proposed Changes (pending verification)
- Consider adding a note about limited-time Free/Go promotional access in the availability table
- Consider updating terminal platform from "not available" to available (Codex CLI)
- Consider adding a note about IDE extension availability
- Bump Checked date to 2026-03-15 (already done)
- Bump Verified date if data changes are confirmed

---

## Issue #262 — Projects

**Type:** verification-inconclusive
**Labels:** needs-review, verification-inconclusive

### Current Data
- Status: ga
- Gating: free
- All plans: full access (Free/Go/Plus/Pro: Standard, Team: Shared, Enterprise: Admin controls)
- Platforms: all major platforms including mobile and web

### Model Responses Summary
- **Gemini Flash:** Confirms GA, available on all plans (Free/Go/Plus/Pro/Team/Enterprise). Notes file limits per plan (Free: 5 files, Go/Plus/Edu: 25 files, Pro/Business/Enterprise: 40 files). Available on web, Windows, Mac, iOS, Android.
- **Perplexity:** Could not find any information about the Projects feature. Says it appears "unannounced or non-existent." This is clearly a search failure, not evidence the feature doesn't exist.

### Assessment
**Resolution: No data change needed — bump Checked date only.**

Reasoning:
1. Gemini confirms our data is correct: GA, available on all plans, available on all major platforms.
2. Perplexity's failure to find information is a search quality issue, not evidence of a change. The feature clearly exists and is documented at the URL in our data.
3. The file limits per plan mentioned by Gemini (5/25/40 files) are interesting detail but are usage limits within the feature, not changes to status, gating, plan availability, or platform support. Our availability table already shows "Standard" limits which encompasses these specifics.
4. No changes to status, gating, platforms, or regional availability reported by either model.

### Proposed Changes
- Bump Checked date to 2026-03-15 (already done per current file)

---

## Summary Table

| Issue | Feature | Resolution | Data Change? | Notes |
|-------|---------|------------|-------------|-------|
| #255 | DALL-E Image Generation | No change (bump Checked) | No | Conflict is about phrasing, not substance |
| #259 | Canvas | No change (bump Checked) | No | Gemini used stale info; Perplexity lacked sources |
| #260 | ChatGPT Search | No change (bump Checked) | No | Both models confirm GA/free; deprecated flag is false positive |
| #261 | Codex (Code Agent) | **NEEDS VERIFICATION** | Possibly | Free/Go promo access, CLI/terminal platform, IDE extensions |
| #262 | Projects | No change (bump Checked) | No | Perplexity search failure; Gemini confirms current data |

## Issues Requiring Further Action

**Issue #261 (Codex)** is the only issue that may need data changes. The specific items to verify with external research are:
1. Is the Free/Go limited-time promotional access to Codex still active as of March 2026?
2. Should the terminal platform be marked as available given Codex CLI?
3. Should IDE extensions (VS Code, Cursor, Windsurf) be noted in platforms or notes?

All other issues (#255, #259, #260, #262) can be closed with no data change — Checked dates are already bumped to 2026-03-15 in the current file.
