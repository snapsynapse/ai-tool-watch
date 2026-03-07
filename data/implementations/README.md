# Implementation Map Notes

The implementation map in this folder is the ontology-first bridge layer.

## Current Role

`index.yml` provides:

- stable implementation IDs
- product and provider linkage
- capability mappings
- migration notes for ambiguous records

The authoritative source for plan constraints, surface availability, evidence, and changelog remains the source markdown in `data/platforms/` during this phase.

## Intentional Omission

The legacy `data/archive/platforms/local-models.md` bundle is intentionally not seeded into `index.yml`.

Reason:

- it mixes multiple providers
- it mixes model families with deployment assumptions
- much of its content is closer to `Model Access` than to a single `Product`

It should be decomposed later into cleaner provider/product/model-access records rather than forced into the first seed.

That decomposition now lives in [`data/model-access/`](/Users/snap/Git/ai-capability-reference/data/model-access/) and the supporting evidence files in `data/platforms/`, but those records are not part of the hosted-product implementation map yet.
