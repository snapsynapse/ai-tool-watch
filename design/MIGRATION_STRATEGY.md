# Capability-First Migration Strategy

Status: Active (migration underway, Phases 1–3 complete)
Last updated: 2026-03-15

This document describes how the project moved toward a capability-first product without breaking the current feature-first site.

The governing principle for future decisions is documented in [ONTOLOGY_FIRST.md](ONTOLOGY_FIRST.md).

For the higher-level domain model that should guide future schema choices, see [ONTOLOGY.md](ONTOLOGY.md).

The first concrete repo-facing data shape is proposed in [SCHEMA_PROPOSAL.md](SCHEMA_PROPOSAL.md).

## Decision

The project should follow a coexistence path:

- Capability-first is the forward-facing direction.
- Feature-first remains available during migration.
- Coexistence is a migration strategy, not a permanent design constraint.

If coexistence starts distorting the schema or taxonomy, that should be called out explicitly and revisited.

## Current System Summary

The repo now operates in a hybrid model:

- One markdown file per platform in `data/platforms/` (editorial source of truth)
- First-class ontology records in `data/capabilities/`, `data/providers/`, `data/products/`, `data/model-access/`, `data/implementations/index.yml`, and `data/evidence/index.json`
- A static site generator in [`scripts/build.js`](/Users/snap/Git/ai-capability-reference/scripts/build.js) that renders both a capability-first homepage and a feature-first detailed availability view
- Validation via `scripts/validate-ontology.js` enforcing cross-record integrity

## Core Architectural Direction

Maintain a shared canonical data layer and support multiple views over it.

### Canonical Source Of Truth

Platform markdown files remain the editorial input surface for:

- platform metadata
- plan pricing
- feature implementations
- constraints
- evidence inputs

### Capability Mapping Layer

An explicit capability mapping layer now relates each implementation to one or more capabilities via `data/implementations/index.yml`.

The capability layer is the basis for:

- the capability-first homepage (`docs/index.html`)
- capability-grouped navigation
- beginner-facing explanations
- plan/entitlement guidance phrased in human terms

### Preserved Feature View

The feature-first detailed availability view (`docs/implementations.html`) remains available and is generated from the same canonical source.

## Schema Evolution (implemented)

The migration followed an extension-not-replacement approach.

### Kept

Platform markdown feature records remain intact. They store:

- implementation names
- plan constraints
- platform/surface constraints
- evidence and freshness metadata
- sources and changelog

### Added

The capability mapping layer now exists:

1. **Capability catalog** — `data/capabilities/*.md` (18 records)
2. **Implementation-to-capability mappings** — `data/implementations/index.yml` (71 records, each mapped to capability IDs)
3. **Mapping notes** — implementations that cannot yet map cleanly carry a `notes` field explaining the deferral

### Still avoided

- Replacing `Category` with capability IDs in platform markdown (Category remains for backward compatibility)
- Deleting existing feature records
- Forcing capability prose into every platform file

## Data Shape

The mapping layer uses this relationship:

```text
Capability 1 ---< Implementation Map >--- Implementation (in platform markdown)
```

Each implementation record in `data/implementations/index.yml` carries:

- `id` — stable implementation ID
- `product` — product ID
- `provider` — provider ID
- `source_file` — path to editorial source in `data/platforms/`
- `source_heading` — heading within the source file
- `capabilities` — list of capability IDs (or empty array for deferred records)
- optional `notes` — explains deferred mappings or special modeling decisions

## Why Not Use Category As The Capability Layer

Because the current category field is doing a different job.

It is:

- singular
- implementation-oriented
- optimized for filtering cards
- too coarse in some places and too vague in others

Evidence of schema pressure:

- 17 current features are in `other`
- `voice` collapses listening and speaking
- `browser`, `research`, `search`, and `agents` overlap
- `local-files` and `cloud-files` describe source location, not user intent

Conclusion: preserve `Category` for backward compatibility, but do not treat it as the future canonical taxonomy.

## Migration Phases

### Phase 1: Editorial foundation — complete

- Capability taxonomy drafted and agreed ([CAPABILITY_TAXONOMY.md](CAPABILITY_TAXONOMY.md))
- Capability definitions and mapping rules created
- Ambiguous and multi-capability features identified ([CAPABILITY_PRESSURE_TEST.md](CAPABILITY_PRESSURE_TEST.md))

### Phase 2: Data extension — complete

- 18 capability records added
- 71 implementation mappings created with capability IDs
- Existing build and dashboard remain working

### Phase 3: Alternative presentation — complete

- Capability-first homepage live at `docs/index.html`
- Same canonical data and evidence layer underneath
- Feature-first view preserved at `docs/implementations.html`

### Phase 4: Evaluate pressure — ongoing

The old and new views currently fit naturally over the same model. No retirement decisions needed yet. The legacy `Category` field remains as a compatibility filter but does not drive taxonomy decisions.

## Maintainer Guidance For Future Models

When making changes in this repo during migration:

- Prefer extending the shared data model over creating duplicate content systems.
- Treat vendor features as implementation records, not the top-level conceptual model.
- Preserve evidence quality and verification dates even when reframing content.
- Flag any case where maintaining the legacy view requires awkward taxonomy decisions.
- Document new assumptions in-repo so they do not live only in a chat thread.

## Next Steps

The migration strategy has reached steady state. The next major work is Phase 5 of the roadmap: generating canonical JSON exports from the same ontology-backed source. See [ROADMAP.md](/ROADMAP.md).
