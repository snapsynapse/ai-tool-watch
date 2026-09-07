---
name: Microsoft Copilot
vendor: Microsoft
logo: https://copilot.microsoft.com/favicon.ico
status_page: https://status.office.com
pricing_page: https://microsoft.com/en-us/microsoft-365-copilot/pricing/individuals
last_verified: 2026-09-05
---

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Web and app chat; sign in for history, longer conversations, image creation, voice |
| Microsoft 365 Personal | $9.99/mo | Copilot in the desktop Office apps; AI credits and per-feature limits apply |
| Microsoft 365 Family | $12.99/mo | Same AI benefits as Personal, available to the subscription owner only |
| Microsoft 365 Premium | $19.99/mo | U.S. consumer price in USD; monthly billing. Top consumer tier; adds Analyst and Researcher agents and extended limits |
| Microsoft 365 Copilot | $30/user/mo | Commercial license; full Copilot in M365 apps (requires an M365 business license) |

Microsoft stopped selling Copilot Pro to new customers in October 2025. Existing subscribers can keep their subscriptions or switch to Microsoft 365 Premium. A support-end date for existing subscriptions has not been established by the sources reviewed here.

The feature availability tables below list plans currently available to new customers. Existing Copilot Pro subscriptions can continue, but their feature-level entitlements have not been reviewed here and are not inferred from the current consumer plan lineup.

### Sources

- [Copilot pricing plans for individuals](https://microsoft.com/en-us/microsoft-365-copilot/pricing/individuals)
- [Microsoft 365 Premium](https://microsoft.com/en-us/microsoft-365/p/microsoft-365-premium/cfq7ttc11z3q)
- [Meet Microsoft 365 Premium](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Introducing Microsoft 365 Premium](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Copilot Pro recurring billing guidance](https://support.microsoft.com/en-us/microsoft-copilot/gpt-builder-has-been-retired)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] Microsoft stopped new Copilot Pro sales, but current support guidance permits existing subscriptions to continue. The universal retirement conclusion and 2026-08-01 support-end date recorded in the 2026-09-05 feature changelogs are not supported by the current first-party sources. Their historical entries remain below; no legacy feature entitlement is inferred by this correction. |

---

## Agent Builder

| Property | Value |
|----------|-------|
| Category | agents |
| Status | ga |
| Gating | paid |
| URL | https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder |
| Launched | 2025-02-24T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Microsoft 365 Personal / Family | ❌ | — | Consumer plans do not include agent authoring |
| Microsoft 365 Premium | ❌ | — | Consumer plan; includes prebuilt Analyst and Researcher agents, not agent authoring |
| M365 Copilot | ✅ | Included | No-code agent creation + multi-agent coordination |
| Copilot Chat (M365 commercial) | ⚠️ | Limited | Free for basic agents |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | M365 apps + Outlook |
| macOS | ✅ | M365 apps + Outlook |
| Linux | ❌ |  |
| iOS | ❌ | Not available on mobile |
| Android | ❌ | Not available on mobile |
| Chrome | ❌ |  |
| web | ✅ | microsoft365.com/chat |
| terminal | ❌ |  |
| API | ⚠️ | Via Copilot Studio |

### Regional

Available in 17 regions including US, Europe, Asia Pacific.

### Talking Point

> "Agent Builder lets you create custom AI agents using natural language—no coding required. **Requires M365 Copilot ($30/user/mo)** for full access. As of March 2026, **agents can call other agents as tools** (multi-agent coordination), and new agent surfaces include Outlook, OneDrive, and Teams communities."

### Sources

- [Agent Builder Documentation](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder)
- [Build Agents Guide](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/agent-builder-build-agents)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-05 | [Verified] Copilot Pro row replaced by the Microsoft 365 consumer plans, all marked unavailable: agent authoring remains a commercial Copilot capability. Recorded that Microsoft 365 Premium ships prebuilt Analyst and Researcher agents, which is agent consumption rather than authoring. |
| 2026-03-07T12:00Z | [Verified] Multi-agent coordination added (agents can call other agents as tools); new agent surfaces: Outlook, OneDrive, Teams communities; PowerPoint agentic mode |
| 2025-11-18T12:00Z | Rebranding to Copilot Studio Lite announced |
| 2025-02-24T12:00Z | Initial entry |

---

## Copilot Connectors

| Property | Value |
|----------|-------|
| Category | integrations |
| Status | ga |
| Gating | paid |
| URL | https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-copilot-connector |
| Launched | 2023-11-01T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Microsoft 365 Personal / Family | ❌ | — | Consumer plans do not include connectors |
| Microsoft 365 Premium | ❌ | — | Consumer plan; commercial Copilot license required |
| M365 Copilot | ✅ | Full | 100+ connectors + federated connectors |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | M365 apps |
| macOS | ✅ | M365 apps |
| Linux | ❌ |  |
| iOS | ✅ | M365 mobile apps |
| Android | ✅ | M365 mobile apps |
| Chrome | ❌ |  |
| web | ✅ | M365 web apps |
| terminal | ❌ |  |
| API | ✅ | Microsoft Graph API |

### Regional

Available globally where M365 Copilot is available.

### Talking Point

> "Copilot Connectors let M365 Copilot access external data from services like Salesforce, ServiceNow, Box, and more. **Requires M365 Copilot ($30/user/mo)**, and is not available on the free tier or any Microsoft 365 consumer plan. As of March 2026, **federated connectors add live data from Notion, HubSpot, Linear, Intercom, Google Contacts, and Google Calendar**."

### Sources

- [Copilot Connectors Overview](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/overview-copilot-connector)
- [Copilot Connectors Gallery](https://learn.microsoft.com/en-us/microsoftsearch/connectors-gallery)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-05 | [Verified] Copilot Pro row replaced by the Microsoft 365 consumer plans, all marked unavailable: connectors remain a commercial Copilot capability requiring a Microsoft 365 Copilot license. |
| 2026-03-07T12:00Z | [Verified] Federated connectors added: Notion, HubSpot, Linear, Intercom, Google Contacts, Google Calendar (live data via Researcher tool) |
| 2025-11-01T12:00Z | MCP integration added |
| 2023-11-01T12:00Z | Initial entry |

---

## Copilot in Office Apps

| Property | Value |
|----------|-------|
| Category | cloud-files |
| Status | ga |
| Gating | paid |
| URL | https://www.microsoft.com/en-us/microsoft-365/copilot |
| Launched | 2023-11-01T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Web and app chat only; no Office app integration |
| Microsoft 365 Personal | ✅ | AI credits + per-feature limits | Word, Excel, PowerPoint, Outlook, OneNote; subscription owner only |
| Microsoft 365 Family | ✅ | AI credits + per-feature limits | Same as Personal; AI benefits limited to the subscription owner |
| Microsoft 365 Premium | ✅ | Extended | Adds advanced AI features and Analyst / Researcher agents |
| M365 Copilot | ✅ | Full | Commercial license; enterprise features |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Office desktop apps |
| macOS | ✅ | Office desktop apps |
| Linux | ❌ |  |
| iOS | ✅ | Office mobile apps |
| Android | ✅ | Office mobile apps |
| Chrome | ❌ |  |
| web | ✅ | Office web apps |
| terminal | ❌ |  |
| API | ❌ | No consumer API |

### Regional

Available globally.

### Talking Point

> "Copilot in Word, Excel, PowerPoint and Outlook now comes with **any paid Microsoft 365 consumer plan, starting at $9.99/mo for Personal**, or with a **Microsoft 365 Copilot commercial license ($30/user/mo)**. Free Copilot still doesn't include Office integration. Two catches: the AI benefits go to the **subscription owner only**, even on Family, and usage draws on monthly AI credits. **Copilot Pro is closed to new customers; existing subscribers can continue or switch to Microsoft 365 Premium.** This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Microsoft Copilot free vs Copilot in Microsoft 365](https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365)
- [AI credits and limits for Microsoft 365 subscriptions](https://support.microsoft.com/en-us/office/ai-credits-and-limits-for-microsoft-365-personal-family-and-premium-68530f1a-4459-4d02-9818-8233c1f673b8)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | [Verified] Copilot Pro retired and replaced by Microsoft 365 Premium; Office app integration confirmed as included in Microsoft 365 Personal, Family and Premium, limited to the subscription owner and metered by AI credits. Replaced the dead Copilot Pro store source with Microsoft's free-vs-subscription and AI credits support pages. |
| 2023-11-01T12:00Z | Initial entry |

---

## Copilot Vision

| Property | Value |
|----------|-------|
| Category | browser |
| Status | ga |
| Gating | paid |
| URL | https://support.microsoft.com/en-us/topic/using-copilot-vision-with-microsoft-copilot-3c67686f-fa97-40f6-8a3e-0e45265d425f |
| Launched | 2024-10-01T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Subscription required as of 2026 |
| Microsoft 365 Personal | ✅ | 10 min/day | Windows, macOS, Edge, and Copilot mobile |
| Microsoft 365 Family | ✅ | 10 min/day | Subscription owner only |
| Microsoft 365 Premium | ✅ | 15 min/day | Highest consumer allowance |
| M365 Copilot (commercial) | ✅ | Per license | Entra ID sign-in, Copilot web and mobile apps |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Share any app or window with Copilot |
| macOS | ✅ | Native Copilot app |
| Linux | ❌ |  |
| iOS | ✅ | Copilot mobile app, including camera feed |
| Android | ✅ | Copilot mobile app, including camera feed |
| Chrome | ❌ | Edge only for in-browser Vision |
| web | ⚠️ | Copilot web app for commercial users signed in with Entra ID |
| terminal | ❌ |  |
| API | ❌ | No consumer API |

### Regional

Available in all supported Copilot regions and languages. Availability can vary during rollout.

### Talking Point

> "Copilot Vision lets Copilot watch your screen, a shared app, or your phone camera and talk you through what it sees. It runs inside a Copilot Voice session, so you share a screen and then ask out loud. It is **no longer free**: you now need **Microsoft 365 Personal, Family, or Premium**, capped at **10 minutes a day** on Personal and Family and **15 minutes a day** on Premium. It reaches well beyond Edge now, covering Windows, macOS, and the mobile apps. This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Using Copilot Vision](https://support.microsoft.com/en-us/topic/using-copilot-vision-with-microsoft-copilot-3c67686f-fa97-40f6-8a3e-0e45265d425f)
- [Copilot Vision Preview Announcement](https://www.microsoft.com/en-us/microsoft-copilot/blog/2024/12/05/copilot-vision-now-in-preview-a-new-way-to-browse/)
- [Paywall Removed (Windows Central)](https://www.windowscentral.com/software-apps/browsing/microsoft-removes-the-paywall-for-copilot-vision-but-only-for-edge-users)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | [Verified] Gating reverted from free to paid: Microsoft now requires a Microsoft 365 Personal, Family, or Premium subscription for Copilot Vision. Status moved from preview to ga. Added per-plan daily limits (10 min Personal/Family, 15 min Premium) and commercial Entra ID access. Platforms expanded well beyond Edge: iOS and Android now supported, Windows shares any app, macOS is a native app. Regional widened from US-only to all supported Copilot regions and languages. |
| 2026-02-17T12:00Z | [Verified] Gating changed from paid to free for Edge users; macOS Edge confirmed; US availability confirmed |
| 2025-03-01T12:00Z | Paywall removed — now free for all Edge users with Microsoft account |
| 2024-12-05T12:00Z | Preview launched in Edge |
| 2024-10-01T12:00Z | Initial entry |

---

## Copilot Voice

| Property | Value |
|----------|-------|
| Category | voice |
| Status | ga |
| Gating | free |
| URL | https://www.microsoft.com/en-us/microsoft-copilot |
| Launched | 2024-10-01T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Subject to capacity | Voice input and output after signing in; no priority when capacity is constrained |
| Microsoft 365 Personal | ✅ | 30 min/day | Priority access when capacity is limited |
| Microsoft 365 Family | ✅ | 30 min/day | Subscription owner only |
| Microsoft 365 Premium | ✅ | 60 min/day | Top consumer tier; replaced Copilot Pro |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Native integration |
| macOS | ✅ | Copilot app |
| Linux | ❌ | No native client; web only |
| iOS | ✅ | Copilot app |
| Android | ✅ | Copilot app |
| Chrome | ❌ |  |
| web | ✅ | Browser with microphone |
| terminal | ❌ |  |
| API | ❌ | No public consumer voice API |

### Regional

Available globally, with spoken support limited to a subset of languages. Government cloud tenants (GCC, GCC High, DoD) receive Copilot features on a staggered schedule.

### Talking Point

> "Copilot Voice is **free once you sign in**, subject to capacity. Subscribers get both priority and a published daily allowance: **30 minutes a day on Microsoft 365 Personal and Family, 60 minutes a day on Premium**. **Copilot Pro is closed to new customers; existing subscribers can continue or switch to Microsoft 365 Premium.** Speak to Copilot on Windows, Mac, mobile, and the web. This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Microsoft Copilot](https://www.microsoft.com/en-us/microsoft-copilot)
- [Changes to the Microsoft Copilot app](https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app)
- [AI credits and limits for Microsoft 365 subscriptions](https://support.microsoft.com/en-us/office/ai-credits-and-limits-for-microsoft-365-personal-family-and-premium-68530f1a-4459-4d02-9818-8233c1f673b8)
- [Microsoft 365 Premium](https://www.microsoft.com/en-us/microsoft-365/p/microsoft-365-premium/cfq7ttc11z3q)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | [Verified] Copilot Pro retired (off sale October 2025, support ended 2026-08-01) and replaced by Microsoft 365 Premium; availability rows re-cut to Free / M365 Personal / Family / Premium. Free tier corrected from "Standard" limits to free-subject-to-capacity, sign-in required. Added Microsoft's published daily voice allowances (30 min/day Personal and Family, 60 min/day Premium). Added language and government-cloud caveats to regional note. Status remains ga; platform flags unchanged. |
| 2024-10-01T12:00Z | Initial entry |

---

## Model Access

| Property | Value |
|----------|-------|
| Category | other |
| Status | ga |
| Gating | mixed |
| URL | https://copilot.microsoft.com/ |
| Launched | 2023-02-07T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | Limited | Model routing not guaranteed; lower usage limits than subscriptions |
| Microsoft 365 Personal / Family | ✅ | Priority access | Higher usage limits; priority when capacity is constrained |
| Microsoft 365 Premium | ✅ | Extended | Exclusive access to advanced AI features |

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
| API | ❌ | No consumer API |

### Regional

Available globally.

### Talking Point

> "Copilot no longer sells access to a named model tier, and Microsoft's own plan documentation never mentions one. What a **Microsoft 365 subscription buys is usage, not a better model**: higher limits, priority access when capacity is tight, and on **Premium** the advanced AI features and the Analyst and Researcher agents. Reporting through 2026 describes Copilot routing across newer OpenAI models alongside Microsoft's own MAI models, with a model picker on some surfaces. Any guide still framing this as free-versus-Pro GPT-4 access is out of date. This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Microsoft Copilot free vs Copilot in Microsoft 365](https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365)
- [AI credits and limits for Microsoft 365 subscriptions](https://support.microsoft.com/en-us/office/ai-credits-and-limits-for-microsoft-365-personal-family-and-premium-68530f1a-4459-4d02-9818-8233c1f673b8)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | Renamed from "GPT-4 Access" to "Model Access". Microsoft no longer sells a named model tier, so the old name described a product that stopped existing; the record covers model access and the entitlements attached to it. Implementation id changed from copilot-gpt-4-access to copilot-model-access, which changes the record's permalink anchor. |
| 2026-09-05 | [Verified] The GPT-4 framing is obsolete: Microsoft's plan documentation no longer sells a named model tier, and publishes no free-versus-paid model split. Gating changed from paid to mixed, since the paid differentiator is usage limits and advanced features rather than model access. Copilot Pro rows replaced with the Microsoft 365 consumer plans. Dead Copilot Pro store source replaced with Microsoft support pages. Multi-model routing across OpenAI and Microsoft MAI models is secondary reporting, not first-party confirmed. Record is a candidate for renaming away from "GPT-4 Access". |
| 2023-02-07T12:00Z | Initial entry |

---

## Image Generation (Designer)

| Property | Value |
|----------|-------|
| Category | image-gen |
| Status | ga |
| Gating | free |
| URL | https://designer.microsoft.com/ |
| Launched | 2023-03-21T12:00Z |
| Verified | 2026-09-05|
| Checked | 2026-09-05|

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Not published | Image creation after signing in with a Microsoft account |
| Microsoft 365 Personal | ✅ | 60 AI credits/mo | Designer, Create, Paint, Photos, and M365 web, mobile and desktop apps |
| Microsoft 365 Family | ✅ | 60 AI credits/mo | Subscription owner only |
| Microsoft 365 Premium | ✅ | Beyond standard credits | Extensive usage above the standard credit limit |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows | ✅ | Native integration |
| macOS | ✅ |  |
| Linux | ❌ |  |
| iOS | ✅ |  |
| Android | ✅ |  |
| Chrome | ❌ |  |
| web | ✅ | copilot.microsoft.com |
| terminal | ❌ |  |
| API | ❌ | No consumer API |

### Regional

Available globally.

### Talking Point

> "Image generation with Designer is **available on every plan including free**, though you must sign in. Paid plans meter it with AI credits: **60 a month on Microsoft 365 Personal and Family**, and **usage beyond the standard credit limit on Premium**. Microsoft doesn't publish a monthly figure for free accounts. Powered by **GPT-Image-1.5**. The Designer bot in Teams was retired in February 2026, so use Copilot image generation instead. This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Microsoft Designer](https://designer.microsoft.com/)
- [AI Credits in M365](https://support.microsoft.com/en-us/office/ai-credits-and-limits-for-microsoft-365-personal-family-and-premium-68530f1a-4459-4d02-9818-8233c1f673b8)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | [Verified] Copilot Pro retired and replaced by Microsoft 365 Premium. Per-plan credits re-cut from Microsoft's AI credits support page: 60 credits/mo on Personal and Family, usage beyond the standard limit on Premium. Free-tier allowance corrected to "not published" — the previous 15 credits/mo figure described legacy Classic Microsoft 365, not free Copilot. |
| 2026-03-23T12:00Z | [Verified] Gating corrected from paid to free — free users have access with 15 AI credits/mo; data was internally inconsistent |
| 2026-03-21T12:00Z | [Verified] Credits system replaced boosts (15-60 credits/month); Designer bot retired in Teams (Feb 27); model upgraded to GPT-Image-1.5 |
| 2023-03-21T12:00Z | Initial entry |

---

## Chat

| Property | Value |
|----------|-------|
| Category | other |
| Status   | ga |
| Gating   | free |
| URL      | https://copilot.microsoft.com |
| Launched | 2023-02-07T12:00Z |
| Verified | 2026-09-05|
| Checked  | 2026-09-05 |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ✅ | Standard | No sign-in for basic chat; sign in for history, longer conversations, image creation, voice |
| Microsoft 365 Personal / Family | ✅ | Extensive use | Priority access when capacity is constrained |
| Microsoft 365 Premium | ✅ | Extensive use | Adds advanced AI features and Analyst / Researcher agents |
| M365 Copilot | ✅ | Full | Commercial license |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows  | ✅ | Copilot app + Microsoft Edge sidebar |
| macOS    | ✅ | Copilot app |
| Linux    | ❌ | No native app |
| iOS      | ✅ | Copilot iOS app |
| Android  | ✅ | Copilot Android app |
| Chrome   | ❌ | |
| web      | ✅ | copilot.microsoft.com |
| terminal | ❌ | |
| API      | ❌ | No consumer API; M365 enterprise API separate |

### Regional

Broadly available globally; some AI features may vary by region or require data-movement consent. See Microsoft's Copilot international availability page for details.

### Talking Point

> "Microsoft Copilot's core text chat is **free at copilot.microsoft.com**, with no account required for basic access. Sign in with a Microsoft account for chat history, longer conversations, image creation, and voice. A paid **Microsoft 365 plan buys higher usage, not a different chatbot**, and **Premium** adds the Analyst and Researcher agents. Native apps available on Windows, macOS, iOS, and Android. This table covers plans available to new customers; legacy Copilot Pro feature entitlements need separate review."

### Sources

- [Copilot Pro new-sales change](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/)
- [Continuing Copilot Pro subscriptions](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium)
- [Microsoft Copilot](https://copilot.microsoft.com)
- [Microsoft Copilot free vs Copilot in Microsoft 365](https://support.microsoft.com/en-us/microsoft-365-copilot/what-s-the-difference-between-microsoft-copilot-free-and-copilot-in-microsoft-365)
- [AI credits and limits for Microsoft 365 subscriptions](https://support.microsoft.com/en-us/office/ai-credits-and-limits-for-microsoft-365-personal-family-and-premium-68530f1a-4459-4d02-9818-8233c1f673b8)

### Changelog

| Date | Change |
|------|--------|
| 2026-09-07 | [Correction] The prior universal Copilot Pro retirement and 2026-08-01 support-end assertions were unsupported. Microsoft closed new sales, while existing subscriptions can continue. Removed the legacy unavailability row; feature entitlements for continuing subscribers require separate review. Checked/Verified dates are unchanged. |
| 2026-09-05 | [Verified] Copilot Pro row replaced by the Microsoft 365 consumer plans after Copilot Pro's retirement; free tier confirmed as no-sign-in basic chat with sign-in unlocking history, longer conversations, image creation and voice. Noted that paid plans buy usage rather than a different model, and that Premium adds the Analyst and Researcher agents. Refreshed the redirected support source. |
| 2026-03-07T12:00Z | Initial entry |
| 2023-11-15T12:00Z | Bing Chat rebranded to Microsoft Copilot |
| 2023-02-07T12:00Z | Bing Chat (predecessor) launched |
