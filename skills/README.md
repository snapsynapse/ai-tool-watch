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

| Skill | Purpose | When to use |
|---|---|---|
| [capability-scanner](capability-scanner/src/SKILL.md) | Evaluate external candidates (new products, releases, announcements) for inclusion | You see a new product or feature announcement |
| [capability-audit](capability-audit/src/SKILL.md) | Audit a capability's coverage across tracked products; find and fix mapping and data gaps | A capability card looks thin, or after adding a new capability definition |
| [resolve-issue](../skills/resolve-issue/SKILL.md) | Triage and close GitHub verification issues | The automated pipeline files an issue |

### capability-scanner references
- [src/references/SCAN_WORKFLOW.md](capability-scanner/src/references/SCAN_WORKFLOW.md)
- [ops/perplexity-computer/OPERATIONS.md](capability-scanner/ops/perplexity-computer/OPERATIONS.md)
