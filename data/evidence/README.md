# Evidence Records

This folder stores the ontology-native `Evidence` layer for tracked records.

## Canonical File

- [`index.json`](/Users/snap/Git/ai-capability-reference/data/evidence/index.json)

## Covered Entity Types

- `implementation`
- `product`
- `model_access`

## What An Evidence Record Contains

- entity type and entity id
- source file and optional source heading
- launched date
- verified date
- checked date
- source links
- changelog
- optional notes

## Current Workflow

During migration, evidence records are materialized from the active source markdown and ontology mappings with:

```bash
node scripts/sync-evidence.js
```

Then validate the graph:

```bash
node scripts/validate-ontology.js
```

The validator requires evidence coverage for all tracked implementations, products, and model-access records.

## Current Transitional Note

Hosted `product` records without a feature-level `source_heading` currently seed `verified` and `checked` from the product record's `last_verified` field.
That is a temporary compatibility bridge until product-level evidence dates are maintained separately from implementation-level evidence.
