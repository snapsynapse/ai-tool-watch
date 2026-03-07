---
skill_bundle: capability-scanner
file_role: reference
version: 1.0.0
version_date: 2026-03-07
previous_version: null
change_summary: >
  Added a lightweight scanning workflow reference so the portable bundle
  retains explicit signal-gathering and recommendation guidance.
---

# Scan Workflow

This file adds lightweight scanner guidance without turning the skill back into
an environment-specific operations runbook.

Use it when you are running an actual scan rather than only assessing a single
candidate.

## Core Scan Loop

1. Gather recent signals from official product sources first.
2. Filter out changes that are not user-facing or not in scope.
3. Assess each remaining candidate using the `SKILL.md` output format.
4. Recommend `ADD`, `UPDATE`, `WATCH`, or `SKIP`.
5. If the surrounding workflow needs repo actions, convert the assessment into
   a watchlist entry, issue, or data update outside the skill bundle.

## Preferred Source Order

Prefer sources in this order:

1. Official product blogs, changelogs, help centers, release notes, and pricing pages
2. Official social announcements when no better primary source exists
3. High-quality secondary reporting for corroboration only

Do not recommend changes based solely on press coverage when an official source
should exist.

## Good Signal Types

Look for:

- new consumer-facing products
- new implementations on tracked products
- pricing or entitlement changes
- meaningful platform or surface expansions
- meaningful deployment changes for local/self-hosted use
- new open model families or runtime options that ordinary people can actually use

## Usually Ignore

Usually skip:

- API-only changes with no user-facing effect
- enterprise-only infrastructure announcements
- vague model-improvement claims with no user-visible implication
- cosmetic renames
- rumor or leak coverage

## Useful Query Patterns

Start broad, then narrow.

Examples:

- `[provider] announcement AI feature`
- `[provider] pricing AI`
- `[provider] launch live voice projects research`
- `[provider] open model release`
- `[runtime name] release notes`

When time-bounding matters, bias toward the last 7 to 30 days.

## Recommendation Conventions

Use:

- `ADD` when the case for a new active record is strong
- `UPDATE` when an existing tracked record should change
- `WATCH` when the candidate is plausible but not yet strong enough for active tracking
- `SKIP` when it does not fit the ontology or scope rules

For borderline items, prefer `WATCH` over forced inclusion.

## Repo Translation

When converting a scan result into repo work:

- `ADD` may become a new provider, product, implementation, or model-access record
- `UPDATE` may become a change to an existing active record or evidence entry
- `WATCH` should usually become or remain a watchlist item
- `SKIP` should usually stop there unless the exclusion logic itself needs review
