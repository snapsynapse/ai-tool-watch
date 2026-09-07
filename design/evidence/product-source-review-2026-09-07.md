# Copilot and Gemini source review
Date: 2026-09-07
Scope: five previously unresolved pilot claims. Status: Sam Rogers explicitly accepted this packet on 2026-09-07; implementation follows the normal reviewed publication path. Checked/Verified dates and durable collector state remain unchanged.

## Accepted decision
Retain the two existing monthly prices with U.S./USD/monthly qualifications, retain consumer Vision gating and bounded region wording, and correct the unsupported universal Copilot Pro retirement claim. Manual source coverage does not make the configured automated collectors healthy.

| Claim | Proposed disposition | First-party evidence |
|---|---|---|
| Microsoft 365 Premium monthly price | Retain $19.99/month; qualify U.S. consumer, USD, regular monthly billing. Keep annual and promotional prices separate. | [Individual plans](https://microsoft.com/en-us/microsoft-365-copilot/pricing/individuals), [Premium product](https://microsoft.com/en-us/microsoft-365/p/microsoft-365-premium/cfq7ttc11z3q) |
| Copilot Pro lifecycle | Replace universal retirement with closed new sales and continuing existing subscriptions. Remove the unsupported 2026-08-01 support-end date. | [October 2025 launch](https://microsoft.com/en-us/microsoft-365/blog/2025/10/01/meet-microsoft-365-premium-your-ai-and-productivity-powerhouse/), [current Premium FAQ](https://support.microsoft.com/en-us/office/introducing-microsoft-365-premium), [recurring-billing guidance](https://support.microsoft.com/en-us/microsoft-copilot/gpt-builder-has-been-retired) |
| Consumer Copilot Vision gating | Retain paid gating: Microsoft 365 Personal, Family, or Premium. Commercial availability and per-plan minutes are outside this five-claim review. | [Vision support](https://support.microsoft.com/en-us/microsoft-copilot/using-copilot-vision-with-microsoft-copilot) |
| Copilot Vision regions | Retain all supported Copilot regions/languages with rollout variability. Do not imply every country. | [Vision support](https://support.microsoft.com/en-us/microsoft-copilot/using-copilot-vision-with-microsoft-copilot), [supported regions](https://support.microsoft.com/en-us/microsoft-copilot/supported-regions-and-languages-in-microsoft-copilot) |
| Google AI Pro monthly price | Retain $19.99/month for U.S./USD/monthly billing. Google's August 19 student-offer footnote states this recurring charge after trial; the free trial and bundle valuations are excluded. | [Google announcement and billing footnote](https://blog.google/innovation-and-ai/products/gemini-app/student-offer-google-ai/), [membership billing options](https://support.google.com/googleone/answer/16476811?hl=en) |

## Accepted Copilot correction
Owning source: `data/platforms/copilot.md`.

Replace the paragraph beginning `Copilot Pro is retired` with:

> Microsoft stopped selling Copilot Pro to new customers in October 2025. Existing subscribers can keep their subscriptions or switch to Microsoft 365 Premium. A support-end date for existing subscriptions has not been established by the sources reviewed here.

Replace the two talking-point assertions that Copilot Pro no longer exists with:

> Copilot Pro is closed to new customers; existing subscribers can continue or switch to Microsoft 365 Premium.

Remove the six Copilot Pro feature rows whose unavailable flags are justified only by universal retirement. Add a shared scope note explaining that those rows cover plans available to new customers, and that continuing Copilot Pro subscriptions require separate feature-level entitlement review. Do not flip those six rows to available without feature evidence. Annotate prior change-log claims with a dated correction rather than silently rewriting historical entries. Remove the 2026-08-01 assertion from current prose.

Retain the Premium price, adding `U.S. consumer price in USD; monthly billing` to its pricing note. Record the supporting sources without renewing unrelated feature verification dates.

## Collector follow-up
- Replace the generic Microsoft product URL, which redirected to organizations, with a consumer pricing source for the Premium price.
- Use Vision-specific support for Vision gating and regions.
- The Copilot Pro monitor now separates new sales, existing subscriptions, and support-end evidence, with combined lifecycle assessment explicitly unassessed until multi-source support exists. Absence from pricing and cessation of new sales cannot prove ended support. Reconcile baseline excerpts with accepted source edits and add regression fixtures before another live run.
- Keep Google's configured dynamic pricing source degraded until a deterministic receipt binds the numeric amount to the U.S. monthly plan. The manual supporting source is separate evidence.
- Retain prior failed/partial receipts and create new observations. Do not rewrite the September 6 pilot snapshot or hand-edit its ledger into success.

## Limits
This review did not reverify commercial licensing, Vision/Voice daily allowances, other products, all implementation fields, notification delivery, or operational monitoring. It does not begin the 14-day observation window.

## Implementation verification
Six unsupported plan rows were removed without changing any other plan row. All Checked, Verified, and last_verified values remain unchanged. The scope note is present in human HTML, API implementations, and MCP product results; MCP evidence includes dated correction annotations and first-party sources. Pricing parsing now stops at the actual table, so adjacent lifecycle prose, source links, and changelog entries cannot become phantom plans.
