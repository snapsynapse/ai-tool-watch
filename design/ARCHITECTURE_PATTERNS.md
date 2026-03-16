# Architecture Patterns: A Plain-Text Knowledge Base with an Immune System

Status: Published draft
Last updated: 2026-03-15

This document describes the architectural patterns at work in this project and how they combine into something that doesn't have a standard name yet. It's written for developers who look at the repo and think "this isn't the normal way to do things" — because it isn't, and that's the point.

---

## The short version

This project is a knowledge base built entirely from markdown files, compiled by a single zero-dependency Node.js script, verified weekly by a cascade of competing AI models, maintained through GitHub's native issue lifecycle, and served as both a static site and a machine-readable JSON API.

No framework. No database. No node_modules. The whole thing is plain text that happens to keep itself accurate.

Each of those choices draws from a named pattern. None of them are new individually. What's unusual is how they compose.

---

## Pattern 1: File-over-App

**What it means:** Data lives in durable, human-readable files — not locked inside an application's database or proprietary format.

**How it shows up here:** Every entity in the system — capabilities, providers, products, implementations, evidence — is a markdown file with YAML frontmatter. The entire dataset can be read, edited, diffed, and searched with tools that existed before this project and will exist after it.

**Why it matters:** The project tracks a fast-moving domain (AI product capabilities) that will outlive any specific tool or framework used to maintain it. Markdown is a 20-year bet. A SQLite database is a 5-year bet. A SaaS backend is a 2-year bet. When the maintainer gets hit by a bus, the data should still be legible to whoever picks it up — human or AI.

This isn't anti-database dogma. It's a pragmatic choice for a single-maintainer project where contributor friction is the binding constraint. A contributor can fix an error with a one-file PR and never install anything.

**The pattern's lineage:** Steph Ango (Obsidian) articulated this as "file over app." The principle is older — it's the Unix philosophy of text streams, extended to knowledge management.

---

## Pattern 2: Docs-as-Code

**What it means:** Structured content is managed with the same rigor as source code: version-controlled, validated in CI, peer-reviewed via pull requests.

**How it shows up here:** Every data file is validated by `scripts/validate-ontology.js` on every push. Cross-references are checked (does this implementation point to a real capability?). Naming conventions are enforced. URLs are validated weekly. Secret scanning runs on every commit. The markdown *is* the codebase.

**Why it matters:** Knowledge bases rot. Wikis rot faster. The only reliable way to keep structured information accurate is to treat accuracy as a CI concern — something that blocks merges when it fails, not something you notice six months later.

**The pattern's lineage:** Docs-as-code has been standard practice in API documentation (Stripe, Heroku) and infrastructure-as-code (Terraform, Kubernetes) for years. Applying it to a knowledge base about AI products is less common but follows the same logic.

---

## Pattern 3: Zero-Dependency / Vendorless Architecture

**What it means:** The build toolchain has no external dependencies. No package.json. No node_modules. No supply chain.

**How it shows up here:** The entire site generator is `scripts/build.js` — one file, ~3,500 lines, using only Node.js built-ins (`fs`, `path`). It reads markdown, parses YAML frontmatter and tables, builds cross-references, and emits HTML + JSON. The MCP server (`scripts/mcp-server.js`) is similarly self-contained — ~270 lines, zero dependencies, reading from the generated JSON artifacts. That's the whole stack: two scripts and the Node.js runtime.

**Why it matters:** Dependencies are liabilities. Every `npm install` is an implicit trust decision about hundreds of transitive packages. For a project that will be maintained sporadically by a single person — potentially with long gaps between sessions — the cost of keeping dependencies current exceeds the value of what they provide. When you come back to this repo in 18 months, `node scripts/build.js` will still work. `npm install && npm run build` probably won't.

There's a second reason: auditability. The build script is long, but it's *one file*. You can read every line of code that touches your data. That's not true of any framework-based static site generator.

**The pattern's lineage:** This is the old-school approach — before bundlers, before package managers, before the JavaScript ecosystem decided that left-padding a string required a dependency. It's making a quiet comeback among developers who've been burned by build toolchain rot.

---

## Pattern 4: Ontology-Driven Design

**What it means:** The system is organized around a formal model of what things *are* and how they relate — not around how they're displayed or what pages exist.

**How it shows up here:** The project defines six entity types (Provider, Product, Implementation, Capability, Plan, Surface) with explicit relationships. Capabilities are stable, vendor-neutral descriptions of what a user can do ("search the web," "generate images"). Implementations are vendor-specific features mapped to those capabilities. The HTML pages are views derived from the ontology — not the other way around.

This distinction matters in practice. When Google renames "Bard" to "Gemini," that's a product-level change that doesn't touch any capability definitions. When OpenAI adds image generation to ChatGPT Free, that's a plan-level availability change on an existing implementation. The ontology absorbs these changes without structural rewrites because it models the domain at the level where things are actually stable.

**Why it matters:** AI product features change names, packaging, and availability constantly. A taxonomy-first approach (organizing by categories like "coding" or "voice") breaks down quickly — is a coding agent a "coding" feature or an "agents" feature? An ontology-first approach doesn't have this problem because it models what things *are*, not which bucket they go in. Buckets are a presentation concern.

**The pattern's lineage:** This is knowledge engineering — the discipline of building formal models of a domain. It's standard practice in biomedical informatics, library science, and semantic web work. It's unusual in a small open-source project built by one person with markdown files. But the problem is the same: model a domain where the surface vocabulary changes faster than the underlying structure.

---

## Pattern 5: Bespoke Static Site Generation

**What it means:** The site generator is purpose-built for this exact data model — no plugin system, no theme layer, no generalization.

**How it shows up here:** `build.js` knows about capabilities, implementations, providers, products, plans, surfaces, and evidence. It knows how to render a capability card, an availability matrix, a constraint table, a comparison view, and 125 SEO bridge pages with schema.org structured data. It generates 6 HTML pages, 125 bridge pages, 10 JSON API files, and a dynamic sitemap. That's all it does, and it does it in one pass.

**Why it matters:** General-purpose SSGs (Hugo, Jekyll, Eleventy) are designed to be flexible. Flexibility means configuration, plugins, template languages, and build pipelines — all of which are things to learn, maintain, and debug. A bespoke generator trades flexibility for simplicity: there is no configuration because there are no options. The code *is* the specification.

This makes the generator easy to extend. Adding 125 bridge pages with four different structured data schemas was a single function addition — no template engine, no plugin API, no routing configuration. The MCP server was a second script that reads the same JSON output. Want to add another view? Add a function that reads the same data structures and emits HTML. There's no framework to fight.

**The pattern's lineage:** Every developer has written a one-off script that turned data into HTML. The difference here is that this is the *production* approach, not a prototype. It works because the data model is stable enough that a general-purpose framework's flexibility isn't needed.

---

## Pattern 6: GitOps

**What it means:** Git is the single source of truth. All state changes happen through commits. All derived state is produced by CI pipelines that react to those commits.

**How it shows up here:**

- Push to main and scheduled builds (Mon/Thu at 6pm Pacific) trigger `build.yml`, which regenerates the site and commits the result
- The generated `docs/` directory is checked into the repo (not built on deploy) so that the dashboard is always inspectable in git history
- Verification updates are committed by `github-actions[bot]` with full audit trail
- Issues are created and closed through the GitHub API, linking back to the commits that resolved them

There is no deployment step that isn't a git push. There is no state that isn't in the repo. If GitHub disappeared tomorrow, the full history — data, generated site, verification reports, issue resolution rationale — lives in the git clone.

**Why it matters:** For a knowledge base, auditability is a feature. When someone asks "why does this say ChatGPT Search is available on Free?" the answer is in `git log`. When someone asks "when was this last verified?" the answer is a date field that was updated by a commit authored by a CI bot that ran a verification cascade. The provenance chain is unbroken from claim to evidence to automation to commit.

**The pattern's lineage:** GitOps was formalized by Weaveworks for Kubernetes deployments. The principle — desired state in git, reconciliation by automation — applies equally well to knowledge management.

---

## Pattern 7: Multi-Agent Consensus Verification

**What it means:** Multiple independent AI models are queried about the same factual claim, and changes are only flagged when a supermajority agrees.

**How it shows up here:** Every week, a GitHub Action runs `verify-features.js`, which queries up to four LLMs (Gemini, Perplexity, Grok, Claude) about every tracked feature. The cascade has three key design constraints:

1. **Bias exclusion:** A model is never asked about its own vendor's products. Gemini doesn't verify Google features. Claude doesn't verify Anthropic features.
2. **Consensus threshold:** Three out of four models must independently report the same change before it's flagged. One model's opinion is noise. Three is signal.
3. **Human gate:** Even confirmed changes create issues or PRs for review — they are never auto-merged.

The cascade is ordered by cost and speed (Gemini Flash first, Claude last) so that features with no changes exit early and cheaply.

**Why it matters:** AI models hallucinate. Any single model's claim about a competitor's product is unreliable. But *correlated* hallucination across models from different vendors, trained on different data, with different incentive structures, is much less likely. The consensus mechanism turns individually unreliable sources into a collectively useful signal — the same principle behind Byzantine fault tolerance in distributed systems.

**The pattern's lineage:** Multi-source verification is standard in journalism (two-source rule) and distributed systems (quorum protocols). Applying it to LLM outputs is newer. The closest analogue is ensemble methods in machine learning, but the key difference is that these models are *deliberately diverse* — different vendors, different training data, different biases — rather than variations of the same architecture.

---

## Pattern 8: Reconciliation Loop

**What it means:** The system continuously compares its current state against observed reality and generates work items to close the gap.

**How it shows up here:** The automation layer implements a classic reconciliation loop:

1. **Desired state:** Every feature record is accurate and recently verified
2. **Observe:** The verification cascade probes external reality (what do the AI products actually offer right now?)
3. **Diff:** Compare observations against stored data
4. **Reconcile:** Create GitHub issues for discrepancies; update timestamps for confirmations
5. **Repeat:** Weekly

Link checking follows the same pattern: desired state is "all URLs resolve," observation is HTTP requests, discrepancies become issues.

Staleness checking is the simplest form: if a feature hasn't been verified in 30+ days, it's drifting from desired state, and an issue is created.

**Why it matters:** Knowledge bases don't just go wrong when someone makes an edit error. They go wrong by *doing nothing* — the world changes and the data doesn't. A reconciliation loop inverts the default: instead of the data being assumed correct until proven wrong, it's assumed stale until re-verified. Silence is not confirmation.

**The pattern's lineage:** This is the Kubernetes controller pattern: observe, diff, reconcile, repeat. It's also how Terraform works (plan shows drift, apply closes it). The insight is that it applies to knowledge just as well as to infrastructure.

---

## Pattern 9: Human-on-the-Loop

**What it means:** Automation runs autonomously and surfaces findings. Humans review and approve state changes. This inverts "human-in-the-loop," where humans do the work and AI assists.

**How it shows up here:** The verification cascade, link checker, and staleness monitor all run without human intervention. They produce structured outputs: issues with labels, reports with evidence, PRs with changelogs. The human's job is to review, not to initiate.

The `resolve-issue` skill formalizes the human review step: it fetches the issue, checks internal data consistency, researches via external sources, and proposes changes — but the human makes the final call.

**Why it matters:** The project tracks ~72 implementation records across ~9 products. Manually verifying each one weekly is not realistic for a single maintainer. But fully automated updates are dangerous — LLMs can and do get facts wrong. Human-on-the-loop is the viable middle ground: automation does the tedious work (checking if things have changed), humans do the judgment work (deciding if the reported change is real and how to record it).

**The pattern's lineage:** Human-on-the-loop is established terminology in autonomous systems (military, robotics, self-driving). The application to knowledge maintenance is the same principle: let the machine do the monitoring, keep the human for the decisions.

---

## How they compose

Each pattern is useful on its own. The thing that makes this project architecturally interesting is how they combine into a single coherent system:

```
FILE-OVER-APP (durable plain-text data)
  + DOCS-AS-CODE (CI-validated, PR-reviewed)
  + ONTOLOGY-DRIVEN (formal entity model)
  = A knowledge base that's both human-readable and machine-rigorous

ZERO-DEPENDENCY BUILD (no supply chain)
  + BESPOKE SSG (purpose-built generator)
  + GITOPS (all state in git, all changes via commits)
  = A build pipeline that will still work in five years

MULTI-AGENT CONSENSUS (bias-resistant AI verification)
  + RECONCILIATION LOOP (continuous drift detection)
  + HUMAN-ON-THE-LOOP (automation monitors, humans decide)
  = A self-maintaining knowledge system that doesn't auto-corrupt
```

The bottom layer (files + ontology) provides a stable foundation that any tool can read. The middle layer (build + GitOps) ensures that foundation reliably produces outputs. The top layer (verification + reconciliation + human review) keeps the foundation accurate over time.

Remove any one layer and the system still works — it just loses a property:

- Without the verification cascade, it's a well-structured static site that rots like any wiki
- Without the ontology, it's a collection of markdown files that work until the domain's vocabulary shifts
- Without GitOps, changes happen but provenance is lost
- Without the zero-dependency build, it works today but may not build next year

Together, they produce something that has a rare combination of properties for a knowledge system: **it's durable** (plain text, no dependencies), **it's rigorous** (formal ontology, CI validation), **it's self-aware** (knows when it's stale), and **it's honest** (every claim has a verification date and a provenance chain).

---

## What to call it

There isn't an established name for this combination. The closest candidates:

- **"Agentic knowledge engineering"** — captures the AI-in-the-loop verification, but undersells the file-first durability
- **"GitOps knowledge base"** — captures the operational model, but undersells the ontology
- **"Self-healing knowledge system"** — captures the reconciliation loop, but overstates the autonomy (humans are still in the loop)
- **"File-over-app knowledge engineering"** — captures the durability philosophy, but undersells the automation

If forced to pick a label: **a plain-text knowledge base with an immune system.**

It doesn't heal itself. It detects its own infections, diagnoses them with multiple independent tests, and presents the findings to a human who decides on treatment. The immune metaphor is imperfect — all metaphors are — but it captures the essential property: this is a system that actively resists the entropy that kills every other knowledge base.

---

*This document describes the architecture as of March 2026. The patterns are stable; the specific implementations will evolve.*
