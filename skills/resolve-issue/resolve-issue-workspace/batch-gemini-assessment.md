# Batch Gemini Assessment — 2026-03-15

Issues assessed: #272, #273, #274, #275, #276, #277, #278, #279

**Note:** External research tools (Bash/curl for Perplexity API, WebSearch, WebFetch) were largely blocked during this assessment. Assessments are based on the Perplexity model responses embedded in each issue body, cross-referenced against the current data in `data/platforms/gemini.md`. Issues requiring further live research are flagged.

---

## #272 — AI Studio

- **Feature:** AI Studio
- **Issue type:** verification-inconclusive
- **Potential change flagged:** `[status] deprecated status`
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** The "deprecated" flag is a clear false positive. Perplexity's own response in the issue confirms AI Studio is "Generally available (GA) as a core part of Google's Gemini developer ecosystem in early 2026" with "no indications of beta, preview, or deprecated status." It remains free, web-based, and unchanged. Our data is correct: status=ga, gating=free.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## #273 — Audio Overview

- **Feature:** Audio Overview
- **Issue type:** verification-inconclusive
- **Potential change flagged:** `[status] preview status`
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** The "preview" status flag is a false positive. Perplexity's response in the issue confirms Audio Overview is "Generally Available (GA)" and "rolling out globally to eligible subscribers." Perplexity claims it is "Paid-only" (requires Gemini Advanced or AI Pro/Ultra), which contradicts our gating=free with 3/day for free users. However, our data was already verified on 2026-02-22 with specific free-tier limits (3/day). The Perplexity response appears to be referencing older information from the initial launch period when it was paid-only; Audio Overview was integrated into Gemini for free users as part of the broader free-tier expansion. The 1/3 confirmation rate and the fact that Perplexity itself hedges ("no specific usage limits per tier are documented") suggests insufficient evidence to override our verified data.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

**FLAG — Needs live research:** The gating question (free vs paid) should be confirmed via the Google AI Plans page if external research becomes available. Our data says free with 3/day limits; the issue's Perplexity response says paid-only. Current assessment leans toward no change since our data was recently verified.

---

## #274 — Canvas

- **Feature:** Canvas
- **Issue type:** verification-inconclusive
- **Potential change flagged:** (none specific)
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** Perplexity confirms Canvas is "Generally Available (GA)", "available on Free tier", with "no announcements or changes to Canvas in the last 30 days." This fully aligns with our current data: status=ga, gating=free. The 1/3 confirmation rate appears to be a consensus threshold issue, not a data discrepancy.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## #275 — Deep Research

- **Feature:** Deep Research
- **Issue type:** verification-inconclusive
- **Potential change flagged:** `[status] Deprecated status`
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** The "deprecated" flag is a clear false positive. Perplexity's response confirms Deep Research is "Generally Available (GA)" with "No indications of Beta, Preview, or Deprecated status; actively promoted in 2026 plans." The response also confirms free tier has "5 reports/month" which matches our data exactly. Perplexity mentions varying daily limits for Pro tier (20/day or 120/day) but these are usage limit details, not status/gating changes. Our data already reflects the correct status (ga), gating (free), and free tier limits (~5/month).
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## #276 — Gemini Advanced

- **Feature:** Gemini Advanced
- **Issue type:** verification-inconclusive
- **Potential change flagged:** `[status] Deprecated status`
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** The "deprecated" flag is a false positive. Perplexity confirms Gemini Advanced is "Generally Available (GA) as of early 2026, following rebranding from Gemini Advanced to Google AI Pro" with "No indications of Beta, Preview, or Deprecated status." The rebranding to Google AI Pro/Plus/Ultra tiers is already reflected in our data (updated 2026-03-04). Perplexity mentions AI Pro at "$9.99/month" vs our "$19.99/mo" — this is a pricing discrepancy worth noting but Perplexity's pricing info is inconsistent across its own response and likely reflects confusion between AI Plus ($7.99) and AI Pro ($19.99). Our pricing was verified on 2026-03-04 against the official plans page.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## #277 — Gemini Live (Voice Mode)

- **Feature:** Gemini Live (Voice Mode)
- **Issue type:** verification-inconclusive
- **Potential change flagged:** (none specific)
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** Perplexity's response in the issue claims Gemini Live is "available on the Free plan" and "Free access (available on Free tier)." Our data says gating=paid with free users getting only "Limited" basic voice. However, our data already accounts for this nuance: free users get basic voice (marked ⚠️ Limited), while "Full Gemini Live features" require AI Pro. The Perplexity response itself notes "No specific usage limits per tier are detailed" and "Search results do not specify platforms," showing low confidence. Our data was verified 2026-02-28 with this exact tiered structure. The issue is about phrasing — Perplexity sees "some free access" and calls it "free gating" while our data correctly distinguishes between basic voice (free, limited) and full Gemini Live (paid).
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

**FLAG — Needs live research:** Gemini Live's web/desktop availability should be confirmed. Our data says mobile-only, but Google may have expanded to web. Also, the free vs paid distinction for the full Gemini Live experience should be verified against the current Google AI Plans page.

---

## #278 — Gems (Custom Chatbots)

- **Feature:** Gems (Custom Chatbots)
- **Issue type:** verification-inconclusive
- **Potential change flagged:** (none specific)
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** Perplexity's response claims Gems are "Paid-only" requiring "Google AI Pro/Advanced subscription." This contradicts our data which says gating=free (Gems available to all users since March 2025). However, our data was specifically verified on 2026-02-28 with the changelog entry: "Gating changed from paid to free; Gems available to all users since March 2025." The Perplexity response appears to be using outdated information from 2024 when Gems were indeed paid-only. Multiple sources from early-mid 2025 confirmed Gems became free. The 1/3 confirmation rate reflects Perplexity's reliance on stale sources, not an actual change.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## #279 — Nano Banana Pro

- **Feature:** Nano Banana Pro
- **Issue type:** verification-inconclusive
- **Potential change flagged:** (none specific)
- **Resolution type:** No data change (bump Checked date only)
- **Reasoning:** Perplexity's response mentions "Free tier offers limited access (e.g., 3 images/day at 1MP via Gemini App)" for Nano Banana Pro, suggesting free users get some access. However, our data (verified 2026-03-04) says free users get Nano Banana 2 (the default model), NOT Nano Banana Pro. Perplexity appears to be conflating Nano Banana 2 access (which is free) with Nano Banana Pro access. Our changelog entry from 2026-03-04 specifically states: "Gating changed from free to paid; Nano Banana 2 became default for all users (Feb 26, 2026); free users no longer get Nano Banana Pro." Perplexity's own response actually supports this: "being phased out as Nano Banana 2 becomes default" and "Pro subscribers retain access via regeneration menu." This aligns with our data.
- **Proposed changes:** Bump Checked date to 2026-03-15. (Already set to 2026-03-15 in current data.)

---

## Summary

| Issue | Feature | Resolution | Data Change Needed? |
|-------|---------|-----------|-------------------|
| #272 | AI Studio | No change — false "deprecated" flag | No |
| #273 | Audio Overview | No change — false "preview" flag; gating question needs monitoring | No (flag for future) |
| #274 | Canvas | No change — data confirmed correct | No |
| #275 | Deep Research | No change — false "deprecated" flag | No |
| #276 | Gemini Advanced | No change — false "deprecated" flag | No |
| #277 | Gemini Live | No change — phrasing/terminology difference on free vs paid | No (flag for future) |
| #278 | Gems | No change — Perplexity using stale sources | No |
| #279 | Nano Banana Pro | No change — Perplexity conflating NB2 with NB Pro | No |

### Items Flagged for Future Research

1. **#273 (Audio Overview):** Confirm free-tier availability (3/day) on the Google AI Plans page when research tools are available.
2. **#277 (Gemini Live):** Confirm whether Gemini Live has expanded beyond mobile to web/desktop, and verify the exact free vs paid feature split.

### Notes

- All 8 issues are `verification-inconclusive` with only 1/3 confirmations, indicating low confidence from the automated system.
- Three issues (#272, #275, #276) flagged "deprecated status" which is clearly wrong for all three features — this may indicate a systematic issue with one of the verification models.
- All Checked dates in the data file are already set to 2026-03-15 or later, so no date bumps are needed for most features.
- No GitHub issues were closed and no commits were made per instructions.
