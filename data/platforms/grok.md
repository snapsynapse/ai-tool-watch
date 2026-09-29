---
name: Grok
vendor: xAI
logo: https://x.ai/favicon.ico
status_page: https://status.x.ai
pricing_page: https://grok.com/
last_verified: 2026-09-28
---

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Limited queries via X / grok.com |
| Basic (X Premium) | $3/mo | New X Premium entry tier (edit posts, longer posts/video); no Grok-specific benefit called out |
| Premium | $8/mo | X Premium tier; "increased usage limits on Grok" |
| Premium+ | $40/mo | X Premium top tier; now bundles SuperGrok access, Grok Bot, Imagine, and Voice Mode (was $16/mo) |
| SuperGrok Lite | $10/mo | Listed on x.ai/pricing with video generation and Expert; price not shown there (unverified) |
| SuperGrok | $30/mo | Grok 4.6, Grok Bot, Expert, image and video generation, higher rate limits |
| SuperGrok Plus | $100/mo | Everything in SuperGrok plus 1080p video, significantly higher usage across Chat, Imagine, Voice and Build, priority access at peak times, early access |
| SuperGrok Heavy | $300/mo | Max rate limits, priority support; price not shown on x.ai/pricing (unverified) |
| Business | Per seat | Team admin, no training on your data; price not shown on x.ai/pricing |
| Enterprise | Custom | SSO, SCIM, customer-managed keys, dedicated data plane |

### Sources

- [About X Premium](https://help.x.com/en/using-x/x-premium)
- [Pricing: Compare Grok Plans](https://x.ai/pricing)
- [Grok](https://x.ai/grok)
- [SuperGrok](https://grok.com/supergrok)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T13:00Z | [Verified] Read x.ai/pricing (via browser; the page blocks scripts). Added SuperGrok Plus ($100/mo), Business and Enterprise. SuperGrok Lite is listed and sold, so the earlier likely-disabled flag is withdrawn. SuperGrok confirmed at $30/mo; Lite and Heavy prices are not shown on that page |
| 2026-09-28T12:00Z | [Verified] X Premium restructured to three named tiers — Basic ($3/mo or $32/yr), Premium ($8/mo or $84/yr, unchanged), Premium+ ($40/mo or $395/yr, was $16/mo) — per help.x.com, which now states Premium+ bundles SuperGrok access, Grok Bot, Imagine, and Voice Mode. Basic tier added to this table. SuperGrok Lite flagged as likely disabled: grok.com's live app config (`subscriptions_supergroklite_backend_enabled: false`) and its current subscribe flow list only two grok.com-direct paid plans (SuperGrok $30/mo, SuperGrok Heavy $300/mo); not confirmed fully discontinued. x.ai and help.x.com block automated fetches directly (Cloudflare bot challenge); verified via archive.org mirrors of the same official pages (help.x.com snapshot 2026-09-16, x.ai/grok snapshot 2026-09-21, grok.com/supergrok snapshots 2026-09-12/19) |

---

## DeepSearch

| Property | Value |
|----------|-------|
| Category | research |
| Status | ga |
| Gating | paid |
| URL | https://x.ai/blog/grok-deepsearch |
| Launched | 2025-02-17T12:00Z |
| Verified | 2026-03-24|
| Checked | 2026-09-01|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Premium | ⚠️ | Limited | Basic access |
| Premium+ | ✅ | Standard | Full access |
| SuperGrok | ✅ | Unlimited | Priority |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally.

### Talking Point

> "DeepSearch is Grok's multi-step research mode. **Premium+ or SuperGrok recommended** for full access; basic Premium has limited DeepSearch."

### Sources

- [Grok DeepSearch](https://x.ai/blog/grok-deepsearch)

### Changelog

| Date | Change |
|------|--------|
| 2025-02-17T12:00Z | Initial entry |

---

## Grok Chat

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | paid |
| URL | https://x.ai/grok |
| Launched | 2023-11-04T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Very limited | Few queries/day via X |
| Premium | ✅ | Standard | Regular access |
| Premium+ | ✅ | Enhanced | Higher limits |
| SuperGrok | ✅ | Highest | Priority access |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com, x.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally where X is available.

### Talking Point

> "Grok is xAI's chatbot, available through X (Twitter) or via grok.com. **No official desktop apps exist**—access is via web, iOS, or Android. **Free users get very limited access; Premium ($8/mo) unlocks regular use.** SuperGrok at $30/mo gets you the highest limits."

### Sources

- [Grok Official](https://x.ai/grok)
- [Premium Features](https://help.x.com/en/using-x/x-premium)

### Changelog

| Date | Change |
|------|--------|
| 2023-11-04T12:00Z | Initial entry |

---

## Grok Image Generation (Aurora)

| Property | Value |
|----------|-------|
| Category | image-gen |
| Status | ga |
| Gating | free |
| URL | https://x.ai/blog/grok-image-generation |
| Launched | 2024-12-09T12:00Z |
| Verified | 2026-03-24|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Limited | Included on Free per x.ai/pricing; exact count unpublished |
| Premium | ✅ | Unverified | X Premium path; limits not published |
| Premium+ | ✅ | Unverified | X Premium+ bundles Imagine per help.x.com |
| SuperGrok Lite | ✅ | Unverified | Included per x.ai/pricing |
| SuperGrok | ✅ | Higher | Higher rate limits per x.ai/pricing |
| SuperGrok Plus | ✅ | Significantly higher | Shared usage pool across Chat, Imagine, Voice and Build |
| SuperGrok Heavy | ✅ | Unverified | Included per x.ai/pricing |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally.

### Talking Point

"> "Grok can generate images with Imagine. **Available on every plan, including Free**, within limits xAI does not publish as numbers; paid plans raise usage, and SuperGrok Plus draws on a larger shared pool across Chat, Imagine, Voice and Build."

### Sources

- [Grok Image Generation](https://x.ai/blog/grok-image-generation)
- [Pricing: Compare Grok Plans](https://x.ai/pricing)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T13:00Z | Per x.ai/pricing, image generation is included on every grok.com plan including Free; Gating corrected to free and grok.com tier rows added. Per-tier counts (~10/2hrs, ~20-50/day, ~500/day) removed as unsourced. X Premium rows not confirmed on that page, so Verified is unchanged |
| 2026-02-28T12:00Z | [Verified] Free tier access confirmed (~10 generations per 2-hour window); paid tier limits updated |
| 2024-12-09T12:00Z | Initial entry |

---

## Grok Imagine (Video Generation)

| Property | Value |
|----------|-------|
| Category | video-gen |
| Status | ga |
| Gating | paid |
| URL | https://x.ai/blog/grok-imagine |
| Launched | 2025-08-04T12:00Z |
| Verified | 2026-03-24|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not included per x.ai/pricing |
| Premium | ⚠️ | Unverified | X Premium path; not confirmed by an official source |
| Premium+ | ✅ | Unverified | X Premium+ bundles Imagine per help.x.com |
| SuperGrok Lite | ✅ | Unverified | Included per x.ai/pricing |
| SuperGrok | ✅ | Higher | Higher rate limits per x.ai/pricing |
| SuperGrok Plus | ✅ | Significantly higher | 1080p video; shared usage pool across Chat, Imagine, Voice and Build |
| SuperGrok Heavy | ✅ | Unverified | Included per x.ai/pricing |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com, x.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally where X is available.

### Talking Point

"> "Grok Imagine generates video clips up to 15 seconds with synchronized audio. **Video generation requires a paid plan** (SuperGrok Lite and up on grok.com); xAI does not publish per-plan daily counts, and SuperGrok Plus adds 1080p and significantly higher usage from a shared pool. Supports text-to-video and image-to-video."

### Sources

- [Grok Imagine - TechCrunch](https://techcrunch.com/2025/08/04/grok-imagine-xais-new-ai-image-and-video-generator-lets-you-make-nsfw-content/)
- [Grok Imagine Video Generation — xAI Docs](https://docs.x.ai/developers/model-capabilities/video/generation)
- [Grok Imagine Overview — xAI Docs](https://docs.x.ai/developers/model-capabilities/imagine)
- [Pricing: Compare Grok Plans](https://x.ai/pricing)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T13:00Z | Per x.ai/pricing: video generation not included on Free (was ⚠️), included on SuperGrok Lite and up; SuperGrok Plus adds 1080p and a larger shared usage pool. Unsourced daily counts removed and marked Unverified, resolving the #631 Limits restructure. X Premium rows not confirmed, so Verified is unchanged |
| 2026-09-11T12:00Z | Per-tier daily generation counts (~3/day free, 50/100/500 per day paid) flagged as unsourced — their only backing was the unofficial supergrok.online source removed in #620, and no official xAI source publishes per-tier consumer video limits. docs.x.ai documents only API per-second pricing, 15s max duration and resolution caps; paid plans are reported to draw on a shared usage pool across Chat/Imagine/Voice/Build. Restructure deferred to the grok.md tier-taxonomy issue. Verified deliberately not bumped |
| 2026-08-25T12:00Z | [Verified] Source swap — unofficial supergrok.online (CI link-check timeout) replaced with official xAI Imagine and video-generation docs |
| 2026-02-28T12:00Z | [Verified] Free tier access confirmed (very limited, ~3/day at 480p); paid tier daily limits updated |
| 2025-11-01T12:00Z | Text-to-video generation added |
| 2025-10-06T12:00Z | Major update announced by Elon Musk |
| 2025-08-04T12:00Z | Initial entry (image-to-video launched) |

---

## Grok Studio

| Property | Value |
|----------|-------|
| Category | coding |
| Status | ga |
| Gating | free |
| URL | https://grok.com |
| Launched | 2025-04-16T12:00Z |
| Verified | 2026-03-20|
| Checked | 2026-09-01|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | ~10 requests/2hrs | Split-screen workspace |
| Premium | ✅ | Standard | Full access |
| Premium+ | ✅ | 50 requests/2hrs | Priority |
| SuperGrok | ✅ | 100 requests/2hrs | Highest limits |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ❌ | Web only |
| Android | ❌ | Web only |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally where Grok is available.

### Talking Point

> "Grok Studio is a split-screen workspace for creating documents, running code, and building games—similar to Canvas or Artifacts. **Available on all tiers including free** at grok.com. Supports Python, JavaScript, TypeScript, C++, and HTML preview."

### Sources

- [Grok Studio Announcement](https://techcrunch.com/2025/04/15/grok-gains-a-canvas-like-tool-for-creating-docs-and-apps/)
- [xAI Grok](https://x.ai/grok)

### Changelog

| Date | Change |
|------|--------|
| 2025-04-16T12:00Z | Initial entry |

---

## Grok Voice Mode

| Property | Value |
|----------|-------|
| Category | voice |
| Status | ga |
| Gating | free |
| URL | https://x.ai/blog/grok-voice |
| Launched | 2025-02-24T12:00Z |
| Verified | 2026-03-21|
| Checked | 2026-09-01|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | 11 voice modes, now free for all users |
| Premium | ✅ | Standard | Voice conversations |
| Premium+ | ✅ | Enhanced | Priority |
| SuperGrok | ✅ | Highest | Best quality |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ❌ | Mobile only |
| macOS | ❌ | Mobile only |
| Linux | ❌ |  |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API + TTS API (5 voices) |

### Regional

Available globally where X is available.

### Talking Point

> "Grok Voice Mode allows natural voice conversations with Grok. **Now free for all users** on iOS, Android, and web (grok.com) with 11 voice modes. TTS API available for developers with 5 voice personalities. Supports attachments and photos in voice conversations (Mar 2026)."

### Sources

- [Grok Voice](https://x.ai/blog/grok-voice)

### Changelog

| Date | Change |
|------|--------|
| 2026-03-21T12:00Z | [Verified] Voice mode now free for all users on iOS and Android; 11 voice modes; TTS API launched (Mar 16); attachment/photo support in voice added; gating changed from paid to free |
| 2026-02-28T12:00Z | [Verified] Free access confirmed for iOS users; Android still requires subscription |
| 2025-02-24T12:00Z | Initial entry |

---

## Real-time X/Twitter Data

| Property | Value |
|----------|-------|
| Category | search |
| Status | ga |
| Gating | free |
| URL | https://grok.com/ |
| Launched | 2023-11-04T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Limited | ~10 msgs / 2h, lighter models |
| Premium | ✅ | Full | Real-time posts |
| Premium+ | ✅ | Full | Higher quotas |
| SuperGrok Lite | ✅ | Standard | Real-time posts, lighter limits |
| SuperGrok | ✅ | Full | DeepSearch, ~100 prompts / 2h |
| SuperGrok Plus | ✅ | Full | Significantly higher usage (x.ai/pricing) |
| SuperGrok Heavy | ✅ | Full | Max rate limits |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no GUI desktop app) |
| macOS | ⚠️ | Web only (no GUI desktop app) |
| Linux | ⚠️ | Web only (no GUI desktop app) |
| iOS | ✅ | X app + standalone Grok app |
| Android | ✅ | X app + standalone Grok app |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ✅ | Grok Build CLI (SuperGrok beta) |
| API | ✅ | xAI API |
| Tesla | ✅ | In-car integration |

### Regional

Available globally. EU/EEA users treated differently for training/data-usage defaults.

### Talking Point

> "Grok has **real-time access to X/Twitter posts**—its unique advantage over other chatbots. **Available on the free tier with lower limits**; paid tiers (X Premium from $8/mo, SuperGrok $30/mo, SuperGrok Heavy $300/mo) get higher quotas and more capable models. Also accessible inside Tesla vehicles."

### Sources

- [Grok (consumer)](https://grok.com/)
- [xAI](https://x.ai/grok)

### Changelog

| Date | Change |
|------|--------|
| 2026-06-18T12:00Z | [Verified] Gating corrected paid→free (free tier has real-time access, ~10 msgs / 2h); SuperGrok Lite ($10/mo) and SuperGrok Heavy ($300/mo) added; terminal flipped to ✅ for Grok Build CLI (SuperGrok beta); Tesla platform added; URL normalized to grok.com |
| 2023-11-04T12:00Z | Initial entry |

---

## Think Mode

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | paid |
| URL | https://x.ai/blog/grok-3 |
| Launched | 2025-02-17T12:00Z |
| Verified | 2026-03-24|
| Checked | 2026-09-01|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Premium | ✅ | Limited | Extended reasoning |
| Premium+ | ✅ | Standard | |
| SuperGrok | ✅ | Full | Longest thinking time |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally.

### Talking Point

> "Think Mode lets Grok reason through complex problems step-by-step. **Available on all paid tiers**, with SuperGrok getting the longest thinking time."

### Sources

- [Grok Think Mode](https://x.ai/blog/grok-3)

### Changelog

| Date | Change |
|------|--------|
| 2025-02-17T12:00Z | Initial entry |

---

## Vision (Image Understanding)

| Property | Value |
|----------|-------|
| Category | vision |
| Status | ga |
| Gating | paid |
| URL | https://x.ai/blog/grok-2 |
| Launched | 2024-08-13T12:00Z |
| Verified | 2026-09-28|
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Premium | ✅ | Standard | Image uploads in chat |
| Premium+ | ✅ | Standard | Full access |
| SuperGrok | ✅ | Highest | Priority access |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ✅ | xAI API |

### Regional

Available globally where Grok is available.

### Talking Point

> "Grok 2 understands images—upload photos, screenshots, or diagrams and Grok will analyze them. **Requires a paid plan (Premium $8/mo or higher)**. Available on web and mobile."

### Sources

- [Grok 2 Announcement](https://x.ai/blog/grok-2)

### Changelog

| Date | Change |
|------|--------|
| 2026-03-07T12:00Z | Initial entry |
| 2024-08-13T12:00Z | Grok 2 launched with image understanding |

---

## Memory

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | free |
| URL | https://grok.com |
| Launched | 2025-02-17T12:00Z |
| Verified | 2026-09-28 |
| Checked | 2026-09-28|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | Basic persistent memory |
| Premium | ✅ | Standard | Full access |
| Premium+ | ✅ | Enhanced | Larger context retention |
| SuperGrok | ✅ | Highest | Maximum context and memory |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ⚠️ | Web only (no official app) |
| macOS | ⚠️ | Web only (no official app) |
| Linux | ⚠️ | Web only (no official app) |
| iOS | ✅ | X app + standalone |
| Android | ✅ | X app + standalone |
| Chrome | ❌ |  |
| web | ✅ | grok.com |
| terminal | ❌ |  |
| API | ❌ | Not available via API |

### Regional

Available globally where Grok is available. Persistent memory may be restricted in EU/UK due to data protection regulations.

### Talking Point

> "Grok has persistent memory that carries user preferences and context across conversations. **Available on all tiers including free.** Memory is selective and automatic—Grok stores key facts it deems important. Users can turn memory off under Settings → Data Controls, but there is no itemized memory manager listing everything saved. The feature appeared with Grok 3 in early 2025 and behavior can be inconsistent across platforms."

### Sources

- [Grok](https://x.ai/grok)
- [How Grok Memory Works](https://blog.memoryplugin.com/how-grok-memory-works/)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-28T12:00Z | [Verified] Official primary source found and added — x.ai/grok (archive.org snapshot 2026-09-21; direct fetch blocked by Cloudflare) lists "Memory across chats — Remembers your preferences and past conversations" as a general, ungated feature, consistent with this record's free-tier-included claim. blog.memoryplugin.com retained as the only source for the Settings → Data Controls toggle detail, which x.ai/grok does not address |
| 2026-09-11T12:00Z | [Verified] Dead source compareclaw.com removed (HTTP 402, Vercel DEPLOYMENT_DISABLED — entire domain offline). No official xAI page describing consumer memory was found, so the record now rests on a single third-party source. Talking point corrected — a memory toggle exists under Settings → Data Controls (two independent reports); the earlier claim that memory cannot be inspected or edited was itself unsourced. Verified not bumped: no primary source |
| 2026-03-07T12:00Z | Initial entry |
| 2025-02-17T12:00Z | Persistent memory toggle appeared with Grok 3 launch |
