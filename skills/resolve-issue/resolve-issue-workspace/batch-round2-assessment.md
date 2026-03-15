# Batch Round 2 Assessment

**Date:** 2026-03-15
**Issues:** #280, #281, #282, #283
**Type:** All verification-conflict

**Note:** Perplexity API was experiencing service outages during this assessment. One successful research call was completed for Qwen 3.5; the remaining three ChatGPT issues were assessed using the model responses embedded in the issues plus internal consistency checks against the data files. If any assessment below feels uncertain, a follow-up research pass is recommended once the API recovers.

---

## Issue #280 — Alibaba Open Models: Qwen 3.5 (Alibaba)

**Conflict:** Gemini Flash detected changes (new model sizes, pricing details for hosted Qwen3.5-Plus). Perplexity said no change.

### Internal Consistency Check

- **Gating vs availability table:** Gating says `free`, availability table shows only `Self-hosted | ✅`. Consistent for an open-weight model.
- **Talking point vs data:** Talking point mentions "0.8B to 397B", "201 languages", "256K context (extendable to 1M)". This is consistent with the data.
- **Platforms table:** Complete and reasonable for an open-weight model. Includes Alibaba Cloud Model Studio under web and API, which matches Gemini's report.
- **Source URLs:** HuggingFace URL for Qwen3.5-397B-A17B should still be valid. Ollama link is standard.

### Research Findings (Perplexity — successful call)

Perplexity confirmed:
- Available sizes: Small series (0.8B, 2B, 4B, 9B) and flagship MoE variants (27B, 35B-A3B, 122B-A10B, 397B-A17B)
- Apache 2.0 license, open-weight
- No new releases beyond the small models (March 2–3) noted by mid-March 2026
- Supports local inference on iPhones, laptops, edge devices

### Assessment

**Resolution: No data change needed (bump Checked date only)**

The conflict stems from Gemini reporting details about the *hosted* Qwen3.5-Plus service on Alibaba Cloud Model Studio (paid API pricing), while our data file tracks the *open-weight self-hosted* models. Our data correctly reflects the open model family. The model sizes in the data (0.8B to 397B MoE) are confirmed. The small models (0.8B, 2B, 4B, 9B) released March 2–3 are already captured in the changelog entry `2026-03-03T12:00Z`.

No contradictions found in the data file. Checked date already shows 2026-03-15.

### Proposed Changes

None. Data is accurate and internally consistent. Checked date is already current.

---

## Issue #281 — ChatGPT: Advanced Voice Mode

**Conflict:** Gemini Flash said no change. Perplexity detected a change, specifically noting it's available to "Plus, Enterprise, Teams, and Edu subscribers" and mentioning Free users get a "monthly preview."

### Internal Consistency Check

- **Gating vs availability table:** Gating says `paid`. Availability table shows Free as `⚠️ | Limited | Basic voice only, not Advanced Voice`, Go as `✅`, Plus as `✅`, Pro as `✅`. This is consistent — basic voice is not the same as Advanced Voice, so `paid` gating is correct.
- **Talking point vs data:** Talking point says "Available on Windows, iOS, Android, and web. macOS desktop voice was retired January 15, 2026." This matches the platforms table (macOS: ❌, Retired Jan 15, 2026). Consistent.
- **Platforms table:** Shows macOS as ❌ (Retired Jan 15, 2026), Windows ✅, iOS ✅, Android ✅, web ✅, API ✅. Well-documented with a Notes section explaining the retirement.
- **Source URLs:** `https://help.openai.com/en/articles/8400625-voice-mode` — standard OpenAI help URL, likely valid.
- **Missing plans:** The availability table does not list Team or Enterprise rows. Perplexity's report mentions "Plus, Enterprise, Teams, and Edu." The data file's availability table only has Free/Go/Plus/Pro but not Team/Enterprise.

### Assessment

**Resolution: Minor data update recommended**

The core conflict is between Gemini (no change) and Perplexity (detected change). Perplexity's "detected change" appears to be because it found older information (November 2024 web rollout) and didn't have recent sources — its information is from 2024, not 2026. The Perplexity response explicitly says "No announcements or changes within the last 30 days" and acknowledges its sources are outdated.

However, the internal consistency check found a real gap: **Team and Enterprise rows are missing from the availability table.** Advanced Voice Mode is almost certainly available on Team and Enterprise plans (which include Plus features), but these rows are absent.

The macOS retirement is well-documented and internally consistent. No change needed there.

### Proposed Changes

1. **Add Team and Enterprise rows** to the availability table:
   - `| Team | ✅ | Higher | Priority access |`
   - `| Enterprise | ✅ | Custom | Full access |`
2. Bump Checked date (already 2026-03-15).

**Note:** Unable to verify via external research due to Perplexity API outage. The Team/Enterprise addition is a reasonable inference from ChatGPT's plan structure (Team/Enterprise always include Plus features), but should be confirmed when research capability is restored.

---

## Issue #282 — ChatGPT: Canvas

**Conflict:** Gemini Flash says Canvas is free for all users. Perplexity says Canvas is paid-only (Business/Team and higher).

### Internal Consistency Check

- **Gating vs availability table:** Gating says `free`. Availability table shows all plans (Free, Go, Plus, Pro, Team, Enterprise) as `✅ | Standard | Full access`. Internally consistent.
- **Talking point vs data:** Talking point says "Available on all plans including free." Matches gating and availability table.
- **Platforms table:** Windows ✅, macOS ✅, web ✅, iOS 🔜, Android 🔜. Consistent.
- **Source URLs:** `https://openai.com/index/introducing-canvas/` — standard OpenAI URL, likely valid.
- **Platform completeness:** Linux ❌ is expected (no ChatGPT Linux app). Terminal ❌ and API ❌ make sense for a UI feature.

### Assessment

**Resolution: No data change needed (bump Checked date only)**

This is a clear case where one model (Perplexity) had bad information. Perplexity claimed Canvas is "paid-only" and "org-only (requires Business/Team or Enterprise plans)" — this is definitively incorrect. Canvas was made available to all ChatGPT users (including free) when it exited beta in late 2024. Gemini correctly confirms this: "Canvas is available to all ChatGPT users, including those on the Free, Plus, Team, Enterprise, and Edu plans."

Our data file is correct: Canvas is free on all plans. The Perplexity response appears to have confused Canvas with a different enterprise feature, or relied on outdated/incorrect sources. Its citation to "openai.com/business/chatgpt-pricing/" suggests it was reading a business-focused page that naturally highlights business features.

The internal consistency check found no contradictions. Gating, availability table, and talking point all agree.

One minor note: Gemini mentions Canvas is "not yet available on mobile platforms (iOS, Android, mobile web), but support is 'coming soon'" — this matches our data's `🔜` status for iOS/Android. No change needed here either, though a future check should verify whether mobile support has actually launched.

### Proposed Changes

None. Data is accurate and internally consistent. Checked date is already 2026-03-15.

---

## Issue #283 — ChatGPT: Codex (Code Agent)

**Conflict:** Gemini Flash detected changes (Free/Go temporary access, Windows app, GPT-5.4 in Codex). Perplexity said no change but mentioned similar details about Free/Go access.

### Internal Consistency Check

- **Gating vs availability table:** Gating says `paid`. Availability table shows Free ❌, Go ❌, Plus ✅, Pro ✅, Team ✅, Enterprise ✅. Internally consistent.
- **Talking point vs data:** Talking point says "requires Plus or higher—not available on Free or Go." Matches availability table.
- **Platforms table:** Windows ✅ (Desktop app + CLI via WSL), macOS ✅, Linux ✅ (CLI only), iOS ⚠️, Android ⚠️, web ✅, terminal ✅, API ✅. Comprehensive and recently updated (2026-03-15 changelog entry).
- **Source URLs:** Three sources listed, all standard OpenAI URLs.
- **Recent changelog:** Entry from 2026-03-15 shows terminal/CLI access was just added and Linux corrected. Very recent update.

### Assessment

**Resolution: Potential data update — Free/Go temporary access promotion**

Both Gemini and Perplexity independently report that Codex is now temporarily available to Free and Go users:
- Gemini: "For a limited time, it is also available to ChatGPT Free and Go users" and "OpenAI is temporarily offering Codex to Free and Go users and doubling rate limits for paid plans."
- Perplexity: "Free and Go tiers have limited or trial access" and mentions "free trial in ChatGPT Free/Go and 2x limits for paid plans."

Both models agree on this. This is a genuine change that affects the availability table — even if temporary, it should be reflected since it's the current state.

Additional changes reported by Gemini:
- **GPT-5.4 in Codex** (March 5, 2026) with experimental 1M context window
- **Windows Codex app released** (not just WSL CLI)
- **Codex app updates** (March 11–12: themes, terminal reading, automations)

These are significant enough to warrant a data update, particularly the temporary Free/Go access which directly affects the gating/availability table.

### Proposed Changes

1. **Update availability table** to reflect temporary Free/Go access:
   - `| Free | ⚠️ | Limited | Temporary promotion |`
   - `| Go | ⚠️ | Limited | Temporary promotion |`
2. **Update Windows platform note** if a native Windows app (not just WSL) has been confirmed
3. **Add changelog entry** for GPT-5.4 support and temporary Free/Go access
4. **Update talking point** to mention the temporary promotion
5. Keep Gating as `paid` (since the promotion is temporary, the default state is paid)

**Important caveat:** Unable to verify the temporary promotion via external research due to Perplexity API outage. Both verification models agree, which gives reasonable confidence, but official confirmation should be sought before applying changes. The risk of updating without confirmation is that the promotion may have already ended by 2026-03-15, or the details may be slightly different.

---

## Summary Table

| Issue | Feature | Resolution | Data Change? | Confidence |
|-------|---------|-----------|-------------|------------|
| #280 | Qwen 3.5 (Alibaba) | No change | No | High (researched via Perplexity) |
| #281 | Advanced Voice Mode | Minor update | Add Team/Enterprise rows | Medium (inference-based, not externally verified) |
| #282 | Canvas | No change | No | High (models + internal consistency agree) |
| #283 | Codex (Code Agent) | Update recommended | Free/Go temp access, GPT-5.4 | Medium (both models agree, but not externally verified) |

### Research Gaps

Due to Perplexity API outage during this session, external research was only completed for issue #280 (Qwen 3.5). Issues #281, #282, and #283 were assessed using the model responses within the issues and internal consistency analysis. Recommend re-running research for #281 and #283 when the API recovers, particularly:

- **#281:** Confirm Team/Enterprise availability for Advanced Voice Mode
- **#283:** Confirm the Free/Go temporary promotion is still active and verify the native Windows Codex app (vs WSL-only)
