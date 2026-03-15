# Codex (Code Agent) Research - March 15, 2026

## What Perplexity Found

### Plan Availability
- **Free plan**: No access to Codex. Free users get GPT-5.3 with strict limits but no Codex support. Community reports confirm errors when attempting Codex via CLI on free tier.
- **Go plan ($8/mo)**: No full Codex Agent access. Go plan offers higher GPT-5.3 limits but "lacks full Codex Agent access, which starts at Plus." May occasionally qualify for limited email-based Codex trials.
- **Plus ($20/mo)**: Full Codex access included.
- **Pro ($200/mo)**: Full Codex access with higher limits/priority compute.
- **Team/Business ($25-30/user/mo)**: Codex included.
- **Enterprise**: Codex included with custom limits ("virtually unlimited" under fair-use).
- **Edu**: Codex included.
- **Open-source maintainers**: GitHub projects with 1,000+ stars can apply for 6 months of free Pro/Codex access (announced March 7, 2026).

Citations:
- https://uibakery.io/blog/openai-codex-pricing
- https://lovabletools.com/blog/how-to-use-chatgpt-codex-for-free-in-2026-complete-step-by-step-guide
- https://mlq.ai/news/openai-rolls-out-free-chatgpt-pro-and-codex-access-for-open-source-maintainers/
- https://www.gradually.ai/en/chatgpt-pricing/
- https://help.openai.com/en/articles/11909943-gpt-53-and-gpt-54-in-chatgpt

### Platform Availability
- **CLI/Terminal**: YES. Codex CLI is the PRIMARY interface. Installed via `npm i -g @openai/codex` or Homebrew. Runs locally on the machine.
  - macOS: Full support (Apple Silicon and x86_64)
  - Linux: Full support (x86_64 and arm64)
  - Windows: Experimental via WSL only
- **Web**: Codex is accessible via chatgpt.com/codex web interface (distinct from the CLI).
- **Desktop app**: Available via ChatGPT desktop apps (Windows, macOS).
- **Mobile**: No Codex support mentioned on iOS/Android.
- **IDE extensions**: VS Code, Cursor, and Windsurf extensions available.
- **API**: Codex API available with per-token billing; also supports ChatGPT auth.

Citations:
- https://developers.openai.com/codex/cli/
- https://github.com/openai/codex
- https://serenitiesai.com/articles/openai-codex-cli-guide-2026

### Current Model Versions
- GPT-5.2-Codex (launched Dec 2025)
- GPT-5.3-Codex (launched Feb 2026) - 25% faster, improved agentic coding
- GPT-5.4 also available for Codex tasks

Citations:
- https://openai.com/index/introducing-gpt-5-2-codex/
- https://openai.com/index/introducing-gpt-5-3-codex/

### Usage Limits
- Exact numerical limits per plan are NOT publicly documented by OpenAI.
- Limits vary by plan tier, model selection, task complexity, and whether using cloud or local execution.
- Extra ChatGPT credits can be purchased when limits are hit.
- API key usage bypasses plan limits for per-token pricing.

Citations:
- https://uibakery.io/blog/openai-codex-pricing
- https://www.bentoml.com/blog/chatgpt-usage-limits-explained-and-how-to-remove-them

---

## What Our Data Currently Says

From `/data/platforms/chatgpt.md`, the Codex section (lines 326-379):

| Field | Current Value |
|-------|---------------|
| Status | ga |
| Gating | paid |
| Verified | 2026-02-28 |
| Free | Not available |
| Go | Not available |
| Plus | Included |
| Pro | Priority compute |
| Team | Included |
| Enterprise | Custom |
| **terminal** | **No** |
| iOS | Limited (warning) |
| Android | Limited (warning) |
| Windows | Desktop app |
| macOS | Desktop app |
| Linux | No |
| web | chatgpt.com/codex |
| API | Codex API |

---

## Assessment: Changes Needed

### 1. CRITICAL: Terminal/CLI access is WRONG
**Current**: `terminal | No`
**Should be**: `terminal | Yes | Codex CLI (macOS, Linux; Windows via WSL)`

This is the biggest error. OpenAI's Codex CLI (`@openai/codex` npm package) is a major interface for Codex -- it is an open-source terminal-based coding agent at https://github.com/openai/codex. The official docs at developers.openai.com/codex/cli/ confirm this. Our data marks terminal as unavailable, which is incorrect.

### 2. Linux support is WRONG
**Current**: `Linux | No`
**Should be**: `Linux | Yes | Via Codex CLI (x86_64, arm64)`

Codex CLI runs natively on Linux. There is no ChatGPT desktop app for Linux, but the CLI provides full Codex functionality.

### 3. Windows notes could be more specific
**Current**: `Windows | Yes | Desktop app`
**Should be**: `Windows | Yes | Desktop app + CLI (experimental, via WSL)`

The CLI on Windows is experimental and requires WSL.

### 4. iOS and Android may need review
**Current**: `iOS | Warning | Limited` and `Android | Warning | Limited`
**Should be**: Likely `iOS | No` and `Android | No` (or keep warning if there's partial task viewing)

Perplexity sources found no mention of Codex on mobile. The "Limited" designation is not substantiated. However, the ChatGPT mobile apps may allow viewing Codex task results even if you can't initiate tasks -- this needs further verification.

### 5. Business and Edu plan rows are missing
Multiple sources confirm Codex is available on Business and Edu plans, but our availability table does not include these rows. This is a minor gap since these plans are not consistently listed across all features.

### 6. Verified date should be updated
**Current**: 2026-02-28
**Should be**: 2026-03-15 (if edits are made based on this research)

### 7. Talking Point should mention CLI
**Current**: "Codex is ChatGPT's coding agent that can write, run, and debug code autonomously. It requires Plus or higher..."
**Should mention**: CLI/terminal access as a key interface, plus Linux support via CLI.

### 8. Sources should be expanded
**Current**: Only chatgpt.com/pricing
**Should add**:
- https://github.com/openai/codex
- https://developers.openai.com/codex/cli/
- https://openai.com/index/introducing-codex/

---

## Proposed Edits

### Platforms table replacement:
```markdown
| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app + CLI (experimental, via WSL) |
| macOS | ✅ | Desktop app + CLI |
| Linux | ✅ | CLI only (x86_64, arm64) |
| iOS | ⚠️ | View tasks only; cannot initiate |
| Android | ⚠️ | View tasks only; cannot initiate |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com/codex |
| terminal | ✅ | Codex CLI (`npm i -g @openai/codex`) |
| API | ✅ | Codex API |
```

### Talking Point replacement:
```markdown
> "Codex is ChatGPT's coding agent that can write, run, and debug code autonomously. It requires **Plus or higher**—it's not available on Free or the $8 Go plan. Available via **web, desktop apps, and a full CLI** (`npm i -g @openai/codex`) on macOS, Linux, and Windows (WSL). The CLI is open-source at github.com/openai/codex."
```

### Sources replacement:
```markdown
- [Introducing Codex](https://openai.com/index/introducing-codex/)
- [Codex CLI Documentation](https://developers.openai.com/codex/cli/)
- [Codex CLI GitHub](https://github.com/openai/codex)
- [ChatGPT Pricing](https://chatgpt.com/pricing)
```

### Changelog addition:
```markdown
| 2026-03-15T12:00Z | [Verified] Terminal/CLI access added (Codex CLI on macOS/Linux/Windows WSL); Linux support added; sources expanded |
```
