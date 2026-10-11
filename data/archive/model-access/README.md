# Model Access Records

This folder stores ontology-aligned `Model Access` records.

## Why This Exists

Some entries in the repo do not fit cleanly as hosted products or vendor implementations.

Open/self-hosted model families like:

- Llama
- Qwen
- DeepSeek
- Mistral

are better understood as `Model Access` than as a single product or feature.

## Current Role

These records are the ontology-aligned decomposition of the old [`data/archive/platforms/local-models.md`](/Users/snap/Git/ai-capability-reference/data/archive/platforms/local-models.md) bundle.

Current source of evidence:

- [`data/platforms/meta-open-models.md`](/Users/snap/Git/ai-capability-reference/data/platforms/meta-open-models.md) for Llama model families
- [`data/platforms/mistral-open-models.md`](/Users/snap/Git/ai-capability-reference/data/platforms/mistral-open-models.md) for Mistral model families
- [`data/platforms/deepseek-open-models.md`](/Users/snap/Git/ai-capability-reference/data/platforms/deepseek-open-models.md) for DeepSeek model families
- [`data/platforms/alibaba-open-models.md`](/Users/snap/Git/ai-capability-reference/data/platforms/alibaba-open-models.md) for Qwen / Alibaba model families
- [`data/platforms/ollama-runtime.md`](/Users/snap/Git/ai-capability-reference/data/platforms/ollama-runtime.md), [`data/platforms/lm-studio-runtime.md`](/Users/snap/Git/ai-capability-reference/data/platforms/lm-studio-runtime.md), and [`data/platforms/oobabooga-runtime.md`](/Users/snap/Git/ai-capability-reference/data/platforms/oobabooga-runtime.md) for runtime-tooling context
- [`data/archive/platforms/local-models.md`](/Users/snap/Git/ai-capability-reference/data/archive/platforms/local-models.md) as a legacy archive only

## Fields

Each model-access record should identify:

- model family or line
- publishing provider
- source record and source heading
- deployment modes
- common runtimes
- key constraints
- related capabilities
