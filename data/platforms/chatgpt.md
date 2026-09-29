---
name: ChatGPT
vendor: OpenAI
logo: https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg
status_page: https://status.openai.com
pricing_page: https://chatgpt.com/pricing
last_verified: 2026-08-25
---

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | GPT-5.4 Mini (Thinking menu); ~10 msgs/5hrs then fallback |
| Go | $8/mo | GPT-5.4 Mini; 10x free limits, longer memory, may have ads |
| Plus | $20/mo | GPT-5.4 Thinking, 5x Go limits, ad-free |
| Pro | $200/mo | Unlimited GPT-5.4 Pro, Sora 2 Pro, 1M context |
| Business | $25-30/user/mo | Plus features + admin, 2 user minimum |
| Enterprise | Custom | SSO, advanced security, dedicated support |

---

## Advanced Voice Mode

| Property | Value |
|----------|-------|
| Category | voice |
| Status | ga |
| Gating | mixed |
| URL | https://help.openai.com/en/articles/8400625-voice-mode |
| Launched | 2024-09-24T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Limited | GPT-Live-1 mini; web + mobile only, no desktop app |
| Go | ✅ | Standard | GPT-Live-1; web + mobile |
| Plus | ✅ | Daily cap | GPT-Live-1; incl. desktop app |
| Pro | ✅ | Higher | GPT-Live-1; incl. desktop app |
| Business | ✅ | Daily cap | GPT-Live-1; incl. desktop app |
| Enterprise | ✅ | Custom | GPT-Live-1; incl. desktop app, admin-enabled |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app (paid plans) |
| macOS | ✅ | Desktop app (paid plans), returned Jul 2026 |
| Linux | ❌ |  |
| iOS | ✅ | Best mobile experience |
| Android | ✅ | Full support |
| Chrome | ❌ |  |
| web | ✅ | Browser with microphone |
| terminal | ❌ |  |
| API | ✅ | OpenAI API |

### Regional

Available globally.

### Talking Point

> "Advanced voice is now **available on every plan, including free**—OpenAI's GPT-Live replaced the old Advanced Voice Mode as the default, with GPT-Live-1 mini for free accounts and GPT-Live-1 for paid. Free users get it on **web and mobile**; **voice in the macOS and Windows desktop apps is paid-only** and returned in July 2026 after being retired in January."

### Notes

**GPT-Live replaced Advanced Voice Mode (July 2026):**
OpenAI's GPT-Live is now the default ChatGPT voice experience. Per the GPT-Live system card, GPT-Live-1 is the default voice model for paid users and GPT-Live-1 mini for free users. The legacy Advanced Voice Mode remains reachable only as a fallback for features GPT-Live does not yet support (video and screen sharing) on web and mobile.

**Usage limits:** OpenAI publishes no per-tier numeric caps. The model release notes state only that "usage of advanced Voice (audio inputs and outputs) by Plus and Team users is limited on a daily basis." Limits are dynamic and surfaced in-app. Specific minute figures circulating in third-party guides are not OpenAI-confirmed.

**macOS desktop voice — retired then restored:**
- **January 15, 2026** — OpenAI retired all voice functionality from the ChatGPT macOS desktop app, to "focus on more unified and improved voice experiences across our apps." Voice remained on web, iOS, Android, and the Windows app.
- **July 23, 2026** — ChatGPT Voice returned to the desktop app on both macOS and Windows, powered by GPT-Live, rolling out globally to Plus, Pro, Business, Edu, and Enterprise plans. It integrates with ChatGPT Work and Codex for voice-directed agent control.

Free-tier users still have no desktop voice access and must use chatgpt.com or the mobile apps.

### Sources

- [Voice Mode Help](https://help.openai.com/en/articles/8400625-voice-mode)
- [GPT-Live System Card](https://deploymentsafety.openai.com/gpt-live)
- [Model Release Notes](https://help.openai.com/en/articles/9624314-model-release-notes)
- [ChatGPT Release Notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- [ChatGPT Pricing](https://chatgpt.com/pricing)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-07-25T12:00Z | [Verified] Free tier gained advanced voice (GPT-Live-1 mini); gating paid → mixed; macOS desktop voice returned Jul 23 2026 for paid plans; GPT-Live replaces Advanced Voice Mode as the default experience |
| 2026-03-15T12:00Z | [Verified] Added Team and Enterprise rows to availability table |
| 2026-01-15T12:00Z | macOS desktop voice retired |
| 2024-09-24T12:00Z | Initial entry |

---

## Agent Mode

| Property | Value |
|----------|-------|
| Category | agents |
| Status | ga |
| Gating | paid |
| URL | https://openai.com/index/introducing-chatgpt-agent/ |
| Launched | 2025-07-17T12:00Z |
| Verified | 2026-08-15|
| Checked | 2026-09-04|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Go | ❌ | — | Not available |
| Plus | ✅ | 40/month | Initial requests only count |
| Pro | ✅ | 400/month | 10x Plus limits |
| Business | ✅ | 40/month | Can upgrade to flex pricing |
| Enterprise | ✅ | Custom | Configurable limits |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ✅ | OpenAI API |

### Regional

Available globally including EEA. Some Connector-based agent actions remain restricted in EEA/Switzerland/UK.

### Talking Point

> "ChatGPT's Agent Mode lets it browse the web and take actions on your behalf. It's available on **Plus ($20/mo) and higher**—the new $8 Go plan does NOT include it. Plus gives you 40 agent tasks per month; Pro gives you 400. **Now available in EEA**—basic agent tasks rolled out to Europe in late July 2025; some Connector features remain restricted."

### Sources

- [ChatGPT Agent Help](https://help.openai.com/en/articles/11752874-chatgpt-agent)
- [Agent Release Notes](https://help.openai.com/en/articles/11794368-chatgpt-agent-release-notes)
- [Introducing ChatGPT Agent](https://openai.com/index/introducing-chatgpt-agent/)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-03-04T12:00Z | [Verified] Regional section updated: EEA now available for basic agent tasks (rolled out late July 2025); Connector-based actions still restricted in EEA/CH/UK |
| 2025-07-17T12:00Z | Initial entry |

---

## Atlas Browser

| Property | Value |
|----------|-------|
| Category | browser |
| Status | ga |
| Gating | free |
| URL | https://openai.com/index/introducing-chatgpt-atlas/ |
| Launched | 2025-10-21T12:00Z |
| Verified | 2026-03-27|
| Checked | 2026-09-04|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Browser features, no agent |
| Go | ✅ | Standard | Browser features, no agent |
| Plus | ✅ | 40/month | Agent Mode in Atlas |
| Pro | ✅ | 400/month | Full agent capabilities |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | 🔜 | Expected 2026 (not yet released) |
| macOS | ✅ | Apple Silicon, macOS 12+ |
| Linux | ❌ |  |
| iOS | 🔜 | Expected 2026 |
| Android | 🔜 | Expected 2026 |
| Chrome | ❌ |  |
| web | ❌ | Not a web app |
| terminal | ❌ |  |
| API | ❌ | Atlas is client-only |

### Regional

Available where ChatGPT is available. Same regional restrictions apply.

### Talking Point

> "Atlas is OpenAI's AI-native browser. **Right now it's macOS only**—Windows is expected in the next couple months. You can use the browser on the free plan, but Agent Mode inside Atlas requires Plus or higher."

### Sources

- [Introducing ChatGPT Atlas](https://openai.com/index/introducing-chatgpt-atlas/)
- [Atlas Release Notes](https://help.openai.com/en/articles/12591856-chatgpt-atlas-release-notes)

### Changelog

| Date | Change |
|------|--------|
| 2026-03-07T12:00Z | [Verified] Windows note updated from "Expected late Feb 2026" to "Expected 2026 (not yet released)" — both models confirmed still macOS-only |
| 2025-10-21T12:00Z | Initial entry |

---

## Canvas

| Property | Value |
|----------|-------|
| Category | coding |
| Status | deprecated |
| Gating | free |
| URL | https://openai.com/index/introducing-canvas/ |
| Launched | 2024-10-03T12:00Z |
| Verified | 2026-08-15|
| Checked | 2026-09-04|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | GPT-4o only | Via GPT-4o default; removed from GPT-5.5 |
| Go | ✅ | GPT-4o only | Via GPT-4o default; removed from GPT-5.5 |
| Plus | ✅ | GPT-4o + legacy | GPT-4o default; legacy-model access sunsets 2026-08-26 |
| Pro | ✅ | GPT-4o + legacy | GPT-4o default; legacy-model access sunsets 2026-08-26 |
| Business | ✅ | GPT-4o + legacy | GPT-4o default; legacy-model access sunsets 2026-08-26 |
| Enterprise | ✅ | GPT-4o + legacy | GPT-4o default; legacy-model access sunsets 2026-08-26 |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | 🔜 | Coming soon |
| Android | 🔜 | Coming soon |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ❌ | Not available via API |

### Regional

Available globally where ChatGPT is available.

### Talking Point

> "Canvas is **being sunset**. OpenAI removed the split-screen Canvas interface from its GPT-5.5 flagship models (Instant and Thinking), replacing it with inline **writing blocks and code blocks** in the chat thread. Canvas **remains available by default in GPT-4o for all users including free**, and paid users can still reach it through legacy models—but that legacy path **ends when OpenAI o3 retires on August 26, 2026**."

### Sources

- [Introducing Canvas](https://openai.com/index/introducing-canvas/)
- [ChatGPT Model Release Notes](https://help.openai.com/en/articles/9624314-model-release-notes)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-07-22T12:00Z | [Verified] Status ga → deprecated. Canvas removed from GPT-5.5 Instant/Thinking (replaced by inline writing/code blocks); still default in GPT-4o for all users; paid legacy-model access sunsets 2026-08-26. Availability notes updated; talking point rewritten. |
| 2024-10-03T12:00Z | Initial entry |

---

## ChatGPT Search

| Property | Value |
|----------|-------|
| Category | search |
| Status | ga |
| Gating | free |
| URL | https://openai.com/index/introducing-chatgpt-search/ |
| Launched | 2024-10-31T12:00Z |
| Verified | 2026-08-15|
| Checked | 2026-09-04|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | 30 turns/hr | Full access |
| Go | ✅ | Higher | Full access |
| Plus | ✅ | Higher | Priority |
| Pro | ✅ | Highest | Priority |
| Business | ✅ | Higher | Full access |
| Enterprise | ✅ | Custom | Full access |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ✅ | web_search_preview tool |

### Regional

Available globally where ChatGPT is available.

### Talking Point

> "ChatGPT Search provides real-time web results with cited sources—news, weather, stocks, and more. **Available on all plans including free** and even logged-out users. Powered by Bing and partner publishers."

### Sources

- [Introducing ChatGPT Search](https://openai.com/index/introducing-chatgpt-search/)
- [ChatGPT Search Help](https://help.openai.com/en/articles/9237897-chatgpt-search)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2025-02-05T12:00Z | Available to all users including logged-out |
| 2024-12-16T12:00Z | Available to all logged-in users |
| 2024-10-31T12:00Z | Initial entry

---

## Codex (Code Agent)

| Property | Value |
|----------|-------|
| Category | coding |
| Status | ga |
| Gating | free |
| URL | https://openai.com/index/introducing-codex/ |
| Launched | 2025-04-16T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Limited | Tool-usage caps apply |
| Go | ✅ | Limited | Higher caps than Free |
| Plus | ✅ | Included | Access to Codex |
| Pro | ✅ | Higher | Priority compute |
| Business | ✅ | Included | |
| Enterprise | ✅ | Custom | |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app + CLI (experimental, via WSL) |
| macOS | ✅ | Desktop app + CLI |
| Linux | ✅ | CLI only (x86_64, arm64) |
| iOS | ⚠️ | Limited |
| Android | ⚠️ | Limited |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com/codex |
| terminal | ✅ | Codex CLI (`npm i -g @openai/codex`) |
| API | ✅ | Codex API |

### Regional

Available globally.

### Talking Point

> "Codex is ChatGPT's coding agent that can write, run, and debug code autonomously. **Available on every plan including Free**, but usage is quota-gated—Free and Go get limited runs, while **Plus ($20/mo) and above** get the usable allowances. Available via **web, desktop apps, and CLI** (`npm i -g @openai/codex`) on macOS, Linux, and Windows (WSL)."

### Sources

- [ChatGPT Pricing](https://chatgpt.com/pricing)
- [Codex CLI GitHub](https://github.com/openai/codex)
- [Codex CLI Documentation](https://developers.openai.com/codex/cli/)
- [Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-25T12:00Z | [Verified] Gating paid → free — OpenAI documents Codex as included on all ChatGPT plans including Free and Go; corrects contradiction with the availability table |
| 2026-08-15T12:00Z | [Verified] Free/Go access no longer framed as a temporary promotion — OpenAI documents Codex as a standard plan capability with per-tier quotas; rows ⚠️ → ✅ |
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-03-15T18:00Z | [Verified] Temporary Free/Go promotional access; paid plan rate limits doubled |
| 2026-03-15T12:00Z | [Verified] Terminal/CLI access added (Codex CLI on macOS/Linux/Windows WSL); Linux support corrected; sources expanded |
| 2025-04-16T12:00Z | Initial entry |

---

## Codex Security

| Property | Value |
|----------|-------|
| Category | coding |
| Status | preview |
| Gating | paid |
| URL | https://openai.com/index/codex-security-now-in-research-preview/ |
| Launched | 2026-03-06T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Go | ❌ | — | Not available |
| Plus | ❌ | — | Not available |
| Pro | ✅ | Included | Research preview, free for first month |
| Business | ✅ | Included | Research preview |
| Enterprise | ✅ | Included | RBAC admin controls |
| Edu | ✅ | Included | Research preview |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Via Codex web |
| macOS | ✅ | Via Codex web |
| Linux | ⚠️ | Via open-source CLI (npm-based, beta, requires access) |
| iOS | ❌ |  |
| Android | ❌ |  |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com/codex/security |
| terminal | ✅ | Open-source Codex Security CLI (`npm install @openai/codex-security`), beta, requires access |
| API | ❌ | Web-only |

### Regional

Available globally.

### Talking Point

> "Codex Security is OpenAI's AI security agent—it connects to your GitHub repos, builds a codebase-specific threat model, validates vulnerabilities in sandboxed environments, and generates fix PRs. **Requires Pro ($200/mo), Enterprise, Business, or Edu**—not available on Plus or lower. Launched March 6, 2026 as a research preview with free usage for the first month. As of July 29, 2026, an **open-source Codex Security CLI** (`npm install @openai/codex-security`) is also available for scanning repositories from the command line, in beta and requiring access."

### Sources

- [Codex Security: now in research preview](https://openai.com/index/codex-security-now-in-research-preview/)
- [Codex Security Help](https://help.openai.com/en/articles/20001107-codex-security)
- [Introducing the open-source Codex Security CLI](https://community.openai.com/t/introducing-the-open-source-codex-security-cli/1388319)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Added open-source Codex Security CLI (npm install @openai/codex-security, beta, requires access), launched 2026-07-29; terminal row ❌ → ✅, Linux row ❌ → ⚠️ |
| 2026-08-15T12:00Z | [Verified] Removed contradictory Team row (Team ❌ alongside Business ✅ for the same renamed plan); Business row reordered |
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-03-14T12:00Z | Initial entry |
| 2026-03-06T12:00Z | Research preview launched for Pro/Enterprise/Business/Edu |

---

## Custom GPTs + Actions

| Property | Value |
|----------|-------|
| Category | integrations |
| Status | ga |
| Gating | paid |
| URL | https://chatgpt.com/gpts |
| Launched | 2023-11-06T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Use only | Can use public GPTs, cannot create |
| Go | ⚠️ | Use only | Can use public GPTs, cannot create |
| Plus | ✅ | Create & use | Full access to GPT Builder + Actions |
| Pro | ✅ | Create & use | Full access |
| Business | ✅ | Create & share | Private GPTs for team |
| Enterprise | ✅ | Create & share | Private GPTs + admin controls |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ✅ | OpenAI API |

### Regional

Available globally where ChatGPT is available.

### Talking Point

> "Custom GPTs let you create specialized AI assistants with custom instructions, knowledge files, and **Actions for external API integrations**. Actions replaced the old plugin system in April 2024. **Anyone can use public GPTs**, but creating your own with Actions requires Plus ($20/mo) or higher."

### Sources

- [Creating a GPT](https://help.openai.com/en/articles/8554397-creating-a-gpt)
- [GPT Actions Documentation](https://platform.openai.com/docs/actions)
- [GPT Store](https://chatgpt.com/gpts)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2024-04-09T12:00Z | Plugins deprecated, replaced by Actions |
| 2023-11-06T12:00Z | Initial entry |

---

## DALL-E Image Generation

| Property | Value |
|----------|-------|
| Category | image-gen |
| Status | deprecated |
| Gating | paid |
| URL | https://openai.com/index/dall-e-3/ |
| Launched | 2023-10-01T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | ~2/day | Very limited; now uses ChatGPT Images 2.5 |
| Go | ✅ | 10x free | Standard access; now uses ChatGPT Images 2.5 |
| Plus | ✅ | 50x free | Priority; now uses ChatGPT Images 2.5 |
| Pro | ✅ | Unlimited | No limits; now uses ChatGPT Images 2.5 |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ |  |
| macOS | ✅ |  |
| Linux | ❌ |  |
| iOS | ✅ |  |
| Android | ✅ |  |
| Chrome | ❌ |  |
| web | ✅ |  |
| terminal | ❌ |  |
| API | ✅ | OpenAI API (DALL-E 3 API deprecated May 12, 2026; migrate to gpt-image-1) |

### Regional

Available globally.

### Talking Point

> "ChatGPT image generation now uses **ChatGPT Images 2.5** (rolled out September 8, 2026 across desktop, mobile, and web), which replaced the earlier GPT Image 1.5 default. Available on **all plans including free** with tiered limits. The DALL-E 3 API is **deprecated May 12, 2026**—developers should migrate to `gpt-image-2`, `gpt-image-1`, or `gpt-image-1-mini`. Note: `gpt-image-1` and `gpt-image-1.5` are themselves now slated for API retirement (Oct 23, 2026 and Dec 1, 2026 respectively), in favor of `gpt-image-2.5-sunburst`/`gpt-image-2.5-flare`."

### Sources

- [ChatGPT Pricing](https://chatgpt.com/pricing)
- [OpenAI API Deprecations](https://developers.openai.com/api/docs/deprecations)
- [Introducing ChatGPT Images 2.5](https://community.openai.com/t/introducing-gpt-images-2-5-in-the-api-and-chatgpt/1395897)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] ChatGPT's image generation moved from GPT Image 1.5 to **ChatGPT Images 2.5** (rolled out 2026-09-08 to all ChatGPT/ChatGPT Work/Codex users); availability notes and talking point updated; noted gpt-image-1 (retires 2026-10-23) and gpt-image-1.5 (retires 2026-12-01) are themselves being superseded by gpt-image-2.5-sunburst/flare per OpenAI's deprecations page |
| 2026-04-08T12:00Z | [Verified] DALL-E 3 replaced by GPT Image 1.5 in ChatGPT (March 2025); DALL-E 3 API deprecated May 12, 2026; status changed to deprecated |
| 2023-10-01T12:00Z | Initial entry |

---

## Deep Research

| Property | Value |
|----------|-------|
| Category | research |
| Status | ga |
| Gating | free |
| URL | https://help.openai.com/en/articles/11011518-chatgpt-deep-research |
| Launched | 2025-02-03T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | 5/month | Lightweight only (o4-mini) |
| Go | ⚠️ | 5/month | Lightweight only (o4-mini) |
| Plus | ✅ | 10+15 lightweight/month | Full + lightweight research |
| Pro | ✅ | 125+125 lightweight/month | Full + lightweight research |
| Business | ✅ | 10+15 lightweight/month | Full + lightweight research |
| Enterprise | ✅ | Custom | Configurable limits |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ |  |
| macOS | ✅ |  |
| Linux | ❌ |  |
| iOS | ✅ |  |
| Android | ✅ |  |
| Chrome | ❌ |  |
| web | ✅ |  |
| terminal | ❌ |  |
| API | ✅ | OpenAI API |

### Regional

Available globally.

### Talking Point

> "Deep Research lets ChatGPT spend minutes researching a topic thoroughly. **Now available on all plans including free**—free users get 5 lightweight queries/month (powered by o4-mini). Plus gets 10 full + 15 lightweight per month; Pro gets 125 + 125."

### Sources

- [Deep Research Help](https://help.openai.com/en/articles/11011518-chatgpt-deep-research)
- [Deep Research API Guide](https://developers.openai.com/api/docs/guides/deep-research)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-02-28T12:00Z | [Verified] Free tier access added (5 lightweight queries/month via o4-mini); Plus/Pro limits updated to include lightweight queries; Team/Enterprise rows added |
| 2025-02-03T12:00Z | Initial entry |

---

## Memory

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | free |
| URL | https://openai.com/index/memory-and-new-controls-for-chatgpt/ |
| Launched | 2024-09-05T12:00Z |
| Verified | 2026-08-15|
| Checked | 2026-09-04|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Limited | Saved memories only |
| Go | ✅ | Standard | Full chat history reference |
| Plus | ✅ | Full | Full memory + chat history |
| Pro | ✅ | Full | Full memory + chat history |
| Business | ✅ | Full | Admin controls |
| Enterprise | ✅ | Full | Admin controls, no training |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ❌ | Not available via API |

### Regional

Available globally; off by default in EEA/UK/Switzerland (must enable manually).

### Talking Point

> "Memory lets ChatGPT remember your preferences and context across conversations. **All plans get saved memories**; Plus/Pro also get full chat history reference for richer personalization."

### Sources

- [Memory and new controls for ChatGPT](https://openai.com/index/memory-and-new-controls-for-chatgpt/)
- [Memory FAQ](https://help.openai.com/en/articles/8590148-memory-faq)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2025-06-03T12:00Z | Memory improvements for free users |
| 2025-04-10T12:00Z | Enhanced memory for Plus/Pro |
| 2024-09-05T12:00Z | Initial entry |

---

## Projects

| Property | Value |
|----------|-------|
| Category | local-files |
| Status | ga |
| Gating | free |
| URL | https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt |
| Launched | 2024-12-13T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Full access |
| Go | ✅ | Standard | Full access |
| Plus | ✅ | Standard | Full access |
| Pro | ✅ | Standard | Full access |
| Business | ✅ | Standard | Shared projects |
| Enterprise | ✅ | Standard | Admin controls |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ⚠️ | Compliance API only |

### Regional

Available globally where ChatGPT is available.

### Talking Point

> "Projects let you group related chats, files, and custom instructions into workspaces. **Available on all plans including free**—organize your work across topics with project-specific context."

### Sources

- [Using Projects in ChatGPT](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)
- [Projects and Chats Docs](https://learn.chatgpt.com/docs/projects)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2024-12-13T12:00Z | Initial entry |

---

## Sora (Video Generation)

| Property | Value |
|----------|-------|
| Category | video-gen |
| Status | ga |
| Gating | paid |
| URL | https://openai.com/index/sora-is-here/ |
| Launched | 2024-12-09T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Discontinued Jan 2026 |
| Go | ❌ | — | Not available |
| Plus | ✅ | 1000 credits/mo | ~50 videos at 480p |
| Pro | ✅ | 10000 credits/mo | Unlimited relaxed mode |
| Business | ⚠️ | Limited | Consumer ToS applies |
| Enterprise | ❌ | — | Business version in development |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Via sora.com |
| macOS | ✅ | Via sora.com |
| Linux | ❌ |  |
| iOS | ✅ | Select regions |
| Android | ✅ | Select regions |
| Chrome | ❌ |  |
| web | ✅ | sora.com |
| terminal | ❌ |  |
| API | ❌ | Sora 2 models and Videos API were shut down 2026-09-24; no replacement API available |

### Regional

Available in US, Canada, Japan, Korea, Thailand, Vietnam, Taiwan. Not available in UK, EU, Australia.

### Talking Point

> "Sora generates videos from text prompts—up to 25 seconds at 1080p. **Requires Plus ($20/mo) or Pro ($200/mo)**. Plus gets 1,000 credits/month (~50 short videos); Pro gets 10,000 credits plus unlimited relaxed-mode generations. Not available in Europe."

### Sources

- [Sora is here](https://openai.com/index/sora-is-here/)
- [Sora Billing FAQ](https://help.openai.com/en/articles/10245774-sora-billing-faq)
- [Video Generation API Guide (deprecation notice)](https://developers.openai.com/api/docs/guides/video-generation)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] API row corrected: the Sora 2 models and Videos API were shut down 2026-09-24 with no one-to-one replacement API; API availability ✅ → ❌ |
| 2026-09-04T06:00Z | [Verified] platform: no longer available on Windows |
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-01-10T12:00Z | Free tier access discontinued |
| 2025-10-01T12:00Z | API access launched |
| 2024-12-09T12:00Z | Initial entry

---

## Vision (Image Understanding)

| Property | Value |
|----------|-------|
| Category | vision |
| Status | ga |
| Gating | free |
| URL | https://openai.com/index/hello-gpt-4o/ |
| Launched | 2024-05-13T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Subject to message rate limits |
| Go | ✅ | Standard | Full access |
| Plus | ✅ | Higher | Priority |
| Pro | ✅ | Unlimited | Maximum quality |
| Business | ✅ | Full | Full access |
| Enterprise | ✅ | Full | Full access |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ❌ | No official app |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | chatgpt.com |
| terminal | ❌ |  |
| API | ✅ | OpenAI API (gpt-4o vision) |

### Regional

Available globally where ChatGPT is available.

### Talking Point

> "GPT-4o understands images natively—upload a photo, screenshot, chart, or diagram and ChatGPT will analyze it. **Available on all plans including free**, subject to your plan's message quota. Works across web, desktop, iOS, and Android. Also accessible via the OpenAI API using the `gpt-4o` model."

### Sources

- [Hello GPT-4o](https://openai.com/index/hello-gpt-4o/)
- [ChatGPT Pricing](https://chatgpt.com/pricing)
- [Images and Vision API Guide](https://developers.openai.com/api/docs/guides/images)

### Changelog

| Date | Change |
|------|--------|
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-03-07T12:00Z | Initial entry |
| 2024-05-13T12:00Z | GPT-4o launched with native image understanding |

---

## Chat

| Property | Value |
|----------|-------|
| Category | other |
| Status   | ga |
| Gating   | free |
| URL      | https://chatgpt.com |
| Launched | 2022-11-30T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Rate-limited | GPT-5.5 Mini, transitioning to GPT-6 Luna (rolling out in desktop app from 2026-09-22); ~10 msgs/5 hrs then fallback |
| Go | ✅ | Higher | GPT-5.5 Mini, transitioning to GPT-6 Luna; 10× free limits |
| Plus | ✅ | Higher | GPT-5.5 Thinking + Mini, transitioning to GPT-6 Sol (rolling out from 2026-09-22); 5× Go limits |
| Pro | ✅ | Unlimited | GPT-6 Astra (rolled out 2026-09-04) plus GPT-6 Sol/GPT-5.5 Pro; no rate caps; 1M+ context |
| Business | ✅ | Full | Plus features + workspace admin |
| Enterprise | ✅ | Custom | SSO, advanced security |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows  | ✅ | Desktop app (Microsoft Store) |
| macOS    | ✅ | Desktop app |
| Linux    | ❌ | No official app; web works in browser |
| iOS      | ✅ | ChatGPT iOS app |
| Android  | ✅ | ChatGPT Android app |
| Chrome   | ❌ | |
| web      | ✅ | chatgpt.com |
| terminal | ❌ | |
| API      | ✅ | OpenAI API (GPT-5.4, Mini, Nano; 1M context) |

### Regional

Available globally where ChatGPT is permitted. Some advanced features may be US-only.

### Talking Point

> "ChatGPT's core text conversation is **available on all plans including free** at chatgpt.com, with apps for iOS, Android, Windows, and macOS. The model lineup has moved on twice since GPT-5.4 (March 2026): GPT-5.5 became the default generation, and **GPT-5.5 itself is scheduled to retire from ChatGPT, ChatGPT Work, and Codex on all plans on October 14, 2026**. OpenAI is actively rolling out its replacement now—**GPT-6 Sol** for Plus/Pro/Business/Enterprise/Edu and **GPT-6 Luna** for Free/Go (from September 22, 2026)—on top of **GPT-6 Astra**, OpenAI's most capable model, which reached Pro/Enterprise/Business-Premium plans and the API on September 4, 2026."

### Sources

- [ChatGPT](https://chatgpt.com)
- [ChatGPT Pricing](https://chatgpt.com/pricing)
- [Introducing GPT-5.4](https://openai.com/index/introducing-gpt-5-4/)
- [Introducing GPT-5.4 Mini and Nano](https://openai.com/index/introducing-gpt-5-4-mini-and-nano/)
- [OpenAI Developer Community: GPT-5.4 Mini and Nano](https://community.openai.com/t/introducing-gpt-5-4-mini-and-nano-our-most-capable-small-models-yet/1377015)
- [Models docs: GPT-5.5 retirement notice](https://learn.chatgpt.com/docs/models)
- [Introducing GPT-6-Astra](https://community.openai.com/t/introducing-gpt-6-astra-the-most-intelligent-and-aligned-model-in-the-world/1394703)
- [Announcing GPT-6 Sol and GPT-6 Luna in the API, Codex and ChatGPT](https://community.openai.com/t/announcing-gpt-6-sol-and-gpt-6-luna-in-the-api-codex-and-chatgpt/1399925)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Model lineup corrected: file was still describing GPT-5.4 (Mar 2026) as current, but ChatGPT had since moved to GPT-5.5 and is now transitioning to GPT-6 (Astra rolled out 2026-09-04 to Pro/Enterprise/Business-Premium + API; Sol and Luna rolling out 2026-09-22 to Plus/Pro/Business/Enterprise/Edu and Free/Go respectively). GPT-5.5 is scheduled to retire from ChatGPT/ChatGPT Work/Codex on all plans 2026-10-14. Availability table and talking point updated; exact per-plan GPT-6 rollout status may still be in progress from one verification to the next |
| 2026-08-15T12:00Z | [Verified] Plan renamed Team → Business (OpenAI help-center rename FAQ, effective 2025-08-29) |
| 2026-03-21T12:00Z | [Verified] GPT-5.4 Mini and Nano released: Mini available in ChatGPT (Free/Go via Thinking menu), API, and Codex; Nano is API-only; Mini $0.75/$4.50 per 1M tokens, Nano $0.20/$1.25 per 1M tokens; 400K context; vision support |
| 2026-03-14T12:00Z | [Verified] GPT-5.4 family released: Plus gets GPT-5.4 Thinking, Pro gets GPT-5.4 Pro; GPT-5.2 Thinking moved to Legacy Models (90-day retirement); 1M context in API; native computer use tool |
| 2026-03-07T12:00Z | Initial entry |
| 2022-11-30T12:00Z | ChatGPT launched publicly |
