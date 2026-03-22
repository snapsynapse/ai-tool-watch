# Ontology-Aligned Schema

Status: Implemented
Last updated: 2026-03-15

This document describes the ontology-aligned schema that replaced the feature-first-only markdown layout. The schema was implemented incrementally, introducing the smallest set of first-class records that:

- fit the ontology cleanly
- preserve current verification/evidence workflows
- keep the legacy dashboard working alongside the capability-first view
- make capability-first views possible

## Governing Inputs

This proposal follows:

- [ONTOLOGY_FIRST.md](ONTOLOGY_FIRST.md)
- [ONTOLOGY.md](ONTOLOGY.md)
- [CAPABILITY_TAXONOMY.md](CAPABILITY_TAXONOMY.md)
- [MIGRATION_STRATEGY.md](../data/archive/MIGRATION_STRATEGY.md) (archived — migration complete)

## Design Goal

The repo supports this conceptual flow:

```text
Provider -> Product -> Implementation -> Capability
                         |
                         -> Plan availability
                         -> Surface availability
                         -> Deployment mode
                         -> Constraints
                         -> Evidence
```

The schema makes that relationship explicit while preserving the current platform markdown files as editorial source.

## Current Schema

The repo uses a hybrid schema where per-product markdown files in `data/platforms/` remain the authoritative editorial records during the migration period.

They hold:

- product metadata
- plan pricing
- implementation details
- constraints
- raw evidence inputs used to seed the first-class evidence layer

### First-Class Records

The following are now first-class records:

1. `Capability` — `data/capabilities/*.md` (18 records)
2. `Provider` — `data/providers/*.md` (13 records)
3. `Product` — `data/products/*.md` (9 records)
4. `Implementation Map` — `data/implementations/index.yml` (71 records)
5. `Evidence` — `data/evidence/index.json` (89 records)
6. `Model Access` — `data/model-access/*.md` (9 records)

`Plan`, `Surface`, and `Constraint` remain embedded inside platform markdown and implementation records rather than being separate first-class entities. This keeps migration cost low while the ontology stabilizes.

For the open/self-hosted domain, `Model Access` records exist as a parallel extension rather than forcing those entries into the hosted-product implementation map. See [MODEL_ACCESS_EXTENSION.md](MODEL_ACCESS_EXTENSION.md).

## Why This Shape

This was the minimum viable move that got the ontology into the repo.

### Why `Capability` must be first-class

Because capability is the new primary user-facing concept and cannot be reliably derived from the current single-value `Category` field.

### Why `Provider` should be first-class

Because providers are different from products, and future scope decisions need that distinction.

Example:

- Anthropic is a provider
- Claude is a product
- a Claude Excel plug-in is an implementation

### Why `Product` should be first-class

Because the current platform files already behave like product containers, but that relationship is only implicit today.

### Why `Implementation Map` should be first-class

Because the current implementation records are embedded inside product markdown files.

Rather than splitting all implementation content into separate files immediately, the repo can add a mapping layer with stable IDs that points into the existing records.

## Proposed First-Class Files

### 1. Capabilities

Path: `data/capabilities/*.md`

Structure:

```markdown
---
id: speak-back-in-real-time
name: Speak Back in Real Time
group: respond
status: active
---

## Summary

Can respond with live or near-live speech in a conversational flow.

## What Counts

- spoken replies in real time
- back-and-forth voice conversation

## What Does Not Count

- text-to-speech export only
- one-way audio generation without conversation

## Related Terms

- Advanced Voice Mode
- Gemini Live
- Voice Mode

## Common Constraints

- mobile-first rollout is common
- quality may differ by plan
- some products support listening and speaking on different surfaces
```

### 2. Providers

Path: `data/providers/*.md`

Structure:

```markdown
---
id: anthropic
name: Anthropic
website: https://www.anthropic.com
status_page: https://status.anthropic.com
---

## Products

- claude
```

### 3. Products

Path: `data/products/*.md`

Structure:

```markdown
---
id: claude
name: Claude
provider: anthropic
record_source: data/platforms/claude.md
pricing_page: https://claude.ai/pricing
default_surfaces:
  - web
  - desktop
  - mobile
last_verified: 2026-03-04
---

## Summary

Anthropic's general-purpose AI product for chat, projects, coding, and integrations.
```

### 4. Implementation Map

Path: `data/implementations/index.yml`

This is the key migration bridge. It gives stable IDs and ontology-aware relationships to implementations that still physically live in the existing product markdown files.

Structure:

```yaml
- id: claude-projects
  product: claude
  provider: anthropic
  source_file: data/platforms/claude.md
  source_heading: Projects
  capabilities:
    - organize-work-in-projects
    - use-files-i-provide
  deployment_modes:
    - hosted-saas
  surfaces:
    - web
    - desktop
    - mobile
  notes: |
    Persistent workspace implementation inside Claude.

- id: claude-excel-plugin
  product: claude
  provider: anthropic
  source_file: data/platforms/claude.md
  source_heading: Claude for Excel
  capabilities:
    - connect-to-external-systems
    - make-and-edit-documents
  deployment_modes:
    - embedded-in-suite
  surfaces:
    - excel
  notes: |
    Embedded Excel implementation. Do not conflate with spreadsheet file upload.
```

`capabilities` may be empty for transitional records that are primarily:

- model-access records
- reasoning modifiers
- entitlement markers that do not yet map cleanly to a stable user-facing capability

Those entries should carry a note explaining why the mapping is deferred.

## Why An Implementation Index

The implementation index solves several migration problems at once:

- creates stable implementation IDs
- supports many-to-many capability mappings
- avoids immediate content duplication
- leaves editorial source maintenance in the current markdown records while materializing evidence as first-class data
- makes it possible to generate capability-first pages before a full content migration

It also allows the repo to acknowledge unresolved ontology pressure without inventing misleading capability mappings.

### 5. Evidence

Path: `data/evidence/index.json`

This layer materializes:

- launched
- verified
- checked
- sources
- changelog
- evidence notes

for each tracked `implementation`, `product`, and `model_access` record.

Current workflow:

- source markdown remains the editorial input surface
- `node scripts/sync-evidence.js` materializes ontology-native evidence objects
- `node scripts/validate-ontology.js` enforces evidence coverage

## Current Markdown Reinterpreted Under This Proposal

The current product markdown files can be treated as a transitional record type:

- frontmatter -> `Product` metadata
- pricing table -> embedded `Plan` data
- feature section -> embedded `Implementation` record
- availability table -> embedded plan constraints on implementation
- platforms table -> embedded surface constraints on implementation
- regional / notes -> embedded constraints
- sources / verified / checked / changelog -> source inputs for materialized evidence objects

That means the old structure is still usable. It just becomes explicitly transitional instead of implicitly canonical.

## IDs And Normalization Rules

Standardize IDs now, even before the full migration.

### Provider ID

- lowercase kebab-case
- stable organization ID
- examples: `openai`, `anthropic`, `google`, `microsoft`

### Product ID

- lowercase kebab-case
- stable product identity, not file name
- examples: `chatgpt`, `claude`, `gemini`, `copilot`, `notebooklm`

### Capability ID

- lowercase kebab-case
- plain-English verb phrase
- examples: `use-files-i-provide`, `connect-to-external-systems`

### Implementation ID

- `{product-id}-{implementation-slug}`
- examples: `chatgpt-advanced-voice-mode`, `claude-projects`, `copilot-office-apps`

## Fields To Deprecate Conceptually

These fields can remain in the current system for compatibility, but should be treated as transitional:

- `Category`
- `Gating` as a primary conceptual field
- `platforms` when it really means surface constraints rather than product identity

More ontology-aligned interpretations:

- `Category` -> compatibility-only display filter
- `Gating` -> summary derived from plan constraints
- `Platforms` -> `Surface availability`

## Recommended Non-Goals For The First Schema Step

Do not do these yet:

- split every implementation into its own file
- create separate first-class records for every constraint
- create separate first-class records for every plan tier across all products
- replace the current build pipeline with a graph database or heavy relational layer
- redesign the public site before stable IDs and mappings exist

## Intentional Omission In The Initial Seed

The legacy `data/archive/platforms/local-models.md` bundle should not be forced into the first ontology-aligned product seed as-is.

Reason:

- it mixes multiple providers
- it mixes model families, access patterns, and deployment assumptions
- much of its content is better understood as `Model Access` than as a single `Product`

Keep it as historical reference only while active records remain decomposed into cleaner ontology-aligned sources.

That decomposition now lives in `data/model-access/`, `data/products/`, and the active evidence files in `data/platforms/`.

## Canonical Example Under The Proposed Schema

### Excel Plug-in

If Anthropic ships an Excel plug-in, model it as:

- provider: `anthropic`
- product: `claude`
- implementation: `claude-excel-plugin`
- capabilities:
  - `connect-to-external-systems`
  - `make-and-edit-documents`
- surface:
  - `excel`
- deployment mode:
  - `embedded-in-suite`

### Excel File Upload In Chat

If Claude supports Excel file upload in chat, model it as:

- provider: `anthropic`
- product: `claude`
- implementation: `claude-file-upload`
- capabilities:
  - `use-files-i-provide`
  - possibly `read-text-and-documents`
- surface:
  - `web`
  - `desktop`
  - `mobile`
- deployment mode:
  - `hosted-saas`

These should never share the same implementation ID or be treated as the same implementation type.

## Migration Phases (completed)

### Phase 1: Add first-class records — done

- `data/capabilities/` — 18 records
- `data/providers/` — 13 records
- `data/products/` — 9 records
- `data/implementations/index.yml` — 71 records
- `data/model-access/` — 9 records
- `data/evidence/index.json` — 89 records

### Phase 2: Add stable IDs to current records — done

- provider, product, implementation, capability, and model-access IDs assigned
- each implementation mapped to one or more capability IDs (or explicitly deferred with a reason)

### Phase 3: Build from both sources — done

- feature-first build path remains working (`docs/implementations.html`)
- capability-first build path added (`docs/index.html`)
- both views generated by `scripts/build.js` from the same canonical source

### Phase 4: Decide whether to split implementation content — deferred

Implementation content remains embedded in product markdown. The mapping layer has proven sufficient and splitting has not been needed.

## Current Status

Phase 5 of the roadmap is complete. The schema now supports:

- **JSON export** — 10 canonical JSON files at `docs/api/v1/` generated from the same ontology-backed source used by the site build
- **SEO bridge pages** — 125 programmatic pages generated from canonical data with schema.org structured data
- **MCP read layer** — 15 read-only tools via `scripts/mcp-server.js` backed by the JSON artifacts

See [ROADMAP.md](ROADMAP.md) for current project status.
