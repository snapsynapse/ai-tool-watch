---
id: leanstral
name: Leanstral
provider: mistral
record_source: data/platforms/mistral-open-models.md
source_heading: Leanstral (Mistral)
last_verified: 2026-03-17
status: active
---

## Summary

Mistral's open-source code agent specialized for Lean 4 proof engineering. Apache 2.0 weights with MCP tool-use training. Also available via the Mistral Labs API endpoint `labs-leanstral-2603` and agent mode in Mistral Vibe.

## Deployment Modes

- self-hosted
- local-api
- cloud-api (Mistral Labs endpoint)
- web (Mistral Vibe)

## Common Runtimes

- Ollama
- local API wrappers
- Mistral Vibe (agent mode)
- Mistral Labs API

## Constraints

- specialized for Lean 4 formal verification, not general-purpose coding
- Labs API endpoint may be time-limited
- consumer GPU use depends on model size and quantization

## Related Capabilities

- write-and-edit-code
- take-actions-and-run-tools
