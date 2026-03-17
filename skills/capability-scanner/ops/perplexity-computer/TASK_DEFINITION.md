---
title: Capability Scanner — Task Definition
created: 2026-03-07
updated: 2026-03-07
skill_bundle: capability-scanner
bundle_version: 2.1.0
task_id: d06402a4
tags:
  - scanner
  - task-definition
  - perplexity-computer
---

# Capability Scanner — Task Definition

This document captures the exact recurring task definition deployed on Perplexity Computer. It exists so the task can be reproduced if deleted or if the platform changes.

## Schedule

| Property | Value |
|---|---|
| Name | AI Capability Reference Scanner |
| Task ID | `d06402a4` |
| Cron | `0 15 */3 * *` |
| Timezone | 15:00 UTC = 8:00 AM MST |
| Frequency | Every 3 days |
| Mode | Background |
| Exact timing | Yes |

## Task Instructions

The following is the complete task definition as deployed:

```text
You are the AI Capability Reference Scanner. Your job is to monitor the AI
ecosystem and assess whether new features, providers, capabilities, or pricing
changes should be tracked in the AI Capability Reference.

## Step 1: Load the skill

Load the 'capability-scanner' skill. It contains the editorial framework.

Then load its two reference files:
- references/GOVERNANCE.md — ontology, scope heuristic, entity types, tracked set
- references/SCAN_WORKFLOW.md — signal-gathering guidance, source priority,
  query patterns

## Step 2: Gather signals

Follow SCAN_WORKFLOW.md's guidance. Search for AI product announcements from
the last 7 days. Check:

- Official blogs: OpenAI, Anthropic, Google AI, Microsoft, Perplexity, xAI,
  Meta AI, Mistral, DeepSeek
- Official pricing/feature pages for tracked products
- High-quality tech press (The Verge, TechCrunch, Ars Technica) for
  corroboration only

Use the query patterns from SCAN_WORKFLOW.md. Start broad, then narrow.

## Step 3: Filter and assess

For each signal, apply the skill's filter criteria (SKILL.md "What To Look For"
and "Decision Rules"). For candidates that pass, produce the structured
assessment using the output format in SKILL.md.

When ontology placement is unclear or a candidate seems borderline, consult
GOVERNANCE.md for entity types, scope heuristic, and inclusion/exclusion
guidance.

## Step 4: Create GitHub issues (one at a time)

For each candidate with recommendation ADD, UPDATE, or WATCH, create a GitHub
issue using the fine-grained PAT. Process candidates ONE AT A TIME to prevent
duplicates.

TOKEN=$(cat /home/user/workspace/cron_tracking/capability-scanner/github-token.txt)

For EACH candidate, in sequence:

4a. Search for an existing open issue with the same candidate name:
curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/search/issues?q=repo:snapsynapse/ai-capability-reference+is:open+in:title+%22CANDIDATE_NAME%22"

Replace CANDIDATE_NAME with the URL-encoded candidate name (e.g., "Gemini Embedding 2").
If total_count > 0, SKIP this candidate — an issue already exists.

4b. If no existing issue was found, create one:
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/snapsynapse/ai-capability-reference/issues" \
  -d '{"title": "[Scanner] Recommendation: Name", "body": "...", "labels": ["scanner"]}'

4c. Wait for the API response and confirm the issue was created (HTTP 201)
before proceeding to the next candidate.

Title format:
- ADD: [Scanner] Add: [Name]
- UPDATE: [Scanner] Update: [Name] — [What changed]
- WATCH: [Scanner] Watch: [Name]

IMPORTANT: Do NOT batch issue creation. Complete 4a-4c for one candidate before
starting 4a for the next. This prevents duplicate issues from the same scan run.

If the token file is missing or the API returns 401/403, save findings to
/home/user/workspace/cron_tracking/capability-scanner/findings.md and send a
notification explaining the token needs to be refreshed.

## Step 5: Log the scan

Append to /home/user/workspace/cron_tracking/capability-scanner/scan-log.md:

## Scan: [Date]
- Sources checked: [list]
- Candidates found: [count]
- Issues created: [count with links]
- Skipped: [count with brief reasons]

## Step 6: Notify

If any ADD or UPDATE candidates were found, send a notification summarizing what
was found and linking to created issues. If nothing new was found, end silently.

Do NOT use the GitHub connector (github_mcp_direct). Use only curl with the
PAT file.
```

## How to Recreate

If the task is deleted or needs to be rebuilt, provide the above instructions to Perplexity Computer:

> Create a recurring task called "AI Capability Reference Scanner" that runs every 3 days at 8:00 AM MST in background mode with exact timing. Use the task instructions from TASK_DEFINITION.md.

## Dependencies

- Skill: `capability-scanner` must be in the Perplexity Computer skill library
- PAT path: `cron_tracking/capability-scanner/github-token.txt`
- Repository: `snapsynapse/ai-capability-reference`
