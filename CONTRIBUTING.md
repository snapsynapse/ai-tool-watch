# Contributing to AI Tool Watch

Thank you for helping keep this resource accurate! This guide explains how to contribute.

## Types of Contributions

### 1. Update Existing Information

The most common contribution - something changed:
- An implementation became available on a new plan tier
- Pricing changed
- Platform support expanded
- An implementation entered or exited beta

### 2. Add a New Implementation

A product released something new that should be tracked.

### 3. Add a New Product or Provider

Want to add a new AI product or provider? Check [design/SCOPE.md](design/SCOPE.md) for inclusion criteria first.

### 4. Fix Errors

Found incorrect information? Please fix it!

## Project Structure

The project uses an ontology-backed data model. Understanding the key directories helps you find the right file:

| Directory | Purpose |
|-----------|---------|
| `data/platforms/` | Editorial source of truth for implementation details, plans, constraints, evidence |
| `data/capabilities/` | Plain-English capability definitions (18 records) |
| `data/providers/` | Provider records (13 records) |
| `data/products/` | Product records (9 records) |
| `data/model-access/` | Open/self-hosted model family records (9 records) |
| `data/implementations/index.yml` | Implementation-to-capability mappings (71 records) |
| `data/evidence/index.json` | Generated evidence records (do not edit directly) |

## How to Contribute

### Step 1: Find the Right File

For updating existing implementations, start with the platform file in `data/platforms/`:
- `chatgpt.md` - OpenAI ChatGPT
- `claude.md` - Anthropic Claude
- `perplexity.md` - Perplexity AI
- `gemini.md` - Google Gemini
- `copilot.md` - Microsoft Copilot
- `grok.md` - xAI Grok
- Runtime and open-model files also live here (e.g., `ollama-runtime.md`, `meta-open-models.md`)

### Step 2: Make Your Changes

Follow the format in [data/_schema.md](data/_schema.md). Key points:

**For updating availability:**
```markdown
### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Plus | ✅ | 40/month | Message limit |
```

Use these symbols:
- ✅ = Available
- ❌ = Not available
- 🔜 = Coming soon (announced)
- ⚠️ = Partial / with caveats

**For updating talking points:**
```markdown
### Talking Point

> "Write your presenter-ready sentence here. Use **bold** for key details like pricing or restrictions."
```

### Step 3: Add Sources

Every change needs a source. Add or update the Sources section:

```markdown
### Sources

- [Official announcement](https://example.com/blog/announcement)
- [Help documentation](https://help.example.com/article)
```

Acceptable sources:
- Official product pages, blogs, or announcements
- Official help/support documentation
- Official status pages
- Reputable tech news (for breaking changes)

**Not acceptable:** Reddit posts, tweets (unless from official accounts), personal blogs

### Step 4: Update `last_verified`

In the frontmatter, update the verification date:

```yaml
---
name: ChatGPT
last_verified: 2026-01-25  # Update this!
---
```

### Step 5: Sync and Validate

```bash
# Sync evidence records from source files
node scripts/sync-evidence.js

# Validate ontology integrity
node scripts/validate-ontology.js

# Build the site
node scripts/build.js

# Check the result
open docs/index.html
```

Verify:
- Your changes appear correctly on both the capability homepage and the detailed availability view
- Ontology validation passes with no errors
- No build errors

### Step 6: Submit a Pull Request

1. Fork and clone the repo
2. Create a branch: `git checkout -b update-chatgpt-agent-limits`
3. Make your changes
4. Commit with a clear message: `Update ChatGPT Agent Mode limits (Plus: 40→50/month)`
5. Push and open a PR

## Pull Request Guidelines

### PR Title Format

```
[Product] Brief description

Examples:
[ChatGPT] Update Agent Mode limits
[Claude] Add Cowork Windows availability
[Perplexity] Fix Comet iOS status
[New] Add product/provider
```

### PR Description

Include:
- What changed
- Link to official source
- Any context (when did this change happen?)

### Review Process

1. Maintainers will verify your source
2. We may ask for clarification
3. Once approved, we'll merge
4. GitHub Actions auto-rebuilds the site

## Adding a New Implementation

1. Find the product's platform file in `data/platforms/`
2. Add a new section after the last `---`
3. Include all required fields:
   - Name (## heading)
   - Category and Status table
   - Availability by plan
   - Platforms
   - Regional notes
   - Talking point
   - Sources
4. Add an entry in `data/implementations/index.yml` mapping it to capability IDs
5. Run `node scripts/sync-evidence.js` and `node scripts/validate-ontology.js`

## Adding a New Product

1. Create the platform evidence file: `data/platforms/newproduct.md`
2. Create the product record: `data/products/newproduct.md`
3. Create or reference the provider record in `data/providers/`
4. Add implementation entries in `data/implementations/index.yml`
5. Follow the schema format exactly — see existing files for examples
6. Run sync and validation

## Code of Conduct

- Be accurate - verify before submitting
- Be helpful - good PRs include good sources
- Be patient - maintainers are volunteers
- Be respectful - we're all here to help

## Questions?

Open an issue with the `question` label or reach out to maintainers.

---

Thank you for contributing! 🎉
