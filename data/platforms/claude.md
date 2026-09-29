---
name: Claude
vendor: Anthropic
logo: https://cdn.simpleicons.org/anthropic
status_page: https://status.anthropic.com
pricing_page: https://claude.ai/pricing
last_verified: 2026-09-28
---

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Claude Sonnet 5.5, usage caps |
| Pro | $20/mo ($17/mo billed annually) | 5x Free usage, Opus access |
| Max 5x | $100/mo | 5x Pro usage |
| Max 20x | $200/mo | 20x Pro usage, highest limits |
| Team | Standard seat $25/mo ($20/mo annual); Premium seat $125/mo ($100/mo annual, 5x Standard usage) | Pro features + collaboration |
| Enterprise | From $20/seat/mo + usage at API rates (self-serve), or custom (sales-assisted) | SSO, advanced security |

---

## Artifacts

| Property | Value |
|----------|-------|
| Category | local-files |
| Status | ga |
| Gating | free |
| URL | https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them |
| Launched | 2024-06-20T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Create artifacts in chat; no Design/Slides/Docs templates |
| Pro | ✅ | Standard | Full access incl. Design/Slides/Docs templates (beta), on by default |
| Max 5x | ✅ | Standard | Full access incl. Design/Slides/Docs templates (beta), on by default |
| Max 20x | ✅ | Standard | Full access incl. Design/Slides/Docs templates (beta), on by default |
| Team | ✅ | Standard | Full access incl. templates (beta), on by default |
| Enterprise | ✅ | Custom | Full access; templates (beta) off by default until an owner enables them |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ✅ | Desktop app |
| iOS | ✅ | Mobile app (view/ask; templates need web or desktop) |
| Android | ✅ | Mobile app (view/ask; templates need web or desktop) |
| Chrome | ❌ |  |
| web | ✅ | Best experience |
| terminal | ✅ | Via Claude Code — publish session output as an artifact, or make Design/Docs |
| API | ❌ | Web/app feature only |

### Regional

Available globally.

### Talking Point

> "Artifacts are Claude's way of creating standalone content—a design, a deck, a document, a dashboard, a small interactive tool—in a separate panel. **Available on Free, Pro, Max, Team, and Enterprise**, and in Claude Code on any plan that includes it. Paid plans also get beta templates—**Claude Design, Claude Slides, and Claude Docs**—for polished, shareable output; on Enterprise these are off until an owner turns them on. Artifacts made before September 16, 2026 are 'legacy' artifacts and keep working, but new ones use the current experience."

### Sources

- [What are artifacts and how do I use them?](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] URL updated (article renumbered to 17153992); added missing Team/Enterprise rows to Availability; added Design/Slides/Docs templates (beta, paid plans, off by default on Enterprise); Claude Code (terminal) corrected from unavailable to available — can publish session output as an artifact or make Design/Docs; talking point rewritten to match |
| 2026-03-07T12:00Z | [Verified] Gating corrected from paid to free — free users have full access; data was internally inconsistent |
| 2024-06-20T12:00Z | Initial entry |

---

## Claude Code

| Property | Value |
|----------|-------|
| Category | coding |
| Status | ga |
| Gating | paid |
| URL | https://code.claude.com/docs/en/features-overview |
| Launched | 2025-02-24T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Pro | ✅ | Usage-based | Standard limits |
| Max 5x | ✅ | Higher | Extended limits |
| Max 20x | ✅ | Highest | Extended limits |
| Team | ✅ | Usage-based | |
| Enterprise | ✅ | Custom | |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Terminal + VS Code extension + JetBrains IDEs |
| macOS | ✅ | Terminal + VS Code extension + JetBrains IDEs + Xcode (via Agent SDK) |
| Linux | ✅ | Terminal + VS Code extension + JetBrains IDEs |
| iOS | ✅ | Claude mobile app — start, monitor, and steer cloud sessions; Remote Control for local sessions |
| Android | ✅ | Claude mobile app — start, monitor, and steer cloud sessions; Remote Control for local sessions |
| Chrome | ✅ | Chrome extension gives browser automation from the CLI/VS Code (Pro, Max, Team, Enterprise) |
| web | ✅ | Claude Code on the web at claude.ai/code — cloud sessions from the browser |
| terminal | ✅ | Primary interface |
| API | ✅ | Anthropic API |

### Regional

Available globally via CLI, VS Code, JetBrains, browser (claude.ai/code), and mobile apps.

### Talking Point

> "Claude Code is Anthropic's agentic coding tool. It requires **Pro subscription at minimum—that's $20/month**. Available as a terminal CLI, a **native VS Code extension**, and a **native JetBrains plugin** (IntelliJ IDEA, PyCharm, Android Studio, WebStorm, PhpStorm, GoLand), plus Xcode integration via the Claude Agent SDK. It also now runs **in the browser at claude.ai/code** ('Claude Code on the web'), and the **Claude mobile app** (iOS/Android) lets you start, monitor, and steer cloud sessions or use Remote Control on a local session. A **Chrome extension** adds browser automation (reading console/DOM, testing, form-filling) to coding tasks on any paid plan."

### Sources

- [Claude Code Documentation](https://code.claude.com/docs/en/features-overview)
- [Claude Code on JetBrains IDEs](https://code.claude.com/docs/en/jetbrains)
- [Claude Code on mobile](https://code.claude.com/docs/en/mobile)
- [Claude Code Chrome extension](https://code.claude.com/docs/en/chrome)
- [Apple Xcode + Claude Agent SDK](https://www.anthropic.com/news/apple-xcode-claude-agent-sdk)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Major platform expansion confirmed via code.claude.com docs: native JetBrains IDE plugin added (talking point previously said none existed); Claude Code on the web (claude.ai/code) added; Claude mobile app (iOS/Android) added for monitoring/steering cloud sessions and Remote Control; Chrome extension (browser automation, paid plans) added. Dropped stale claudelog.com VS Code source (unofficial) |
| 2026-02-17T12:00Z | [Verified] VS Code extension (out of beta) added to platforms; Xcode via Agent SDK noted; URL updated to code.claude.com; talking point updated |
| 2025-02-24T12:00Z | Initial entry |

---

## Connectors

| Property | Value |
|----------|-------|
| Category | integrations |
| Status | ga |
| Gating | free |
| URL | https://claude.ai/directory |
| Launched | 2025-05-01T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Web connectors full; custom connectors (remote MCP) limited to 1 |
| Pro | ✅ | Full | All remote connectors |
| Max 5x | ✅ | Full | All remote connectors |
| Max 20x | ✅ | Full | All remote connectors |
| Team | ✅ | Full | Shared connectors; owner must enable org-wide first |
| Enterprise | ✅ | Full | Google Drive Cataloging exclusive; owner must enable org-wide first |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ✅ | Desktop app |
| iOS | ⚠️ | Full use; installing new connectors is in beta (desktop/web still primary for setup) |
| Android | ⚠️ | Full use; installing new connectors is in beta (desktop/web still primary for setup) |
| Chrome | ❌ |  |
| web | ✅ | claude.ai |
| terminal | ✅ | Via Claude Code |
| API | ✅ | MCP Connector |

### Regional

Available globally where Claude is available.

### Talking Point

> "Connectors let Claude access your apps and services—Google Drive, Notion, Slack, and more—browsable in the Connectors Directory. **Free on all plans**, including remote MCP connectors (Free is capped at 1 custom connector). Custom connectors via remote MCP server URLs are available on Claude, Cowork, and Claude Desktop. Browse available connectors at claude.ai/directory."

### Sources

- [Use connectors to extend Claude's capabilities](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)
- [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [Connectors Directory](https://claude.ai/directory)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Old "Setting Up Integrations" source (support.anthropic.com/.../10168395) is dead (301 to support.claude.com, then 404); replaced with current "Use connectors to extend Claude's capabilities" and "custom connectors using remote MCP" articles. Corrected Free-plan notes: custom connectors (remote MCP) are capped at 1 on Free, not unlimited/"full". Mobile (iOS/Android) can now install connectors directly (beta), not desktop-setup-only. Dropped unverifiable "75+ services" and "Deep Connectors" branding not found in current sources |
| 2026-04-08T12:00Z | [Verified] Gating changed from paid to free — Free plan now has full remote MCP connector access (not just desktop extensions + GitHub) |
| 2026-03-21T12:00Z | [Verified] Deep Connectors added (Google Drive, Gmail, DocuSign, FactSet); plugin marketplace launched; custom MCP connectors on paid plans |
| 2026-03-04T12:00Z | [Verified] Fixed broken URL: support.claude.com → support.anthropic.com |
| 2025-07-14T12:00Z | Connectors Directory launched |
| 2025-06-03T12:00Z | Expanded to Pro plan |
| 2025-05-01T12:00Z | Initial entry |

---

## Cowork Mode

| Property | Value |
|----------|-------|
| Category | agents |
| Status | preview |
| Gating | paid |
| URL | https://support.claude.com/en/articles/13345190-getting-started-with-cowork |
| Launched | 2026-01-12T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Pro | ✅ | Standard | Web/mobile GA; Chrome side panel rolling out |
| Max 5x | ✅ | Subject to Max limits | Full access incl. Chrome side panel |
| Max 20x | ✅ | Subject to Max limits | Full access incl. Chrome side panel |
| Team | ✅ | Standard | Full access incl. Chrome side panel; web session use still beta |
| Enterprise | ✅ | Custom | Available where an admin has enabled it |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Claude Desktop app (latest version required) |
| macOS | ✅ | Claude Desktop app |
| Linux | ❌ |  |
| iOS | ✅ | Claude mobile app (Pro/Max/Team; Enterprise where admin-enabled) |
| Android | ✅ | Claude mobile app (Pro/Max/Team; Enterprise where admin-enabled) |
| Chrome | ⚠️ | Side panel: Max/Team now, rolling out to Pro |
| web | ✅ | claude.ai — Pro, Max, Team; Enterprise where admin-enabled |
| terminal | ❌ |  |
| API | ❌ | Desktop/web/mobile feature only |

### Regional

Available globally where Claude is available, on web, desktop, and mobile (no longer desktop-only).

### Talking Point

> "Cowork brings Claude Code's agentic capabilities to knowledge work beyond coding—it launched January 2026 and expanded to all paid plans in February. It's now available on **web, Claude Desktop (macOS/Windows), and the Claude mobile apps**, not just desktop, with the Chrome side panel rolling out from Max/Team to Pro. As of September 2026, Anthropic is **merging Cowork and chat into a single 'Claude' experience** ('Claude Cowork and chat are one Claude'), rolling out gradually starting with Pro and Max: there's no more mode to pick—any conversation can hand off a task the way Cowork used to."

### Sources

- [Get started with Claude Cowork](https://support.claude.com/en/articles/13345190-getting-started-with-cowork)
- [Claude Cowork and chat are one Claude](https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude)
- [Use Claude Cowork on Team and Enterprise plans](https://support.claude.com/en/articles/13455879-use-claude-cowork-on-team-and-enterprise-plans)
- [TechCrunch Coverage](https://techcrunch.com/2026/01/12/anthropics-new-cowork-tool-offers-claude-code-without-the-code/)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Major platform expansion per current "Get started with Claude Cowork" article: web (claude.ai), Claude Mobile (iOS/Android), and Chrome side panel added — no longer desktop-only; Windows arm64/x64 restriction no longer documented, dropped. Added new "Claude Cowork and chat are one Claude" source: Anthropic is merging Cowork and chat into one experience, rolling out gradually to Pro/Max first; talking point and Regional updated to reflect this |
| 2026-02-17T12:00Z | [Verified] Expanded to all paid plans (Pro, Team, Enterprise); Windows x64 support added |
| 2026-01-12T12:00Z | Initial entry |

---

## Extended Thinking

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | free |
| URL | https://platform.claude.com/docs/en/docs/build-with-claude/extended-thinking |
| Launched | 2025-02-24T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Limited | Available with usage restrictions |
| Pro | ✅ | Full | Full access, no restrictions |
| Max 5x | ✅ | Full | Adaptive thinking with effort levels |
| Max 20x | ✅ | Full | Adaptive thinking with effort levels |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ |  |
| macOS | ✅ |  |
| Linux | ✅ |  |
| iOS | ✅ |  |
| Android | ✅ |  |
| Chrome | ❌ |  |
| web | ✅ |  |
| terminal | ❌ |  |
| API | ✅ | Anthropic API |

### Regional

Available globally.

### Talking Point

> "Extended Thinking lets Claude reason through complex problems step-by-step. As of the **Claude 5.5 family** (Sonnet 5.5, Opus 5.5, Fable 5.1), thinking **cannot be turned off**—it's always on, at every effort level. Effort now has **five levels: low/medium/high/xhigh/max**, with 'Extra high' (xhigh) added for long-running coding and agentic tasks on Opus 4.7 and newer. Older models (Sonnet 4.6, Opus 4.6, Opus 4.7, Sonnet 5, Fable 5) still let you toggle thinking manually. **Available on all plans including free** (with usage limits); Pro and above get full unrestricted access."

### Sources

- [Extended Thinking Documentation](https://platform.claude.com/docs/en/docs/build-with-claude/extended-thinking)
- [Change the model, effort, and thinking settings](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)
- [Introducing Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)
- [Introducing Claude Sonnet 5.5](https://www.anthropic.com/claude-sonnet-5-5)
- [Claude Opus 4.6 Announcement](https://www.anthropic.com/news/claude-opus-4-6)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Model lineup and effort levels are far out of date: current flagship models are Sonnet 5.5 / Opus 5.5 / Fable 5.1 (not Opus 4.6), thinking is now mandatory (cannot be disabled) on Sonnet 5.5, Opus 5.5, Fable 5.1, and Opus 5, and a fifth effort level "Extra high" (xhigh) exists between high and max on Opus 4.7 and newer. Talking point rewritten per support.claude.com's model/effort/thinking settings article; added Opus 5.5 and Sonnet 5.5 announcement sources |
| 2026-04-08T12:00Z | [Verified] Gating changed from paid to free — Free plan now has limited Extended Thinking access; Pro upgraded from limited to full access |
| 2026-02-17T12:00Z | [Verified] Adaptive thinking introduced with Opus 4.6; effort levels (low/medium/high/max) added; manual mode deprecated on Opus 4.6; URL updated to platform.claude.com |
| 2025-02-24T12:00Z | Initial entry |

---

## MCP (Model Context Protocol)

| Property | Value |
|----------|-------|
| Category | integrations |
| Status | ga |
| Gating | free |
| URL | https://www.anthropic.com/news/model-context-protocol |
| Launched | 2024-11-25T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Full access |
| Pro | ✅ | Standard | Full access |
| Max 5x | ✅ | Standard | Full access |
| Max 20x | ✅ | Standard | Full access |
| Team | ✅ | Standard | Full access |
| Enterprise | ✅ | Custom | Advanced deployment options |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Claude Desktop app |
| macOS | ✅ | Claude Desktop app |
| Linux | ✅ | Claude Desktop app |
| iOS | ❌ | Desktop only |
| Android | ❌ | Desktop only |
| Chrome | ❌ |  |
| web | ❌ | Desktop app only |
| terminal | ✅ | Via Claude Code |
| API | ✅ | Anthropic API |

### Regional

Available globally where Claude is available.

### Talking Point

> "MCP is an open standard for connecting Claude to external tools and data sources—databases, file systems, APIs. **Available on all plans including free** via the Claude Desktop app."

### Sources

- [Introducing Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [MCP Documentation](https://docs.claude.com/en/docs/mcp)

### Changelog

| Date | Change |
|------|--------|
| 2024-11-25T12:00Z | Initial entry |

---

## Projects

| Property | Value |
|----------|-------|
| Category | local-files |
| Status | ga |
| Gating | free |
| URL | https://support.claude.com/en/articles/9517075-what-are-projects |
| Launched | 2024-06-25T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Up to 5 projects | Added Feb 2026 |
| Pro | ✅ | Standard | RAG auto-scales knowledge up to 10x when it nears context limits |
| Max 5x | ✅ | Extended | RAG auto-scales knowledge up to 10x when it nears context limits |
| Max 20x | ✅ | Extended | RAG auto-scales knowledge up to 10x when it nears context limits |
| Team | ✅ | Standard | Shared projects; RAG auto-scaling |
| Enterprise | ✅ | Custom | SSO, admin controls; RAG auto-scaling |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ✅ | Desktop app |
| iOS | ⚠️ | View only |
| Android | ⚠️ | View only |
| Chrome | ❌ |  |
| web | ✅ | claude.ai |
| terminal | ❌ |  |
| API | ✅ | Anthropic API |

### Regional

Available globally.

### Talking Point

> "Projects let you organize conversations and documents into workspaces with persistent context. **Available on all plans including free** as of February 2026 (Free is capped at 5 projects). On **paid plans**, project knowledge automatically scales through Retrieval-Augmented Generation (RAG), expanding capacity up to **10x** as content approaches context limits. A **new version of projects (beta)** is now rolling out too, starting with Claude Code: a project becomes one conversation that Claude splits into parallel cloud threads."

### Sources

- [What are projects?](https://support.claude.com/en/articles/9517075-what-are-projects)
- [Retrieval augmented generation (RAG) for projects](https://support.claude.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] URL updated to support.claude.com (support.anthropic.com 301s there); Free plan limit clarified as capped at 5 projects (was listed as unqualified "Standard/Full access"); added "Enhanced project knowledge with RAG" — paid plans (Pro/Max/Team/Enterprise) auto-scale project knowledge up to 10x near context limits; talking point updated; noted (not added as a claim) a new beta "Projects" experience rolling out via Claude Code |
| 2026-03-23T12:00Z | [Verified] Added missing Enterprise row to availability table (SSO, admin controls, custom limits) |
| 2026-02-28T12:00Z | [Verified] Free tier access added as part of Anthropic's February 2026 free tier expansion; gating changed from paid to free |
| 2024-06-25T12:00Z | Initial entry |

---

## Skills

| Property | Value |
|----------|-------|
| Category | agents |
| Status | ga |
| Gating | free |
| URL | https://support.claude.com/en/articles/12512198-how-to-create-custom-skills |
| Launched | 2025-10-16T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Prebuilt and custom skills both available (code execution must be enabled); skill recording (record-yourself creation) is Pro/Max/Team only |
| Pro | ✅ | Standard | Full access, incl. skill recording (Claude for Mac) |
| Max 5x | ✅ | Extended | Full access, incl. skill recording (Claude for Mac) |
| Max 20x | ✅ | Extended | Full access, incl. skill recording (Claude for Mac) |
| Team | ✅ | Standard | Shared skills, incl. skill recording (Claude for Mac) |
| Enterprise | ✅ | Custom | Skill recording not available |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ✅ | Desktop app |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | claude.ai |
| terminal | ✅ | Via Claude Code |
| API | ✅ | Anthropic API |

### Regional

Available globally where Claude is available.

### Talking Point

> "Skills are modular folders of instructions and resources that Claude can load on demand to perform specialized tasks—like creating Office documents or running workflows. As of a July 2026 update, **both prebuilt and custom skills are available on Free, Pro, Max, Team, and Enterprise plans** (custom skills need Cloud code execution turned on). The one piece still gated to paid plans is **recording a skill**—showing Claude a screen recording of a task so it drafts the skill for you—available on Pro, Max, and Team in Cowork on Claude for Mac only."

### Notes

**Prebuilt vs Custom Skills:**
- **Prebuilt Skills**: Created and maintained by Anthropic (Excel, Word, PowerPoint, PDF creation). Activate automatically when relevant. Available on all plans including free.
- **Custom Skills**: User- or organization-created skills. Available on Free, Pro, Max, Team, and Enterprise (requires code execution enabled); Team/Enterprise can provision org-wide. Skill *recording* (build a skill from a screen recording) is Pro/Max/Team only, on Claude for Mac.

### Sources

- [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Agent Skills overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Introducing Skills](https://www.anthropic.com/news/skills)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Gating changed from paid to free — "How to create custom skills" (support.claude.com, dated July 22, 2026) now states plainly "Skills are available for users on Free, Pro, Max, Team, and Enterprise plans," contradicting the prior "custom skills require Pro and above" claim; only the newer "record a skill" video-capture creation flow remains Pro/Max/Team-only (Claude for Mac). Old docs.anthropic.com/en/docs/skills source 404s after redirect; replaced with current docs.claude.com Agent Skills overview and the how-to article |
| 2026-03-07T12:00Z | [Verified] Free tier now includes prebuilt skills (confirmed in Sonnet 4.6 announcement); talking point corrected to match availability table |
| 2025-10-16T12:00Z | Initial entry |

---

## Vision (Image Understanding)

| Property | Value |
|----------|-------|
| Category | vision |
| Status | ga |
| Gating | free |
| URL | https://platform.claude.com/docs/en/docs/build-with-claude/vision |
| Launched | 2024-03-04T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Full access |
| Pro | ✅ | Standard | Full access |
| Max 5x | ✅ | Standard | Full access |
| Max 20x | ✅ | Standard | Full access |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Drag and drop |
| macOS | ✅ | Drag and drop |
| Linux | ✅ | Drag and drop |
| iOS | ✅ | Camera + gallery |
| Android | ✅ | Camera + gallery |
| Chrome | ❌ |  |
| web | ✅ | Upload images |
| terminal | ❌ |  |
| API | ✅ | Anthropic API |

### Regional

Available globally.

### Talking Point

> "Claude can analyze images you upload—documents, screenshots, diagrams. **Available on all plans including free.**"

### Sources

- [Vision Documentation](https://platform.claude.com/docs/en/docs/build-with-claude/vision)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] URL updated — docs.anthropic.com now 301s to platform.claude.com; content re-confirmed, no claims changed |
| 2026-03-15T12:00Z | [Verified] Corrected gating from paid to free — availability table and external sources confirm free-tier access |
| 2024-03-04T12:00Z | Initial entry |

---

## Memory

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | free |
| URL | https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context |
| Launched | 2025-10-01T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Free on all plans since March 2026 |
| Pro | ✅ | Standard | Full access |
| Max 5x | ✅ | Standard | Full access |
| Max 20x | ✅ | Standard | Full access |
| Team | ✅ | Standard | Full access |
| Enterprise | ✅ | Custom | Admin controls |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Desktop app |
| macOS | ✅ | Desktop app |
| Linux | ✅ | Desktop app |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |
| Chrome | ❌ |  |
| web | ✅ | claude.ai |
| terminal | ❌ |  |
| API | ✅ | Memory Tool (type: memory_20250818) for developers |

### Regional

Available globally where Claude is available. May be off by default in some regions (opt-in).

### Talking Point

> "Memory lets Claude remember your preferences and context across conversations—corrections, working style, recurring topics. **Free on Free, Pro, and Max** by default (Team/Enterprise: off by default, owner-enabled). Memory is shared between chat and Claude Cowork when Cowork runs in the cloud. A related but separate capability, **searching your past chats** with Claude (RAG-based), requires Pro, Max, Team, or Enterprise. Enable/manage both in Settings → Memory. You can also import memories from other AI tools using the memory import tool."

### Sources

- [Use Claude's chat search and memory to build on previous context](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [Import and export your memory from Claude](https://support.claude.com/en/articles/12123587-import-and-export-your-memory-from-claude)
- [API Memory Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Source article renamed/merged: "How does memory work" (support.anthropic.com/.../10166267) now 404s; current article is "Use Claude's chat search and memory to build on previous context," which bundles memory with a new, related but distinct **paid-only** "search past chats" (RAG) capability not available on Free. Memory's own gating (free on Free/Pro/Max, owner-enabled on Team/Enterprise) is unchanged. Talking point updated to distinguish the two features and avoid implying chat search is free |
| 2026-03-21T12:00Z | [Verified] API Memory Tool now available for developers (type: memory_20250818); 3-layer architecture: Chat Memory, CLAUDE.md, API Memory Tool |
| 2026-03-07T12:00Z | Initial entry |
| 2026-03-02T12:00Z | Free on all plans; memory import tool launched |
| 2025-10-01T12:00Z | Memory feature launched (paid plans only) |

---

## Chat

| Property | Value |
|----------|-------|
| Category | other |
| Status   | ga |
| Gating   | free |
| URL      | https://claude.ai |
| Launched | 2023-07-11T12:00Z |
| Verified | 2026-09-28|
| Checked  | 2026-09-28 |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Usage caps | Claude Sonnet 5.5 with 5-hour session usage caps |
| Pro | ✅ | 5× Free | Opus access, higher limits |
| Max 5x | ✅ | 5× Pro | Extended thinking |
| Max 20x | ✅ | 20× Pro | Highest limits |
| Team | ✅ | Full | Pro features + collaboration tools |
| Enterprise | ✅ | Custom | SSO, advanced security, admin controls |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows  | ✅ | Desktop app |
| macOS    | ✅ | Desktop app |
| Linux    | ✅ | Desktop app |
| iOS      | ✅ | Claude iOS app |
| Android  | ✅ | Claude Android app |
| Chrome   | ❌ | |
| web      | ✅ | claude.ai |
| terminal | ❌ | |
| API      | ✅ | Anthropic API |

### Regional

Available globally. Some features may be restricted in certain regions.

### Talking Point

> "Claude's core text conversation is **available on all plans including free** at claude.ai, with apps for Windows, macOS, Linux, iOS, and Android. The free tier now runs on **Claude Sonnet 5.5** (the Sonnet 4.x line is long superseded) with 5-hour session usage caps; Pro unlocks Opus access and 5x the usage of Free, Max adds a 5x or 20x-of-Pro tier. As of September 2026, Anthropic is **merging Cowork and chat into one 'Claude' experience** on Pro/Max first (see the Cowork Mode entry in this file), so the line between 'just chatting' and handing off a multi-step task is disappearing."

### Sources

- [Claude](https://claude.ai)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Change the model, effort, and thinking settings](https://support.claude.com/en/articles/8664678-change-the-model-effort-and-thinking-settings)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Model reference corrected: Sonnet 4.6 is several generations stale (Anthropic shipped Sonnet 5 then Sonnet 5.5, announced today, 2026-09-28); Free-tier default updated to Sonnet 5.5. Fixed Max-tier multiplier mix-up in the Availability table: Max 5x had "20x Pro usage" and Max 20x had "Unlimited standard" — corrected to 5x and 20x respectively per anthropic.com/pricing and the Max plan FAQ ($100/mo = 5x Pro usage, $200/mo = 20x Pro usage). Noted the in-progress Cowork+chat merge. claude.ai itself returned HTTP 403 to automated fetches (bot-blocked); anthropic.com/pricing and the support.claude.com model-settings article served as the readable primary sources |
| 2026-03-07T12:00Z | Initial entry |
| 2023-07-11T12:00Z | Claude 2 and claude.ai public launch |
