# Scope Rules

Status: Draft 1  
Last updated: 2026-03-07

This document defines what belongs in the AI Capability Reference and what does not.

The purpose is to prevent ontology drift and uncontrolled sprawl as the ecosystem changes.

## Core Rule

Inclusion is not based on whether something exists.

Inclusion is based on whether tracking it materially helps the project audience understand what an AI system can do, what access they already have, and what they would gain by changing tools, plans, or deployment modes.

## Audience Reminder

This project is for:

- AI learners
- facilitators and educators
- professionals comparing what their current AI access actually enables
- people trying to understand plan entitlements, constraints, and alternatives

## Inclusion Rules By Record Type

### Provider

Include a provider when at least one of these is true:

- the repo already tracks one of its products, implementations, or model-access records
- the provider is materially relevant to the audience
- the provider represents an important comparison point in teaching or demos

Do not add a provider just to be exhaustive.

### Product

Include a product when it is a meaningful user-facing container for capabilities, implementations, or deployment experience.

Examples:

- ChatGPT
- Claude
- Gemini
- Copilot
- Ollama
- LM Studio

Do not create a product record when the thing is really:

- only a model family
- only a plan tier
- only a vendor brand umbrella with no clear user-facing container

### Implementation

Include an implementation when it changes what a user can actually do, access, or compare.

Good reasons to track an implementation:

- it unlocks a distinct capability
- it changes plan or entitlement decisions
- it creates an important new workflow or surface
- it is commonly referenced in teaching, demos, or user questions

Do not create an implementation record for:

- generic marketing claims
- model-quality language with no distinct workflow
- every minor naming variation

### Capability

Include a capability when it is:

- plain-English
- user-meaningful
- stable across vendors
- important enough to support user decisions or teaching outcomes

Do not create a capability just because one vendor coined a term for it.

### Model Access

Include a model-access record when:

- the model family is meaningfully selectable, runnable, or comparable for the audience
- it represents an important self-hosted/open alternative
- its access materially changes deployment or capability choices

Do not include model-access records solely to catalog the entire open-model ecosystem.

## Explicit Exclusion Rules

Avoid adding records just because they are:

- newly announced but not meaningfully usable yet
- obscure with no audience relevance
- duplicative of an existing record
- better represented as a constraint or note on another record
- too unstable to maintain at the level of detail required here

## Teaching And Demo Exception

The maintainer's own teaching and demonstration use is a valid reason to include something that might not otherwise qualify.

When that is the main reason for inclusion, note it clearly in the record or supporting docs so future contributors understand why it is in scope.

## Open / Self-Hosted Domain Rule

For open/self-hosted systems, do not treat all entries as one category.

Different types belong differently:

- model families -> `Model Access`
- runtimes like Ollama or LM Studio -> `Product`
- deployment facts like local API or terminal access -> `Deployment Mode` or `Surface`

## Decision Questions

Before adding a new record, ask:

1. What kind of thing is this?
2. Is it materially useful for the intended audience?
3. Does it affect capability understanding, entitlement, comparison, or deployment choice?
4. Is this the cleanest record type for it?

If the answer to those questions is weak, leave it out or record it as a note rather than a new top-level entity.
