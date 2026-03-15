# Batch Assessment: Alibaba Open Models Issues #256, #257, #258

**Date:** 2026-03-15
**Platform:** Alibaba Open Models
**Data file:** `data/platforms/alibaba-open-models.md`

---

## Issue #256 — Qwen 3 (Alibaba)

- **Labels:** verification-inconclusive, needs-review
- **Feature in data file:** Qwen 3 (Alibaba) (lines 71–122)
- **Current data:** Status=ga, Gating=free, Apache 2.0, self-hosted, Checked=2026-03-15, Verified=2026-03-08

### Assessment

**Resolution: No data change needed (Checked date already current)**

Both Gemini Flash and Perplexity confirm:
- Qwen 3 is GA and free/open-weight under Apache 2.0 — matches our data
- Self-hosted deployment via Ollama, LM Studio, vLLM — matches our platforms table
- No regional restrictions — matches our data
- No changes to status, gating, plan availability, or platform support

The "inconclusive" result stems from models discussing the *hosted* Alibaba Cloud Model Studio variants (pay-per-token API, Coding Plan subscriptions) alongside the self-hosted open models. Our data file specifically tracks the self-hosted/open-weight version, which remains free and unchanged.

Gemini mentions Qwen3.5 launch (Feb 16, 2026) and team leadership changes — these are separate from the Qwen 3 entry and already tracked in the Qwen 3.5 section.

### Proposed Changes
- None. Checked date is already 2026-03-15.

---

## Issue #257 — Qwen-Coder

- **Labels:** verification-inconclusive, needs-review
- **Feature in data file:** Qwen-Coder (lines 125–175)
- **Current data:** Status=ga, Gating=free, self-hosted, URL=https://qwenlm.github.io/blog/qwen2.5-coder/, Checked=2026-03-15, Verified=2026-02-22

### Assessment

**Resolution: No data change needed for status/gating/availability (Checked date already current)**

Both models confirm:
- Open-source Qwen-Coder is GA and free — matches our data
- Self-hosted deployment works on all listed platforms — matches our data
- No regional restrictions — matches our data

The "inconclusive" result stems from models conflating the self-hosted open-weight Qwen-Coder models with the Alibaba Cloud "AI Coding Plan" (paid hosted API subscriptions for Qwen3-Coder-Plus, Qwen3-Coder-Next). Our data file tracks the self-hosted open-weight version only.

**Notable finding — URL redirect:** The current URL (`https://qwenlm.github.io/blog/qwen2.5-coder/`) now shows a redirect notice pointing to `qwen.ai`. The blog has moved. This is a broken/redirecting link but NOT a status/gating/availability change.

**Notable finding — Qwen3-Coder open-weight status:** Research confirms that "Qwen3-Coder" does NOT exist as an open-weight model. The QwenLM/Qwen3 GitHub repository has no mention of Qwen3-Coder. A Hugging Face collection search for `Qwen/qwen3-coder` returned 404. The Qwen3-Coder-Plus and Qwen3-Coder-Next models mentioned by the verification bots are Alibaba Cloud hosted-only API models, not open-weight downloads. Our entry correctly still references Qwen2.5-Coder as the latest self-hosted coder model.

### Proposed Changes
- None required for this verification issue. The status, gating, and availability are all correct.
- **Separate concern (not part of this issue):** The URL could be updated from `https://qwenlm.github.io/blog/qwen2.5-coder/` to the new blog location at `qwen.ai` in a future maintenance pass.

---

## Issue #258 — Qwen 3.5 (Alibaba)

- **Labels:** verification-inconclusive, needs-review
- **Feature in data file:** Qwen 3.5 (Alibaba) (lines 178–229)
- **Current data:** Status=ga, Gating=free, Apache 2.0, self-hosted, Checked=2026-03-15, Verified=2026-03-07

### Assessment

**Resolution: No data change needed (Checked date already current)**

Both Gemini Flash and Perplexity confirm:
- Qwen 3.5 is GA and free under Apache 2.0 — matches our data
- Flagship 397B-A17B MoE model plus smaller sizes — matches our data (0.8B to 397B MoE)
- 201 languages, hybrid thinking modes — matches our talking point
- No regional restrictions — matches our data
- Released 2026-02-16 — matches our data

The "inconclusive" result again comes from models discussing hosted Alibaba Cloud pricing alongside the self-hosted open-weight version. Our data correctly tracks only the self-hosted variant.

Gemini mentions small model releases (0.8B-9B on 2026-03-02) which are already captured in our changelog entry dated 2026-03-03.

### Proposed Changes
- None. Checked date is already 2026-03-15.

---

## Summary

| Issue | Feature | Resolution | Data Change Needed? |
|-------|---------|-----------|-------------------|
| #256 | Qwen 3 (Alibaba) | No change — data correct | No |
| #257 | Qwen-Coder | No change — data correct | No |
| #258 | Qwen 3.5 (Alibaba) | No change — data correct | No |

**Common pattern:** All three issues were triggered because verification models discussed Alibaba Cloud's *hosted* API offerings (Model Studio, Coding Plan subscriptions, pay-per-token pricing) in addition to the self-hosted open-weight models. Since our data file specifically tracks the "Alibaba Open Models" platform (self-hosted, free, open-weight), none of these hosted-service details constitute a change to our tracked data.

**No issues require data changes. No issues are flagged for update.**

All three can be closed with "no data change needed" comments once approved.
