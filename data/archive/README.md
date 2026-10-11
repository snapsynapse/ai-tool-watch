# Archive Data

This folder stores historical source material that is no longer part of the active ontology-first build.

## Rules

- Do not point active `Product`, `Model Access`, or `Implementation` records at files in this folder.
- Do not treat archive files as canonical editing targets.
- Keep archive files only for historical continuity, auditability, or migration reference.

## Frozen 2026-10-11

On 2026-10-11 the project slimmed to maintenance and narrowed scope to hosted consumer AI products from providers with roughly 1% or greater public market share. Non-cloud offerings were frozen here, not deleted. See `INTENT.md` "Status and review" and `design/SCOPE.md` "Archived Domains".

- `products/`: self-hosted runtime products (Ollama, LM Studio, text-generation-webui)
- `model-access/`: the 11 open-model access records (Llama, Mistral, Codestral, Leanstral, DeepSeek, Qwen)
- `providers/`: providers that only had archived records (Alibaba, DeepSeek, LM Studio, Meta, Mistral, Ollama, oobabooga)
- `platforms/`: their source files (`*-open-models.md`, `*-runtime.md`), marked `build_visibility: archive`

Each record carries `archived_on: 2026-10-11` and keeps its last `last_verified` and `Verified`/`Checked` dates. `scripts/build.js` (`loadArchiveData()`) renders them on `docs/archive.html` and in `api/v1/archive.json` and `api/v1/model-access.json`. Evidence sync, ontology validation, and the verification cascade don't read this folder, so these records are never refreshed.

## Legacy contents

- `platforms/local-models.md`: legacy bundled open/self-hosted source that was decomposed into the records above before they were archived
- `platforms/open-model-access.md`, `platforms/self-hosted-runtimes.md`: earlier hidden bundles, kept for continuity
