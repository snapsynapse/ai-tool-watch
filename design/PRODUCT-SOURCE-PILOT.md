# Official product-source monitoring pilot

T08 observes two products, Microsoft Copilot and Gemini, through three fixed official source families each: release/change notes, pricing, and support. It produces cited field-level review proposals using the portable freshness contract. It never edits product records, Checked/Verified dates, accepted entitlements or generated public output.

## Selection and scope

Copilot's September 5 material-change commits (`740d044`, `6baa5d8`, `935475f`) replaced retired Copilot Pro entitlements and clarified the distinction between subscription usage and model routing. Gemini's August 31 change (`fc42c2b`) added native Mac availability. These are concrete regression cases for plan, surface, region and withdrawal monitoring.

Each adapter declares precise fields, owning file/feature/table targets, typed comparison values and exact baseline excerpts. The collector checks those excerpts in the owning feature before using the comparison value. If an accepted edit changes the baseline, the old adapter stops qualifying that field until its definition is reconciled. Proposed values remain human review material, not ready-to-apply patches.

The pilot covers only configured claims on the six pages. It does not assert complete product coverage. A release entry can prove a historical launch; current support evidence has a separate receipt and must establish current availability. Missing text does not prove withdrawal. An app's general desktop support does not prove every feature is available on that desktop. Region, plan, currency and billing-period qualifications must remain attached to their claims.

## Collection and review

Entry point: `node scripts/observe-product-sources.js --live`. Optional `--state` and `--reports` select local paths. Defaults are `data/maintenance/product-monitor-state.json` and a new ignored `.verification-reports/product-monitor-*` directory. The evidence directory must be empty. Each run makes at most six fetch attempts, with no implicit retry, no paid providers, at most three same-host HTTPS redirects per source, 30-second request limits and a 5 MB response limit. This manual pilot inspects all six configured sources; due-based scheduling is deferred.

Raw bytes and hash-bearing receipts precede assessment. Reports and review snapshots are retained before durable state advances. Fetch, parser, content-validation, baseline or persistence failures stay visible. Valid subsets of a page can yield proposals while the source remains partial. Complete source coverage requires every configured claim. Empty or failed later reads never close prior pending reviews.

Comparison hashes include field values rather than whole-page HTML or navigation text. Cosmetic markup, whitespace and navigation do not create findings. Conflicting duplicate claims fail closed. An unchanged proposal retains its original finding identity and review age. Existing model-cascade state remains in its existing ledger; this pilot has a separate ledger with the same portable schema.

Review owner is Sam Rogers. Capacity may be supplied through the existing `FRESHNESS_REVIEW_MINUTES_PER_WEEK` input; absent capacity remains unknown and the review queue reports degraded readiness. Exit codes are 0 healthy, 1 review required and 2 degraded/failed. These local artifacts do not prove email receipt, independent missed-run detection or hosted execution.

## Remaining source families

| Family | State after this pilot | Next bounded work |
|---|---|---|
| Copilot and Gemini official product pages | Six selected URLs, configured claims only | Resolve live extraction/access gaps before scheduling |
| Remaining seven products | Deferred | Select one product's release/pricing/support bundle per session |
| Provider catalogs | Deferred, separate from consumer plan entitlements | Official provider model IDs, availability and deprecation dates; no inference from a product subscription |
| Runtime releases | Deferred | Ollama, LM Studio and text-generation-webui release/install compatibility, with runtime/platform version evidence |
| Model-access records | Deferred | Reconcile the 11 current records with provider catalog evidence and access path; product availability and API availability remain separate |
| Existing 72 implementations and 92 evidence records | Existing coverage inventory, not wholly checked here | Reconcile and admit per-field proposals through T12's review-to-publication loop |

The existing pending issue backlog and T02b email/independent-observer/receipt work remain open. A green local test suite does not close these delivery requirements.

## September 6 pilot evidence

The live collector ran on September 7 UTC and fetched all six configured URLs, with zero paid-provider calls. Hash-verified offline replay of the same bytes produced the accepted pilot report:

| Product | Source | Result |
|---|---|---|
| Copilot | Microsoft app changes | Covered: explicit free Chat availability |
| Copilot | Microsoft pricing | Unavailable: no configured, qualified Premium price or dated Pro retirement claim in this response |
| Copilot | Microsoft entitlement support | Partial: explicit free Chat availability; Vision gating and region remain unproven |
| Gemini | Official release notes | Covered: native Mac app launch month, April 2026, as historical evidence only |
| Gemini | Google AI Plans pricing | Unavailable: no qualified headline subscription price; bundled benefit values are excluded |
| Gemini | Mac support | Covered: current native app availability and minimum macOS 15 requirement |

The result is degraded: three covered sources, one partial, two unavailable, and five proven claims out of ten configured claims. There are no valid field-change proposals in the corrected replay. This does not mean the products have no other changes. Each missing claim remains named in the report. Review owner is Sam Rogers and review capacity remains unknown.

The first live parser pass produced two invalid Gemini candidates: it treated a Spark feature announcement as the native app launch and a bundled Google Home benefit value as the plan price. Both defects were fixed against retained bytes and added to regression fixtures. The initial report and generated ledger remain under `.verification-reports/t08-pilot-2026-09-06/`, explicitly marked invalid for review by `invalid-output-notice.json`. Only this tranche's newly generated, uncommitted ledger was rebuilt after checking that it contained exactly those two unreviewed invalid findings; existing review state and accepted data were preserved.

The corrected report and full claim quotations are under `.verification-reports/t08-corrected-replay-2026-09-06/`. Compact evidence and exact configured targets are retained with the pilot in `design/evidence/product-source-pilot-2026-09-06.json`; durable source observations are in `data/maintenance/product-monitor-state.json`. The replay made zero network calls and verified each original response hash. Three extraction/coverage gaps remain for the next source-adapter scope: Microsoft pricing/retirement evidence, Vision-specific support/region evidence, and Google's dynamic headline pricing.

## Validation and delivery boundary

All 277 offline tests passed, including 39 product-monitor tests. Ontology, talking-point claim and generated structured-data validators passed. The unrelated live link-smoke suite was excluded. Existing tracked corpus and generated public files were unchanged.

T08 is a local implementation and bounded live-source pilot. Scheduling, publication and notification delivery are not activated. T02b email/independent-observer/receipt acceptance and T06 New York/Malaysia access gaps remain open. The next base tranche is T09, AI Incident Law development and discovery queues.
