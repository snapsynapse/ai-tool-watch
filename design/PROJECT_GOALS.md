# Project Goals

This document captures the intent, philosophy, and direction of AI Capability Reference. It exists to help humans and LLMs collaborate on this project with a shared understanding of what we're building and why.

Other docs cover the **how**: [README.md](README.md) (overview), [CONTRIBUTING.md](CONTRIBUTING.md) (workflow), [VERIFICATION.md](VERIFICATION.md) (automated checking), [data/_schema.md](data/_schema.md) (data format). This document covers the **why**.

---

## Origin

This project was built by a single person preparing to teach a class called "AI for Learning & Development." The core pain point: students show up with different AI subscriptions, on different platforms, and nobody — including the instructor — can confidently answer "what do you actually have access to right now?"

This information should be easy to find. It isn't. Vendor pricing pages are optimized for conversion, not clarity. Feature names are marketing constructs. Availability changes constantly. The result is that people trying to *use* AI tools spend unreasonable time just figuring out what they can and can't do.

The project started as a personal reference and became a public dashboard after nobody could point to anything else that already solved this problem.

## Who this is for

People and agents trying to understand AI tools. Specifically:

- **Educators and facilitators** who need to know what their students/participants can access
- **Individuals** trying to understand what they're paying for (or what they'd get if they upgraded)
- **Teams** evaluating which AI tools fit their budget and platform constraints
- **Developers** building tools, integrations, or agents that need structured data about AI product availability
- **AI agents** that need to answer questions about what AI tools can do, via the JSON API or MCP server
- **Anyone** tired of parsing marketing pages to find a straight answer

The project serves both human and machine consumers. The site and bridge pages are the human interface. The JSON API and MCP server are the agent interface. Both are first-class access layers backed by the same canonical data.

## Core philosophy

### Useful truth over marketing truth

Vendors describe their products in terms designed to sell. This project describes them in terms designed to be *useful*. That means:

- If a feature is "available" but rate-limited to the point of being impractical, we say so
- If something is technically in "beta" but works reliably, we note that too
- Limits, caveats, and regional restrictions are first-class information, not footnotes

### Accuracy over completeness

It's better to have 7 well-maintained platforms than 20 stale ones. It's better to say "we haven't verified this recently" (via the Checked/Verified date system) than to present outdated information as current.

### Low barriers to contribution

The entire data layer is markdown files. No database, no build dependencies beyond Node.js, no framework to learn. A contributor can fix an error with a single-file PR.

## The information model

The project describes AI tools at three levels of abstraction. All three layers are about *the AI tools themselves* — how they perceive, what they can do, and how vendors package access.

### Perceptions (how an AI tool perceives its inputs)

The foundational layer. AI systems take in information through distinct perceptual modalities — and these work very differently from human perception, in ways that matter for practical use.

**Text** is the native modality for current LLMs. Input is tokenized into subword units and mapped to vector embeddings, then processed through attention mechanisms. This is what the architecture was designed for — the lowest-friction pathway.

**Images** require a separate perceptual engine. A vision encoder (typically a Vision Transformer) splits images into patches, creates embeddings for each patch, and projects them into the same representation space as text. It's architecturally a different pathway. This is an important inversion from human experience: for humans, visual perception is the low-effort, high-bandwidth channel we evolved for. For LLMs, text is native and vision is translated *into* that space.

**Audio** varies by model. Some systems process audio natively with a dedicated encoder. Others transcribe speech-to-text first — meaning the AI's "perception" of your voice is actually a lossy translation step before reasoning even begins.

Why this matters for users: the perceptual mode shapes what the AI does well. An AI that "sees" an image by converting patches to vectors will have different strengths and failure modes than a human looking at the same image. Understanding this helps people work with AI tools more effectively — not by anthropomorphizing them, but by building an accurate mental model of how the tool processes what you give it.

This layer is aspirational. The goal is to describe each platform's perceptual modalities honestly — what input types it handles, through what mechanisms, and with what practical implications.

### Capabilities (what an AI tool can actually do)

The middle layer. Given its perceptual modalities, what can the tool do? "Analyze uploaded PDFs," "generate images from text prompts," "execute code in a sandbox," "search the web for current information." These are underlying abilities that exist across platforms under different names. This layer is organized by what the AI can do, not what any vendor calls it.

A capability like "document analysis" depends on the perceptions layer (can the model perceive PDFs? through OCR, native parsing, or vision?) and feeds into the implementations layer (which vendor products expose this capability, under what names, on which plans?).

### Implementations (how a vendor packages and gates an AI's capabilities)

The outermost layer. Named product implementations — "Artifacts," "Canvas," "Deep Research," "Custom GPTs" — with per-plan availability, platform support, status, and sourced verification dates. This is vendor-specific: it reflects how each company names, bundles, and restricts access to the underlying capabilities.

### How they relate

The layers build from inside out: perceptions (how the AI takes in information) enable capabilities (what it can do with that information), which are packaged into implementations (how vendors name, bundle, and gate access).

A single thread might look like: a model's vision encoder can process image patches (perception) → this enables it to analyze uploaded documents (capability) → which surfaces as "Vision" on ChatGPT, "File uploads" on Claude, "Document understanding" on Gemini (implementations) — each with different plan availability, limits, and platform support.

The capabilities and implementations layers are now operational. The repo has 18 first-class capability records in `data/capabilities/`, 71 implementation records mapped to capabilities in `data/implementations/index.yml`, and the build generates both a capability-first homepage and an implementation-first detailed availability view from the same canonical source. The perceptions layer remains aspirational.

## Scope

### Current platform criteria

The initial set of 7 platforms was chosen pragmatically: the tools discussed in the class being taught, plus some open-weight models the maintainer uses. There is no formal inclusion/exclusion rubric yet.

Products tracked: ChatGPT (OpenAI), Claude (Anthropic), Copilot (Microsoft), Gemini (Google), Perplexity, Grok (xAI), Ollama, LM Studio. Model-access records also cover Llama, Mistral, DeepSeek, and Qwen families.

### What we track

Consumer-facing AI product capabilities, with emphasis on:

- Which subscription tier unlocks access
- Which operating systems and surfaces are supported
- What limits and caveats apply
- Current release status (GA, beta, preview, deprecated)
- When information was last verified and by whom

### What we don't track

- API-only capabilities (unless they have a consumer-facing interface)
- Enterprise/custom pricing (tracked only as "org-only" gating)
- Model benchmarks or quality comparisons
- Pure developer SDKs and libraries (with the exception of tools like Claude Code that serve both developer and consumer audiences)

## The implementation vs. capability distinction

Some tracked items are clearly product implementations (e.g., "Custom GPTs," "Artifacts"). Others are closer to capabilities (e.g., "Vision," "Voice Mode"). The project now resolves this through an explicit ontology:

1. **Capabilities** (`data/capabilities/`) define plain-English things a person wants to do, stable across vendors
2. **Implementations** (`data/implementations/index.yml`) map vendor-specific features to one or more capabilities
3. **The legacy `Category` field** remains in platform markdown for backward compatibility but is not the canonical taxonomy

The capability-first homepage and the implementation-first detailed availability view are both generated from the same canonical data. See [ONTOLOGY.md](ONTOLOGY.md) and [CAPABILITY_TAXONOMY.md](CAPABILITY_TAXONOMY.md) for details.

## Sustainability

This is an unfunded side project. There is no revenue model and likely never will be. Its value is measured in time saved and confusion reduced for the people who use it.

The aspiration is for it to become community-maintained. Realistically, it currently depends on a single maintainer. The verification cascade, staleness checks, and low-friction contribution model are all designed to reduce the maintenance burden and make community contribution viable — but the project is honest about where it stands.

## Multi-LLM collaboration model

This project is designed to be worked on by multiple AI coding assistants, not just one. The approach mirrors the bias-prevention logic in the verification cascade:

- **Claude (Anthropic)** should not be the sole author of Claude/Anthropic feature data
- **Codex or ChatGPT (OpenAI)** should not be the sole author of ChatGPT/OpenAI feature data
- And so on for each vendor's AI assistant and their own platform's data

In practice, this means:

- Any LLM can work on project infrastructure, build scripts, the dashboard UI, documentation, and cross-platform features
- For vendor-specific feature data, prefer having a *different* vendor's LLM do the work, or flag it for human review
- The human maintainer is the tiebreaker and final reviewer for all changes

This is the same principle as the verification cascade's skip rules, applied to development instead of fact-checking.

### Current agent roles

| Agent | Role | Scope |
|---|---|---|
| **Claude (Anthropic)** | Author | Infrastructure, UI, docs, and feature data for all platforms *except* Anthropic/Claude |
| **Codex (OpenAI)** | Author | Infrastructure, UI, docs, and feature data for all platforms *except* OpenAI/ChatGPT |
| **Gemini (Google)** | Reviewer | Asynchronous review of data accuracy, cross-platform consistency, and schema coherence — not on the critical path for authoring |

Gemini's reviewer role extends the pattern already established in the verification cascade, where Gemini is model #1 for web-search-based fact-checking. As a reviewer rather than author, it avoids adding coordination overhead or merge conflicts to time-sensitive work.

**Gemini review scope:**

- **Data accuracy** — "Is this feature still available on this plan?" (overlaps with existing verification cascade)
- **Cross-platform consistency** — "ChatGPT's Vision entry describes X, but Claude's describes Y for the same underlying capability — is the difference real or a data error?"
- **Tool Check validation** — "Does this discriminator question still work? The UI may have changed"
- **Schema coherence** — "The schema says Category values are X, but this file uses Y"

The signal-to-noise contract matters: Gemini review should only surface findings it has high confidence in, similar to the 3-confirmation threshold in the verification cascade. The goal is to reduce the maintainer's review burden, not add to it.

### Working with this project as an LLM

If you're an AI assistant picking up this project:

1. Read this document and [CONTRIBUTING.md](CONTRIBUTING.md) first
2. Check [data/_schema.md](data/_schema.md) for the data format
3. The build is `node scripts/build.js` — run it to validate your changes produce working HTML
4. Be skeptical of your own knowledge about AI platform features — things change fast. Prefer sourced information over training data
5. If you're editing feature data for your own vendor, say so explicitly in the commit message or PR description so the human reviewer knows to double-check

## Priorities

1. **Keep the current data accurate** — this is always the top priority
2. **Maintain the ontology-backed shared model** — capability-first and feature-first remain two views over one system
3. **Reduce maintainer burden** — anything that makes it easier for others to contribute or for automation to stay current

See [ROADMAP.md](ROADMAP.md) for current project status and outstanding work.

Everything else is secondary to those priorities.

---

*This document was written collaboratively by the project maintainer and Claude (Anthropic) in February 2026. It should be updated as the project's direction evolves.*
