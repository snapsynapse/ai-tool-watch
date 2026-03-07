# Skills

This directory holds the canonical source for reusable project skills.

The goal is:

- one skill source of truth in the repo
- thin exports for different model platforms
- minimal duplication of ontology and scope logic
- easy rebuilds when project governance changes

## Structure

Each skill should follow this layout:

```text
skills/
  skill-name/
    src/
      SKILL.md
      references/
      CHANGELOG.md
    ops/
      platform-name/
        OPERATIONS.md
        TASK_DEFINITION.md
    dist/
```

Rules:

- `src/` is canonical
- `ops/` holds platform-specific deployment and automation docs
- `dist/` is generated and ignored by git
- exported bundles should be rebuilt from `src/`, not hand-edited
- repo governance docs remain the ultimate source of truth

## Current Workflow

1. Update the canonical skill source under `skills/<name>/src/`
2. Rebuild platform exports with:

```bash
node scripts/build-skill-bundles.js
```

3. Use the generated outputs under `skills/<name>/dist/`

## Platforms

The current build script emits:

- `perplexity` zip bundles for upload
- `claude` `.skill` bundles for upload
- `codex` expanded folders with the same canonical files and manifest

## Current Skills

- [skills/capability-scanner/src/SKILL.md](/Users/snap/Git/ai-capability-reference/skills/capability-scanner/src/SKILL.md)
- [skills/capability-scanner/src/references/SCAN_WORKFLOW.md](/Users/snap/Git/ai-capability-reference/skills/capability-scanner/src/references/SCAN_WORKFLOW.md)
- [skills/capability-scanner/ops/perplexity-computer/OPERATIONS.md](/Users/snap/Git/ai-capability-reference/skills/capability-scanner/ops/perplexity-computer/OPERATIONS.md)
