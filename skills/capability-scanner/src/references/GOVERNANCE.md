---
skill_bundle: capability-scanner
file_role: reference
version: 2.1.0
version_date: 2026-03-07
previous_version: 2.0.0
change_summary: >
  Updated the governance snapshot for the semver-based v2.1.0 bundle and
  paired it with a separate scan-workflow reference.
---

# Governance Snapshot

This file captures the current editorial model for the AI Capability Reference.

Use it when a candidate is ambiguous or when you need the current canonical
rules without consulting the repo directly.

## Core Orientation

The project is ontology-first, not taxonomy-first.

Start by asking:

- What kind of thing is this?
- Who can actually use it?
- Does tracking it help the audience understand capabilities, access,
  constraints, or deployment choices?

Do not start by asking which bucket it belongs in.

## Audience

The reference is built for:

- AI learners
- facilitators and educators
- professionals comparing what their current AI access enables
- people trying to understand plan entitlements, constraints, and alternatives

## Scope Heuristic

The project covers:

- major consumer-facing AI products with meaningful public usage or visibility
- commercially available AI systems that ordinary people can sign up for and use
- important self-hosted/open model families and runtimes that people can
  realistically run or choose locally

The project does not try to catalog the whole AI industry.

Treat `~1% market share` as a practical inclusion heuristic, not a hard rule.
Public usage data is messy and usually measured at the product level rather
than the model level.

## Core Entity Types

### Capability

A plain-English thing a person wants to do.

Examples:

- `search-the-web`
- `speak-back-in-real-time`
- `organize-work-in-projects`
- `use-files-i-provide`

### Implementation

A product- or vendor-specific mechanism that delivers one or more capabilities.

Examples:

- ChatGPT Advanced Voice
- Claude Projects
- Gemini Live
- Perplexity Pro Search

### Product

A user-facing container where implementations live.

Examples:

- ChatGPT
- Claude
- Gemini
- Copilot
- Perplexity
- Grok
- Ollama
- LM Studio

### Provider

The organization behind a product.

Examples:

- OpenAI
- Anthropic
- Google
- Microsoft
- Perplexity
- xAI
- Meta
- Mistral

### Plan

The entitlement layer controlling access.

Examples:

- Free
- Plus
- Pro
- Team
- Enterprise

### Surface

Where a user accesses the product or implementation.

Examples:

- web
- desktop
- mobile
- terminal
- API
- Excel
- browser extension

### Deployment Mode

How the thing runs.

Examples:

- hosted SaaS
- self-hosted
- local-on-device
- embedded-in-suite

### Model Access

The model or model family exposed to the user, when model choice materially
matters.

Examples:

- Llama
- Qwen
- DeepSeek
- Mistral Small

### Constraint

Anything that limits or shapes real-world use.

Examples:

- plan requirement
- rate limits
- region restrictions
- file-size limits
- hardware requirements

### Evidence

The support for claims in the reference.

Examples:

- official sources
- verified date
- checked date
- changelog
- uncertainty notes

## Current Capability Taxonomy

### Understand

- `read-text-and-documents`
- `see-images-and-screens`
- `hear-audio-and-speech`

### Respond

- `write-and-explain`
- `speak-back-in-real-time`

### Create

- `make-and-edit-documents`
- `write-and-edit-code`
- `generate-images`
- `generate-video`

### Work With My Stuff

- `use-files-i-provide`
- `organize-work-in-projects`
- `remember-context-over-time`

### Act For Me

- `search-the-web`
- `do-multi-step-research`
- `take-actions-and-run-tools`

### Connect

- `connect-to-external-systems`
- `build-reusable-ai-workflows`

### Access Context

- `use-it-on-my-surfaces`

## Inclusion Guidance By Record Type

### Provider

Include when the provider already has a tracked record, is materially relevant
to the audience, or is an important teaching/demo comparison point.

### Product

Include when it is a meaningful user-facing container that ordinary people can
sign up for, use, or encounter, or when it is a runtime that materially changes
local/self-hosted choices.

### Implementation

Include when it changes what a user can actually do, access, or compare.

### Model Access

Include when the model family is meaningfully selectable, runnable, or
comparable for the audience, and is commercially available or practically
accessible to an ordinary user.

## Exclusion Guidance

Usually exclude:

- enterprise-only infrastructure with little relevance to end-user choices
- API-only changes without user-facing impact
- vague marketing claims
- obscure releases with weak audience relevance
- records better represented as notes or constraints

## Open / Self-Hosted Rule

Do not treat open or self-hosted systems as one catch-all category.

Model families belong under `Model Access`.
Runtimes like Ollama or LM Studio belong under `Product`.
Local API, terminal access, and hardware needs are usually `Surface`,
`Deployment Mode`, or `Constraint`.

## Current Tracked Set

Consumer-facing products:

- ChatGPT
- Claude
- Copilot
- Gemini
- Perplexity
- Grok

Self-hosted runtimes:

- Ollama
- LM Studio
- text-generation-webui

Tracked open model families:

- Llama
- Mistral
- DeepSeek
- Qwen
- Codestral

## Recommendation Meanings

- `ADD`: strong case for a new active record
- `UPDATE`: existing tracked record should change
- `WATCH`: plausible candidate, but evidence or fit is not strong enough yet
- `SKIP`: does not meet current scope or is not a clean ontology fit

Use `WATCH` for borderline candidates instead of forcing them into the active set.
