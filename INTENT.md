# AI Tool Watch intent
## What this product is
AI Tool Watch is a structured, evidence-backed reference for what consumer AI products can do, on which plans, on which surfaces, and under which constraints. It covers hosted consumer AI products from providers with roughly 1% or greater public market share: currently ChatGPT, Claude, Gemini, Copilot, Perplexity, and Grok. Self-hosted runtimes and open-model access records were frozen into an archived section on 2026-10-11 (see Status and review). It publishes a generated static website, JSON API, and read-only MCP server at https://aitool.watch/. It is owned by Snap Synapse LLC and MIT-licensed.
## Why it exists
Vendor pricing and help pages describe only their own products, often in vague terms, and change without notice. Comparison articles decay after publication. AI assistants answering at query time routinely present wrong plan and feature information as correct. AI Tool Watch holds current information in a persistent place: one reference where each claim carries its source and the date it was last verified. The original rationale is in [design/WHY_THIS_EXISTS.md](design/WHY_THIS_EXISTS.md); its competitive claims are dated March 2026 and are partly superseded (see Competitive position below).
## Design invariants
1. Current information in a persistent place. AI Tool Watch is a reference, not a news site. It records the settled current state, not announcements, rumors, or rollouts in progress. Any separate change stream must not alter the core reference.
2. Stated age per claim. Every gated claim shows its last-verified date and its primary source. Staleness is disclosed at the point of the claim, never hidden. No fixed maximum age is promised.
3. Credibility comes from verifiable indicators (dates, primary sources, change history, explicit rollout status, public method), not from the maintainer's identity.
4. Human review before publication. Automated verification proposes changes; it does not publish factual corrections on its own.
5. Neutrality. No vendor sponsorship, paywalled data, or vendor relationships that would compromise the reference.
6. `data/` is the canonical source. `scripts/build.js` generates `docs/`, the JSON API, and MCP-readable output. `scripts/prepare-publication.js` is the finisher for any data or script change.
7. Zero runtime dependencies. The build uses Node.js built-ins only.
## Scope boundaries
In scope: capabilities, plan gating, surface and platform availability, and constraints for hosted products that meet [design/SCOPE.md](design/SCOPE.md); the ontology; the generator; the website, JSON API, and MCP server; the verification cascade.
Out of scope: self-hosted runtimes and open-model access (frozen and archived 2026-10-11); news or launch coverage; model benchmarks; professional or purchasing advice; enterprise-only products outside SCOPE.md; automated posting or engagement in third-party communities on the project's behalf.
## Audience
In priority order for the 2026 review period:
1. Writers and reviewers who publish AI tool guidance and need a reference they can cite instead of rechecking vendor pages.
2. Agents and builders consuming the JSON API and MCP server.
3. Educators and facilitators running hands-on sessions with participants on mixed subscriptions. This was the original use case. The owner is not currently teaching.
## Status and review
Decided by Sam Rogers on 2026-09-28:
- Maintain AI Tool Watch through 2026-12-31.
- Run one distribution campaign per week, each aimed at one specific person, through that date. Agents may draft outreach; every send requires the owner's explicit approval.
- Review at year end. Continue if at least one campaign target cites or links AI Tool Watch, or if measured use appears.
Decided by Sam Rogers on 2026-10-11, superseding the maintenance terms above but not the year-end review:
- Slim to maintenance. Keep the site, JSON API, and MCP server live.
- Keep the scope line at roughly 1% or greater public market share for hosted products. Lines of 5% and 10% were evaluated and rejected; Copilot, Perplexity, and Grok stay in.
- Drop non-cloud offerings: self-hosted runtimes (Ollama, LM Studio, text-generation-webui) and the 11 open-model access records. Move them to an archived section that states what was frozen, the freeze date, and why. Archived records keep their last-verified dates and are not refreshed.
- Meta AI is added to scope (clears ~1% on app usage, Apptopia September 2026: 17.7% of US consumer chatbot app daily users). DeepSeek's hosted chat is not added.
- Resume the Monday and Thursday scheduled verification and the full multi-model cascade. Weekly distribution campaigns wait until the cascade runs reliably on schedule. The spend bounds (FRESHNESS_* repo variables) are not yet set.
- Execution (data moves, archive page, SCOPE.md, workflow changes) is a separate tranche after main is resynced with origin; nothing has been executed by this record.

Evidence at the 2026-10-11 decision:
- Site analytics 2026-10-03 to 2026-10-11 (PostHog, cookieless, hostname aitool.watch): 67 pageviews, roughly 1 to 13 a day; organic arrivals from Google (4), Yahoo (1), api.microsoft.ai (1), knowledge-as-code.com (2); about 20 pageviews look like crawlers. Cookieless mode does not deduplicate visitors, so counts are pageviews, not people.
- No weekly distribution campaign had been sent since 2026-09-28.
- Share readings used: Similarweb generative AI web visits (August 2026: ChatGPT 55.5%, Gemini 25.6%, Claude 9.3%; June 2026: DeepSeek 3.6%, Grok 2.5%, Copilot 2.0%, Perplexity 1.1%) and StatCounter AI chatbot referrals (worldwide August 2026: ChatGPT 79.4%, Gemini 10.9%, Perplexity 4.31%, Copilot 2.79%, Claude 2.57%). Figures were read from secondary reports and should be rechecked against the primary dashboards.

Known state at the 2026-09-28 decision:
- At the decision date, site and API use were unmeasured, so use was unknown, not zero. GitHub repository traffic is not a substitute.
- Production pages use cookieless PostHog analytics in the shared Snap Synapse project, filtered to the `aitool.watch` hostname. Direct JSON API and MCP use remain unmeasured.
- A 2026-09-07 review found 49 of 72 implementation records with Verified dates older than 30 days. Under invariant 2 this must be visible on the page, not concealed.
- The PAICE portfolio dependency was removed on 2026-09-22 (see Relationships). The `deploy-ftp.yml` workflow still deploys to PAICE.work; whether to retire it is undecided.
## Competitive position
As of 2026-09-28, AI Tool Watch is not the only structured source. Direct overlaps include Artificial Analysis chatbot comparisons (https://artificialanalysis.ai/agents/chatbots), which cover plans, capabilities, connectors, apps, and privacy, and cross-vendor plan matrices such as https://aisubscriptioncomparison.com/tools/feature-matrix/ and https://aipricing.guru/subscriptions/. Trusted human sources in this space are named testers who date their claims (for example Ethan Mollick's periodic guides, Simon Willison, TestingCatalog). A comparison of accuracy, freshness, sourcing, and machine readability against these is pending and should update this section.
## Conformance philosophy
N/A because AI Tool Watch is a reference application, not an open specification. Its data and generated surfaces are tested by the repository validators and the publication manifest.
## Admission criteria for changes
N/A as an open-spec requirement. Data changes follow [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md): edit source, preserve or add evidence, run `node scripts/prepare-publication.js`, and commit source with regenerated output.
## Relationships to other PAICE standards
AI Tool Watch is a Snap Synapse reference, not a PAICE standard. On 2026-09-22 the owner removed it as a strategic PAICE dependency and as an upkeep justification; the authoritative record is `paice-foundation/INTENT.md`, section "AI Tool Watch dependency and maintenance value". Any future PAICE use must name a concrete consumer and unmet need. The project is the origin of the Knowledge-as-Code pattern (https://knowledge-as-code.com/).
## Exceptions to Repo Standards
- GitHub Pages publishes through a GitHub Actions workflow that uploads the verified publication artifact, not branch-folder publishing from `main` `/docs`. Reason: the publication manifest verifies the exact artifact before deploy. Root files, including this document, are not served on the site but are public on GitHub because the repository is public.
- Session handoffs stay local under the gitignored `handoffs/` directory, per the portfolio baseline. Durable decisions from them are migrated here.
## Changelog
- 2026-10-11: Execute the archive part of the slim decision: self-hosted runtimes, the 11 open-model access records, their providers and source files moved to `data/archive/`, rendered on `archive.html` and `api/v1/archive.json`, with old permalinks redirected. Workflows unchanged; adding the Meta AI record and resuming the Monday/Thursday cascade are separate tranches.
- 2026-10-11: Record the owner decision to slim to maintenance, keep the ~1% hosted-product scope line, and freeze self-hosted runtimes and open-model access into an archived section. Add Meta AI to scope; do not add DeepSeek's hosted chat. Resume Monday/Thursday scheduled verification and the full cascade, with weekly campaigns held until it runs reliably; FRESHNESS_* spend bounds not yet set. Execution not started.
- 2026-10-03: Record exact hosted acceptance for commit `6cf6c2d` and prepare a validated local npm/MCP Registry package candidate. Neither npm nor Registry publication is authorized or complete.
- 2026-10-03: Record cookieless PostHog measurement through the shared Snap Synapse project, with website-only scope and hostname isolation.
- 2026-09-28: Create INTENT.md. Record the reference-not-news positioning, stated-age-per-claim currency commitment, audience priority, the maintain-through-2026-12-31 decision with weekly single-person campaigns and its year-end criterion, the current competitive position, and the removal of the PAICE dependency.
