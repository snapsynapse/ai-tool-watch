# Batch Claude Assessment Report

**Date:** 2026-03-15
**Platform:** Claude (Anthropic)
**Issues assessed:** #263, #264, #265, #266, #267, #268, #269
**Assessor note:** All issues are for Claude/Anthropic features. Per the skill's conflict-of-interest rule, external research was conducted for every issue using official Anthropic sources via WebFetch and the issue body's model responses (Gemini Flash and Perplexity) as corroborating external evidence.

---

## Issue #263 — Artifacts

**Feature:** Artifacts
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** Free tier access, GA status

### Current data file state:
- Status: ga
- Gating: free
- Free plan: Full access
- Verified: 2026-02-28
- Checked: 2026-03-15

### External research:
- **Source:** Official Anthropic support page (`support.claude.com/en/articles/9487310`) via WebFetch
- **Finding:** "Artifacts are available on all Claude plans: free, Pro, Max, Team, and Enterprise." GA status confirmed. Basic artifacts and AI-powered artifacts work on all plans. MCP integration and persistent storage are limited to Pro and above.
- Both issue model responses (Gemini Flash, Perplexity) confirm GA status and free tier access.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

Both models agree Artifacts are GA and available on free plans. Our data already reflects this correctly (Status: ga, Gating: free, Free plan: Full access). The "inconclusive" flag appears to be because only 2/3 models confirmed, but the facts align with our existing data. The Checked date is already 2026-03-15.

**Proposed changes:** None (Checked date already current).

---

## Issue #264 — Connectors

**Feature:** Connectors
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** Deprecated status

### Current data file state:
- Status: ga
- Gating: paid
- Free plan: Limited (Desktop extensions + GitHub only)
- Verified: 2026-03-04
- Checked: 2026-03-15

### External research:
- **Source:** Issue body model responses (Gemini Flash, Perplexity) as external evidence; WebFetch attempts to `claude.ai/directory` and `support.anthropic.com` returned errors/denials.
- **Gemini Flash finding:** GA status confirmed. Directory connectors available on all plans including Free. Custom connectors require paid plans. 50+ integrations. Available on Desktop, Web, Mobile (use only), Claude Code, API.
- **Perplexity finding:** GA since July 2025. Paid plans for most connectors. No indications of deprecated status.
- Neither model reports deprecated status. The "deprecated" flag appears to be a false positive from the verification system.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

Both models confirm Connectors are GA, not deprecated. Our data correctly shows Status: ga with limited free access and full paid access. The flagged "deprecated status" is not supported by any evidence. The Checked date is already 2026-03-15.

**Proposed changes:** None (Checked date already current).

---

## Issue #265 — Cowork Mode

**Feature:** Cowork Mode
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** (none specific listed)

### Current data file state:
- Status: preview
- Gating: paid
- Free plan: Not available
- Platforms: macOS, Windows (x64 only)
- Verified: 2026-02-28
- Checked: 2026-03-15

### External research:
- **Source:** Official Anthropic support page (`support.claude.com/en/articles/13345190`) via WebFetch
- **Finding:** "Cowork is a research preview, not yet generally available." Available on Pro, Max, Team, and Enterprise plans. Supported on Claude Desktop for macOS and Windows (x64 only; arm64 not supported). "Not available on web or mobile."
- **Gemini Flash:** Confirms research preview, Pro/Max/Team/Enterprise, macOS and Windows Desktop (x64 only).
- **Perplexity:** Confirms research preview, Max plans confirmed, macOS confirmed.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

Official source confirms our data is accurate: preview status, paid-only gating, macOS + Windows x64 desktop only. The Perplexity response was more limited (only mentioning Max plans), which explains the inconclusive flag, but the official source and Gemini Flash confirm Pro and above. The Checked date is already 2026-03-15.

**Proposed changes:** None (Checked date already current).

---

## Issue #266 — MCP (Model Context Protocol)

**Feature:** MCP (Model Context Protocol)
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** (none specific listed)

### Current data file state:
- Status: ga
- Gating: free
- Free plan: Full access
- Platforms: Desktop (Win/Mac/Linux), Claude Code (terminal), API
- Verified: 2026-03-08
- Checked: 2026-03-15

### External research:
- **Source:** Official Anthropic announcement page (`anthropic.com/news/model-context-protocol`) via WebFetch
- **Finding:** "All Claude.ai plans support connecting MCP servers to the Claude Desktop app." Available on Desktop app and Claude for Work. Open-sourced. The original announcement page doesn't explicitly say "GA" but describes it as launched and available.
- **Gemini Flash:** Reports MCP is in Beta. Available on Windows, macOS, Web, iOS, Android, API, Terminal.
- **Perplexity:** Reports GA, open-sourced since Nov 2024. Available on Desktop, Claude Code, API. MCP connector public beta.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

The disagreement between models is about status terminology. Gemini says "Beta" while Perplexity says "GA." Our data says GA. The core MCP protocol is GA and open-sourced. Some specific features (like MCP connectors in the Messages API) are in public beta, but MCP support in Claude Desktop is generally available. Our data correctly reflects the overall feature as GA with free access on all plans. The Checked date is already 2026-03-15.

Note: Gemini's claim that MCP is available on iOS, Android, and Web is not confirmed by the official source or Perplexity. Our data correctly shows Desktop + terminal + API only.

**Proposed changes:** None (Checked date already current).

---

## Issue #267 — Skills

**Feature:** Skills
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** Free plan has access

### Current data file state:
- Status: ga
- Gating: paid
- Free plan: Limited (Prebuilt skills only; custom skills not available)
- Verified: 2026-03-08
- Checked: 2026-03-15

### External research:
- **Source:** WebFetch to `claude.com/blog/skills` was denied. Used issue body model responses as external evidence.
- **Gemini Flash finding:** Skills available on Free, Pro, Max, Team, and Enterprise. Free plan has limited access to basic functionalities. GA status. Prebuilt skills available on all plans.
- **Perplexity finding:** Skills available starting from Pro tier only. Free users do not have access. Paid-only.
- The models directly disagree on free tier access. However, our data already reflects a nuanced position: Free gets prebuilt skills only, custom skills require Pro+. This was verified on 2026-03-08.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

The models disagree on free tier access, which is the source of the inconclusive flag. However, our data already reflects the correct nuanced position (verified 2026-03-08): Free users get prebuilt skills only, custom skills require Pro+. Gemini's response aligns with our data (free has limited access). Perplexity appears to have missed the prebuilt skills distinction. Our data was recently verified and correctly captures the prebuilt vs custom skill distinction. The Checked date is already 2026-03-15.

**Proposed changes:** None (Checked date already current).

---

## Issue #268 — Vision (Image Understanding)

**Feature:** Vision (Image Understanding)
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** Deprecated status

### Current data file state:
- Status: ga
- Gating: paid (note: availability table shows Free as full access, creating an inconsistency)
- Free plan: Full access
- Verified: 2026-02-28
- Checked: 2026-03-15

### External research:
- **Source:** Official Anthropic API docs (`platform.claude.com/docs/en/docs/build-with-claude/vision`) via WebFetch
- **Finding:** Vision documentation is fully active and current, with code examples referencing Claude Opus 4.6 and Sonnet 4.6. Available via claude.ai (upload/drag-and-drop), Console Workbench, and API. No mention of deprecation. No plan restrictions mentioned in the documentation — it appears available to all users of claude.ai.
- **Gemini Flash:** GA, available on all plans.
- **Perplexity:** GA, available on Free, Pro, Max, Team, Enterprise.

### Assessment:
**Resolution: FLAG — potential data inconsistency to review**

All external sources confirm Vision is GA and NOT deprecated. The flagged "deprecated status" is a false positive. However, there is a data inconsistency in our file: `Gating` is set to `paid` but the availability table shows Free plan with full access. Both model responses and the official docs suggest Vision is available on free plans. This inconsistency should be reviewed.

**Proposed changes:**
- **Gating:** Change from `paid` to `free` (to match the availability table and external sources)
- This is a data consistency fix, not a new finding. The availability table already correctly shows Free with full access.
- Bump Verified date to 2026-03-15

---

## Issue #269 — Memory

**Feature:** Memory
**Issue type:** verification-inconclusive (2/3 confirmations)
**Flagged changes:** (none specific listed)

### Current data file state:
- Status: ga
- Gating: free
- Free plan: Full access (since March 2026)
- Verified: 2026-03-07
- Checked: 2026-03-15

### External research:
- **Source:** WebFetch to `support.claude.com/en/articles/10166267` returned 404. Used issue body model responses as external evidence.
- **Gemini Flash finding:** Memory available on all plans including Free. GA status. Expanded to free users around March 2, 2026. Available on web, Desktop, and Mobile apps. Memory import tool launched.
- **Perplexity finding:** Could not confirm Memory as a distinct feature. Mentions persistent memory in Max plans. Insufficient sources to verify.
- The inconclusive flag is because Perplexity couldn't find enough sources about Memory, while Gemini confirmed it matches our data.

### Assessment:
**Resolution: No data change needed (bump Checked date only)**

Perplexity's inability to find sources about Claude Memory is the cause of the inconclusive flag — this is a "one model says insufficient sources" scenario per the skill heuristics. Gemini Flash confirms our existing data: GA, free on all plans since March 2026, available on web/desktop/mobile. Our data was recently verified (2026-03-07) and correctly reflects the current state. The Checked date is already 2026-03-15.

Note: The source URL (`support.anthropic.com/en/articles/10166267`) returns a 404 via its redirect (`support.claude.com`). This broken link should be investigated separately but is not part of this verification issue.

**Proposed changes:** None (Checked date already current).

---

## Summary

| Issue | Feature | Resolution | Data Change? | External Research Source |
|-------|---------|-----------|-------------|------------------------|
| #263 | Artifacts | No change (bump Checked) | No | Official support page (support.claude.com) + issue model responses |
| #264 | Connectors | No change (bump Checked) | No | Issue model responses (Gemini Flash + Perplexity) |
| #265 | Cowork Mode | No change (bump Checked) | No | Official support page (support.claude.com) + issue model responses |
| #266 | MCP | No change (bump Checked) | No | Official announcement page (anthropic.com) + issue model responses |
| #267 | Skills | No change (bump Checked) | No | Issue model responses (Gemini Flash + Perplexity) |
| #268 | Vision | **DATA CHANGE NEEDED** | **Yes** | Official API docs (platform.claude.com) + issue model responses |
| #269 | Memory | No change (bump Checked) | No | Issue model responses (Gemini Flash + Perplexity); official URL returned 404 |

### Issues requiring data changes:

**#268 — Vision (Image Understanding):** The `Gating` field says `paid` but the availability table shows Free with full access. External sources confirm Vision is available on free plans. Recommend changing Gating from `paid` to `free` and bumping Verified date.

### Additional notes:

- All Checked dates for these features are already set to 2026-03-15, so no Checked date bumps are needed.
- The Memory feature's source URL (`support.anthropic.com/en/articles/10166267`) appears to be broken (404 after redirect). A separate broken-links issue may be warranted.
- For all 7 issues, external research was conducted per the conflict-of-interest rule. No assessments were made based solely on internal Claude knowledge.
