# AI Tool Watch intent
## What this product is
AI Tool Watch is a structured, evidence-backed reference for what consumer AI products can do, on which plans, on which surfaces, and under which constraints. It covers ChatGPT, Claude, Gemini, Copilot, Perplexity, Grok, and self-hosted runtimes. It publishes a generated static website, JSON API, and read-only MCP server at https://aitool.watch/. It is owned by Snap Synapse LLC and MIT-licensed.
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
In scope: capabilities, plan gating, surface and platform availability, constraints, and open-model access for products that meet [design/SCOPE.md](design/SCOPE.md); the ontology; the generator; the website, JSON API, and MCP server; the verification cascade.
Out of scope: news or launch coverage; model benchmarks; professional or purchasing advice; enterprise-only products outside SCOPE.md; automated posting or engagement in third-party communities on the project's behalf.
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
Known state at the decision:
- Site and API usage are unmeasured. The site has no analytics, so use is unknown, not zero. GitHub repository traffic is not a substitute.
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
- 2026-09-28: Create INTENT.md. Record the reference-not-news positioning, stated-age-per-claim currency commitment, audience priority, the maintain-through-2026-12-31 decision with weekly single-person campaigns and its year-end criterion, the current competitive position, and the removal of the PAICE dependency.
