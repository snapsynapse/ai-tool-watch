# Automated Feature Verification

The collector compares stored AI-tool features with cited provider responses. It produces observations and pending review findings. It does not accept editorial changes, publish model agreement as a verified fact, or prove that all tool information is current.

## Outcomes and process exits

| Outcome | Required evidence | Result |
|---|---|---|
| No change | At least two distinct, substantive, cited, search-grounded no-change responses and no unresolved positive vote | Adequate observation; eligible for Checked update only when the run is healthy |
| Model-confirmed candidate | The required independent positive confirmations | Pending human source review; no data or changelog write |
| Contradiction | Opposing cited qualified responses | Pending human source review |
| Inconclusive | Insufficient, ambiguous, one-provider, or unsupported evidence | Coverage remains incomplete; preserve the finding |
| Error | Provider or execution failure | Failed observation; preserve error and any available usage |

The CLI returns 0 for healthy or valid idle, 1 for adequate observations requiring editorial review, and 2 for failed or degraded execution/coverage. A review-issue delivery failure is operational failure. The workflow handles review exit 1 separately; it cannot hide exit 2 behind a green completion. Incomplete evidence stays incomplete even if no model detects a change.

## Selection and provider calls

The twice-weekly workflow runs Tuesday and Friday at 01:00 UTC, with a default maximum of 50 features per run. The CLI default is 100. The existing oldest-Checked-first selection is preserved, with stable tie ordering. Selection backlog remains visible; a partial batch is never a full-inventory currency claim.

Same-provider exclusion remains in force for Google, Anthropic, Perplexity and xAI features. The existing adapters and prompts are in `scripts/lib/ai-clients.js`. At least two configured provider keys are needed before the runner starts; the cascade must still establish adequate independent evidence after same-vendor exclusions. A missing or unsuccessful provider is an error, not a negative vote. T04 does not establish live provider availability or introduce EveryAILaw's separate request-budget implementation.

A dry run still makes potentially billable provider requests. It suppresses issue and data writes. No live canary is part of the offline T04 validation.

## Running the collector

Show options without provider calls:
Literal
```bash
node scripts/verify-features.js --help
```

A bounded, billable dry run after provider-call authorization:
Literal
```bash
node scripts/verify-features.js --max 1 --dry-run --verbose
```

Supported filters are `--platform`, `--feature` (requires platform), `--stale-only`, and `--stale-threshold` (default seven days). Unknown arguments, empty scope, malformed limits and an empty inventory fail closed. Valid idle means that a valid selected scope has no due features, not that the underlying content is verified current.

## Evidence and pending findings

The runner writes `.verification-reports/health.json`, `results.json`, `pending-findings.json`, `summary.txt`, `report.md` and `alert.json` before editorial side effects. It retains completed results after each batch callback, including raw provider responses and `usageReceipt` with actual response identity and usage. Missing usage remains unknown. Perplexity usage is logged before response extraction because its response is the authoritative usage record.

Malformed returned batches are retained in `invalid-batch-result.json`. A later failure does not erase prior results. Final workflow status is recorded separately in `workflow-health.json`, so useful observations and a failed build or push can both be represented. Artifacts upload even on failure.

Positive signals create or reuse pending review issues. A model-confirmed change uses the same review boundary as an unconfirmed signal; neither writes `[Verified]` changelog entries. Consistency defects and incomplete results remain visible in the report and coverage denominator. Existing review issues and signals digests are not auto-closed merely because a later run is quiet, partial, or failed. The former optional auto-resolve publication path has been removed from this collection workflow.

A maintainer accepts a finding by checking official evidence and making the appropriate reviewed data change. Verified dates and changelog assertions belong to that editorial action. An issue receipt means the review item exists; it is not editorial acceptance or proof that the maintainer received an alert.

## Dates and publication

| Field | Automated behavior |
|---|---|
| Checked | Advances only for adequately evidenced no-change records in a healthy or adequately review-required run; failed/degraded runs do not advance it |
| Verified | Never changed by the collector |
| Changelog | Never changed by model agreement |

The workflow publishes only the successful no-change path. A review-required run leaves its findings pending. Source data remains under `data/`; `docs/` is generated by `scripts/build.js`. Product evidence may derive from backing platform/feature dates in `sync-evidence.js`; derived freshness cannot compensate for an unsuccessful observation.

## Failure visibility

The common alert envelope identifies scope, coverage, severity, evidence and required action. The selected operational notification channel is email. Direct delivery remains `not_configured` until the sender, recipient, independent observer/fallback and receipt tests are completed. A GitHub issue or uploaded artifact does not prove inbox arrival. Quiet healthy runs do not create artificial canary issues; independent missed-run detection remains necessary.

## Local validation

Offline verification tests:
Literal
```bash
node --test tests/verification-*.test.js tests/cascade-parser.test.js
```

Repository gates include `node scripts/validate-ontology.js`, `node scripts/validate-claims.js`, and `node scripts/validate-structured-data.js`. The link-engine fixtures use local test servers; `tests/smoke-live.test.js` is explicitly live and excluded from the offline run. Successful fixtures do not establish live provider connectivity, notification receipt, or current product facts.
