# Data Schema

This document describes the current platform-feature markdown format. It remains valid for the existing site, but it should now be read as the legacy or transitional schema during migration toward the ontology-aligned model in [SCHEMA_PROPOSAL.md](design/SCHEMA_PROPOSAL.md).

This document describes the format for platform feature files.

## File Structure

Each platform has its own markdown file in `data/platforms/`. The file contains:

1. **Frontmatter** (YAML) - Platform metadata
2. **Pricing Table** - Plan tiers and prices
3. **Feature Sections** - One section per feature

## Format

```markdown
---
name: Platform Name
vendor: Company Name
logo: https://cdn.simpleicons.org/openai/white
status_page: https://status.example.com
pricing_page: https://example.com/pricing
last_verified: 2026-01-20
---

## Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Free | $0 | Basic access |
| Plus | $20/mo | Standard paid tier |
| Pro | $200/mo | Power user tier |

---

## Feature Name

| Property | Value |
|----------|-------|
| Category | agent |
| Status | ga |
| Gating | paid |
| Launched | 2025-07-17T00:00Z |
| Verified | 2026-01-20T12:00Z |
| Checked | 2026-01-20T14:30Z |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Plus | ✅ | 40/month | Message limit |
| Pro | ✅ | 400/month | Higher limits |

### Platforms

| Platform | Available | Notes |
|----------|-----------|-------|
| Web | ✅ | |
| macOS | ✅ | Desktop app |
| Windows | ✅ | Desktop app |
| iOS | ✅ | Mobile app |
| Android | ✅ | Mobile app |

### Regional

Available globally except EEA/Switzerland (rolling out).

### Talking Point

> "Your presenter-ready sentence goes here. Use **bold** for emphasis on key details."

### Sources

- [Official docs](https://example.com/docs)
- [Release announcement](https://example.com/blog/feature)

### Changelog

| Date | Change |
|------|--------|
| 2025-07-17T00:00Z | Feature launched (GA) |
| 2025-08-01T00:00Z | Plus limit increased from 30 to 40/month |

---
```

## Field Definitions

### Property Table Fields

| Field | Required | Format | Description |
|-------|----------|--------|-------------|
| Category | Yes | See values below | Type of feature |
| Status | Yes | See values below | Release status (GA, Beta, etc.) |
| Gating | Yes | See values below | Access type (Free, Paid, etc.) |
| Launched | Yes | ISO 8601 | When the feature/change officially happened |
| Verified | Yes | ISO 8601 | When someone read the vendor's own source and confirmed every claim in the record |
| Checked | Yes | ISO 8601 | When the record last got an adequate comparison against the outside world |

### Date Fields Explained

These three dates separate **absolute truth** from **confidence**:

| Date | What it means | Who updates it | Example |
|------|---------------|----------------|---------|
| **Launched** | When the vendor released/changed this | Update when feature changes | `2025-07-17T00:00Z` (Agent Mode GA) |
| **Verified** | Someone read the vendor's own page and confirmed every claim in the record | A human, or an agent whose changes a human reviews. Model agreement alone never updates it | `2026-01-20T12:00Z` |
| **Checked** | The record last got an adequate comparison against the outside world: a Verified review, or at least two independent search-grounded models that cited sources and found no change | A Verified review, or the verification collector on an adequate no-change result. A failed or unreadable attempt never updates it | `2026-01-20T14:30Z` |

On the site, Verified is labeled "Confirmed against vendor source" and Checked is labeled "Last checked for changes".

**Example scenario:**
- You check ChatGPT Agent Mode on Jan 20
- You confirm the limits are still 40/mo for Plus
- Update `Verified` to now (you read the vendor source and confirmed every claim)
- Update `Checked` to now (a Verified review is also an adequate check)
- `Launched` stays the same (nothing changed on OpenAI's side)

**Another scenario:**
- You check on Jan 25, but OpenAI's help page is down
- Leave `Checked` unchanged (an attempt that could not read the source is not a check)
- Leave `Verified` unchanged (you couldn't confirm)
- `Launched` stays the same

### Status Values (Release Status)

| Value | Meaning |
|-------|---------|
| `ga` | Generally available |
| `beta` | Public beta |
| `preview` | Research preview / limited preview |
| `deprecated` | Being phased out |

### Gating Values (Access Type)

| Value | Meaning |
|-------|---------|
| `free` | Available on free tier |
| `paid` | Requires paid subscription |
| `invite` | Invite-only / waitlist |
| `org-only` | Enterprise/organization accounts only |

### Category Values

| Value | Description |
|-------|-------------|
| `vision` | Image/document understanding (input) |
| `image-gen` | Image creation (output) |
| `video-gen` | Video generation (output) |
| `voice` | Voice input and/or output |
| `search` | Web search |
| `research` | Deep/agentic research |
| `browser` | Dedicated browser experiences |
| `coding` | Code generation, editing, execution |
| `agents` | Autonomous task execution |
| `local-files` | Local file/document handling |
| `cloud-files` | Cloud storage integration (Drive, OneDrive, etc.) |
| `integrations` | External service connections (MCP, connectors, APIs) |
| `video` | Video generation or editing |
| `other` | Doesn't fit other categories |

### Availability Symbols

| Symbol | Meaning |
|--------|---------|
| ✅ | Available |
| ❌ | Not available |
| 🔜 | Coming soon (announced) |
| ⚠️ | Partial / with caveats |

### Changelog Format

The `### Changelog` section tracks the history of **actual feature changes** (not verification updates).

| Field | Format | Example |
|-------|--------|---------|
| Date | ISO 8601 | `2025-07-17T00:00Z` |
| Change | Brief description | `Feature launched (GA)` |

**Guidelines:**
- Use ISO 8601 format: `YYYY-MM-DDTHH:MMZ` (the `Z` indicates UTC)
- Most recent change first (reverse chronological)
- Only log actual feature changes, not verification updates
- Be specific about what changed (old value → new value)

## Complete Data Model Reference

For each feature, the system tracks:

```
product_name       → Platform frontmatter `name`
feature_name       → Feature heading (## Name)
plan_tiers         → Availability table (Plan, Available, Limits, Notes)
platform_constraints → Platforms table (Platform, Available, Notes)
status             → Property table `Status` (ga/beta/preview/deprecated)
gating             → Property table `Gating` (free/paid/invite/org-only)
category           → Property table `Category`
citation_link      → Sources section (array of {title, url})
launched           → Property table `Launched` (ISO 8601)
verified           → Property table `Verified` (ISO 8601)
checked            → Property table `Checked` (ISO 8601)
changelog          → Changelog table (array of {date, change})
regional           → Regional section (free text)
talking_point      → Talking Point section (quoted text)
```

## Contribution Rules

1. **Always include sources** - Every feature needs at least one official source link
2. **Update dates correctly**:
   - `Verified` → Only when you read the vendor's own source and confirm every claim in the record
   - `Checked` → When you verify the record, or when the collector records an adequate no-change result; never for a failed or unreadable attempt
   - `Launched` → Only when the actual feature changes
3. **Update the Changelog** - When availability, limits, platforms, or status change
4. **Use talking points** - Write them as if you're presenting to a training audience
5. **Be specific about limits** - "40/month" is better than "limited"
6. **Note regional restrictions** - Many features have geographic limitations
