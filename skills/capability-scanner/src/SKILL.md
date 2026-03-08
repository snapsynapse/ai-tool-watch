---
name: capability-scanner
description: >-
  Evaluate AI product announcements, model releases, pricing changes, and
  candidate providers against the AI Capability Reference project's current
  ontology and scope rules. Use when deciding whether something should be
  added, updated, watched, or skipped in the reference, especially for
  consumer-facing AI products, self-hosted runtimes, and open model access.
---

# Capability Scanner

Use this skill to assess whether a product, implementation, model-access
record, or provider belongs in the AI Capability Reference.

Load [references/GOVERNANCE.md](references/GOVERNANCE.md) when:

- a candidate seems borderline
- ontology placement is unclear
- you need the current capability taxonomy or scope heuristic
- you need the current tracked set for comparison

Load [references/SCAN_WORKFLOW.md](references/SCAN_WORKFLOW.md) when:

- you are running a broader scan rather than evaluating one candidate
- you need signal-gathering guidance
- you need source-priority or recommendation conventions

## Core Job

For each candidate:

1. Determine what kind of thing it is.
2. Check whether it is consumer-facing, commercially available, or
   practically usable by an ordinary person.
3. Assess whether tracking it would materially help the audience understand
   capabilities, access, constraints, or deployment choices.
4. Recommend one of: `ADD`, `UPDATE`, `WATCH`, `SKIP`.
5. Cite the best available sources, preferring official sources.

## Output Format

Use this structure:

```markdown
CANDIDATE: [brief name]
ENTITY TYPE: [Capability | Implementation | Product | Provider | Plan | Surface | Deployment Mode | Model Access | Constraint]
PROVIDER: [if applicable]
PRODUCT: [if applicable]

WHAT CHANGED:
[1-2 sentence summary]

ONTOLOGY FIT:
- Why this entity type is correct
- Any entity-type ambiguity that remains

CAPABILITY MAPPING:
- [capability slug]
- [capability slug]

SCOPE ASSESSMENT:
- Commercially available or practically usable: [Yes/No + reason]
- Audience relevance: [Yes/No + reason]
- Affects capability, access, or deployment choice: [Yes/No + reason]

RECOMMENDATION: [ADD | UPDATE | WATCH | SKIP]
RATIONALE:
- [short point]
- [short point]

EVIDENCE:
- [Official source]
- [Official source]
- [Secondary source, if useful]

OPEN QUESTIONS:
- [only if needed]
```

## Decision Rules

- Prefer official sources over press coverage.
- Do not treat a marketing name as a capability.
- Do not treat a model family as a product.
- Do not force open/self-hosted things into one bucket.
- Treat `~1% market share` as a heuristic, not a hard threshold.
- Use `WATCH` for borderline candidates or incomplete evidence.
- If the case is weak, do not invent certainty.

## What To Look For

Good candidates usually involve one of these:

- a new consumer-facing product with meaningful public visibility
- a new implementation on an already tracked product
- a pricing or entitlement change that affects user decisions
- a meaningful new surface or deployment option
- an open model family or runtime that real people can select or run locally

Usually skip:

- enterprise infrastructure with no clear end-user product
- API-only changes with no user-facing impact
- minor renames or vague model-quality claims
- obscure releases that do not clear the audience-relevance bar

## Watchlist Rule

If a candidate may belong but does not clearly justify active tracking yet,
recommend `WATCH` rather than `ADD`. Treat that as a watchlist candidate,
not a failed evaluation.

## Related Skill

Use the **`capability-audit`** skill instead when:
- You want to check whether *existing* tracked products are correctly mapped to a capability
- A capability card looks thin (too few products listed) and you want to know why
- You've added a new capability definition and want to populate it from existing data

The scanner evaluates *incoming candidates* (one at a time, from outside).
The capability audit checks *internal completeness* (systematically, across all tracked products for a given capability).
