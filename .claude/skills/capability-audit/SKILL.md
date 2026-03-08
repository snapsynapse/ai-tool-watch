---
name: capability-audit
description: Audit one or more capabilities for implementation coverage gaps. Reads capability definitions and the implementation index, cross-references against platform files, classifies each missing product as a mapping gap (existing feature not tagged) or data gap (feature not documented), presents findings, and applies fixes after confirmation.
argument-hint: [capability-id | group-name | "all"]
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task
---

# Capability Audit

You are auditing capability coverage for the AI Capability Reference project at `/Users/snap/Git/ai-capability-reference`.

## What This Skill Does

For each capability under audit, this skill:

1. Loads the capability definition (what counts, what does not count)
2. Reads the implementation index to see which implementations are currently mapped
3. Reads all relevant platform files to see which features exist but aren't mapped
4. Classifies each coverage gap as a **mapping gap** or **data gap**
5. Presents findings and awaits confirmation before writing any changes
6. Applies fixes and rebuilds

---

## Arguments

```
/capability-audit hear-audio-and-speech     — audit one capability by ID
/capability-audit understand                — audit all capabilities in a group
/capability-audit all                       — audit every active capability
```

If no argument is given, ask the user which capability or group to audit.

---

## Step 1: Resolve the Argument

Determine which capability IDs to audit.

```bash
ls data/capabilities/
```

- If argument is a capability ID (matches a filename in `data/capabilities/`): audit that one.
- If argument is a group name: find all capabilities in that group by reading each `.md` file and checking the `group:` frontmatter field. Known groups include `understand`, `respond`, `create`, `act`, `access` — but treat the capability files themselves as the authoritative list, since groups may be added over time.
- If argument is `all`: audit every active capability file.

---

## Step 2: Load Definitions

For each capability under audit, read:

```
data/capabilities/<id>.md
```

Extract:
- `id`, `name`, `group`, `status`
- **What Counts** — the criteria that qualify an implementation
- **What Does Not Count** — explicit exclusions

> The "What Does Not Count" section is as important as "What Counts." An implementation that only meets a related-but-excluded criterion should **not** be tagged. For example, `use-files-i-provide` (storing a file) does not automatically imply `read-text-and-documents` (interpreting its content). An implementation must actively interpret document content to qualify.

---

## Step 3: Load the Implementation Index

Read `data/implementations/index.yml` and extract:

For each capability under audit:
- Which implementations are currently mapped (have this capability ID in their `capabilities` list)?
- Which products do those implementations belong to?

```
currently_mapped = { impl_id: product }
mapped_products  = { product: [impl_id, ...] }
```

---

## Step 4: Load Platform Files

Read `data/platforms/*.md` for all active platforms. For each platform, identify:
- All documented feature sections (headings under `##`)
- The category, gating, and availability for each feature
- Any feature whose description plausibly relates to the capability being audited

You do not need to read open-model runtime files (`lm-studio-runtime.md`, `ollama-runtime.md`, `alibaba-open-models.md`, `deepseek-open-models.md`, `meta-open-models.md`, `mistral-open-models.md`) for standard consumer-capability audits unless the capability is explicitly relevant to local/open models.

---

## Step 5: Cross-Reference and Classify Gaps

For each tracked product NOT in `mapped_products` for this capability, determine why:

### Gap Classification

**No gap (correctly absent):**
The product genuinely does not offer this capability. Example: Claude has no voice input mode, so its absence from `hear-audio-and-speech` is correct.

Apply this classification when:
- No feature in the platform file mentions this capability area
- The product's known design explicitly excludes this modality

**Mapping gap:**
An existing feature in the platform file supports this capability per "What Counts," but it is not tagged in `index.yml`.

Apply this classification when:
- A documented feature's description matches "What Counts"
- The feature actively does the thing (not just enables or stores)
- Example: `gemini-notebooklm` says "upload documents and have AI conversations grounded in your sources" → matches `read-text-and-documents`

**Data gap:**
The capability is real for this product but no feature section in the platform file documents it at all.

Apply this classification when:
- The product is well-known to support this capability
- No existing implementation is a natural "carrier" for the capability
- Adding the capability to an unrelated feature would be misleading
- Example: ChatGPT has had image understanding since GPT-4o but `chatgpt.md` had no Vision section

> **Foundational capability heuristic:** If the capability describes a function that is fundamental to the entire product category (e.g., text conversation for AI assistants, image generation for image tools), and multiple major tracked products are absent, assume data gap — not correct absence. A platform file that documents a product's advanced features but has no section for its most basic function almost certainly has an oversight, not evidence the product lacks the feature.

---

## Step 6: Present Findings

Before making any changes, present a structured report:

```
=== Capability Audit: <name> (<id>) ===

CURRENTLY MAPPED (<n> impls / <n> products):
  ✓ [product] — <feature name>
  ✓ [product] — <feature name> + <feature name>  (if multiple)

CORRECTLY ABSENT:
  — [product]: <reason> (e.g., "no voice input feature in platform data")

MAPPING GAPS (existing feature not tagged):
  ⚠ [product] — <feature name> (<impl-id>)
      Reason: <why this feature qualifies>
      Fix: add `<capability-id>` to capabilities list in index.yml

DATA GAPS (feature not documented in platform file):
  ✗ [product] — no <capability name> section in <platform>.md
      Known capability: <brief description of what the platform supports>
      Fix: add new feature section to <platform>.md + new index.yml entry
      Research needed: <yes/no — what to look up>

SUMMARY:
  <n> mapping gaps → will update index.yml
  <n> data gaps → will add platform entries (requires research)
  <n> correctly absent → no action
```

Then ask: **"Does this look right? Should I proceed with the fixes?"**

Do not write any files until the user confirms.

---

## Step 7: Fix Mapping Gaps

For each mapping gap confirmed by the user:

Edit `data/implementations/index.yml` — add the capability ID to the `capabilities` list of the relevant implementation:

```yaml
# Before:
- id: gemini-notebooklm
  capabilities:
    - organize-work-in-projects
    - use-files-i-provide

# After:
- id: gemini-notebooklm
  capabilities:
    - organize-work-in-projects
    - use-files-i-provide
    - read-text-and-documents   ← added
```

---

## Step 8: Fix Data Gaps

For each data gap confirmed by the user:

### 8a: Research the Feature

**If there are multiple data gaps, run all Perplexity queries in parallel before writing anything.** Batching research upfront is faster and lets you compare results across products before committing to any platform section.

Use Perplexity to gather current, accurate information before writing any data:

```bash
curl -s -X POST "https://api.perplexity.ai/chat/completions" \
  -H "Authorization: Bearer $(jq -r '.environmentVariables.PERPLEXITY_API_KEY' ~/.claude/settings.json)" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sonar-pro",
    "messages": [{"role": "user", "content": "What are the current details of [PRODUCT]'\''s [CAPABILITY] feature as of [TODAY]? Include: which plans have access, which platforms (web, iOS, Android, desktop, API), gating (free or paid), when it launched, and any known regional restrictions. Cite official sources."}],
    "web_search_options": {"search_context_size": "high"},
    "search_recency_filter": "month"
  }' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['choices'][0]['message']['content']); print('---CITATIONS---'); [print(c) for c in d.get('citations',[])]"
```

Frame queries to **discover**, not confirm: "What are the current details of X?" not "Does X still do Y?"

**Consumer vs. enterprise disambiguation:** Some products have both a consumer product and an enterprise variant with similar names (e.g., Microsoft Copilot vs. Microsoft 365 Copilot, Gemini vs. Gemini for Google Workspace). If there is any ambiguity, explicitly anchor the query to the consumer product and exclude the enterprise variant:

> *"I am asking about the consumer product at [URL], NOT the enterprise/business version."*

If the first query returns enterprise data, discard it and re-query with the disambiguation added.

### 8b: Add Platform Feature Section

Append a new `## Feature Name` section to `data/platforms/<platform>.md` following the established format:

```markdown
---

## <Feature Name>

| Property | Value |
|----------|-------|
| Category | vision            |  ← use: voice, vision, research, coding, agents, integrations, local-files, cloud-files, other
| Status   | ga                |  ← ga / beta / preview / deprecated
| Gating   | free              |  ← free / paid
| URL      | <official-url>    |
| Launched | YYYY-MM-DDT12:00Z |
| Verified | YYYY-MM-DD        |
| Checked  | YYYY-MM-DD        |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| ...  | ...       | ...    | ...   |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Windows  | ✅/❌/⚠️  | ...   |
| macOS    | ✅/❌/⚠️  | ...   |
| Linux    | ✅/❌/⚠️  | ...   |
| iOS      | ✅/❌/⚠️  | ...   |
| Android  | ✅/❌/⚠️  | ...   |
| Chrome   | ✅/❌/⚠️  | ...   |
| web      | ✅/❌/⚠️  | ...   |
| terminal | ✅/❌/⚠️  | ...   |
| API      | ✅/❌/⚠️  | ...   |

### Regional

<Available globally / regional restrictions>

### Talking Point

> "<Presenter-ready talking point. Bold key access/pricing info. 1-3 sentences.>"

### Sources

- [Source Name](URL)

### Changelog

| Date | Change |
|------|--------|
| YYYY-MM-DDT12:00Z | Initial entry |
| YYYY-MM-DDT12:00Z | Feature launched |
```

**Talking point rules:**
- Must be presenter-ready (used in a classroom setting)
- Bold the key gating/pricing constraint: e.g., `**Available on all plans including free**` or `**Requires Plus ($20/mo) or higher**`
- Include notable surface restrictions if any: e.g., `**macOS only**`, `**mobile only**`

**Also update `last_verified` in the platform frontmatter** if adding a new section.

**Cross-reference existing sections for consistency:** Before writing a new section's Platforms table, scan other sections already in the same platform file. If three other sections say `Windows ✅ Desktop app`, your new section should match unless you have specific evidence to the contrary. Use existing rows as the consistency baseline; only deviate when research explicitly contradicts them.

### 8c: Add Index.yml Entry

Add a new entry to `data/implementations/index.yml`. Place it near other entries for the same product. Name the ID as `<product>-<feature-slug>` (lowercase, hyphens):

```yaml
- id: chatgpt-vision-image-understanding
  product: chatgpt
  provider: openai
  source_file: data/platforms/chatgpt.md
  source_heading: Vision (Image Understanding)
  capabilities:
    - see-images-and-screens
```

---

## Step 9: Rebuild and Verify

```bash
node scripts/build.js
```

Confirm the build succeeds (no errors). Then verify using grep against the source data (more reliable than parsing the built HTML):

```bash
# Step 1: confirm the implementation count
grep -c "\- <capability-id>" data/implementations/index.yml

# Step 2: confirm which products are mapped
grep -B5 "\- <capability-id>" data/implementations/index.yml | grep "^  product:"
```

Replace `<capability-id>` with the actual capability slug (e.g., `write-and-explain`).

Report: capability name, final impl count / product count, and list of products.

---

## Step 10: Report Results

After applying fixes and verifying the build:

```
=== Audit Complete: <name> ===

Before: <n> impls / <n> products
After:  <n> impls / <n> products

Mapping gaps fixed (<n>):
  ✓ [product] <impl-id> — added `<capability-id>`

Data gaps fixed (<n>):
  ✓ [product] — added <feature name> to <platform>.md + index.yml

Correctly absent (<n>):
  — [product]: <reason>

Files modified:
  data/implementations/index.yml
  data/platforms/<platform>.md (if data gaps were fixed)
  docs/index.html (rebuilt)
```

---

## Relationship to Other Skills

### vs. Capability Scanner

| | Capability Scanner | Capability Audit |
|---|---|---|
| **Trigger** | You present an external candidate (new product, release, announcement) | You specify a capability ID or group to audit |
| **Direction** | Outside → in (should this be added?) | Inside → inside (is existing data complete?) |
| **Scope** | One candidate at a time | All tracked products for a capability |
| **Output** | `ADD / UPDATE / WATCH / SKIP` recommendation | Coverage report + gap fixes |
| **When to use** | After seeing a product announcement or release | When a capability card looks thin or after adding a new capability definition |

**Overlap zone:** when the audit identifies a data gap (a product supports the capability but has no feature entry), fixing it requires writing a new platform section — the same action that follows a Scanner `ADD`. The difference is that the audit *discovers* the gap through cross-referencing; the scanner expects you to bring the candidate to it.

**Do not use** the Capability Scanner to audit systematic coverage gaps. **Do not use** the Capability Audit to decide whether a brand-new product or feature belongs in the reference at all.

### vs. Resolve Issue

The `resolve-issue` skill handles GitHub issues produced by the automated verification pipeline (inconclusive model agreement, broken links). Capability audits are initiated manually to check ontology completeness, not triggered by verification failures.

---

## Important Rules

- **Classify before acting.** Always present the full findings report and wait for user confirmation before editing files.
- **"What Does Not Count" is a hard boundary.** Do not add a capability just because the feature is in the same domain. Use the explicit exclusions in the capability definition.
- **Mapping gaps need a genuine carrier.** An existing implementation qualifies as a carrier only if its source feature actually performs the capability—not just enables or stores something related. If no clean carrier exists, classify as a data gap.
- **Data gaps require research.** Never write platform feature sections from memory alone. Use Perplexity or official sources and cite them. If you cannot find reliable data, say so rather than guessing.
- **Never update Claude/Anthropic data from memory.** You are Claude—this is a conflict of interest. This applies to current plan availability, feature details, pricing, and capability status — anything that could have changed. It does not prevent using well-established historical facts (e.g., a public launch year), but if you are uncertain about any detail, verify via Perplexity or official Anthropic sources rather than relying on training data.
- **Platform data must be sourced.** Every new platform section needs at least one URL in `### Sources`.
- **Changelog entries are reverse chronological** — newest at top.
- **Open models are usually out of scope** for consumer capability audits unless the capability is specifically about local/self-hosted deployment.
