# AI Feature Tracker

**Community-maintained tracker of AI feature availability across subscription tiers.**

🔗 **[View the Dashboard](https://snapsynapse.github.io/ai-feature-tracker)**

---

## What is this?

A single source of truth for answering questions like:
- "Is ChatGPT Agent Mode available on the $8/mo plan?" (No, Plus or higher)
- "Can I use Claude Cowork on Windows?" (Not yet, macOS only)
- "Which local models can I run on my hardware?" (Depends on VRAM)

Built for fellow AI facilitators, educators, designers, and anyone who needs accurate, current information about AI tool availability.

## Platforms Covered

| Platform | Vendor | Features Tracked |
|----------|--------|------------------|
| **ChatGPT** | OpenAI | Agent Mode, Custom GPTs, Voice, Atlas, DALL-E, Deep Research, Codex |
| **Claude** | Anthropic | Code, Cowork, Projects, Artifacts, Extended Thinking, Vision |
| **Copilot** | Microsoft | Office Integration, Designer, Vision, Voice |
| **Gemini** | Google | Advanced, NotebookLM, AI Studio, Deep Research, Gems, Workspace, Imagen, Live |
| **Perplexity** | Perplexity AI | Comet, Agent Mode, Pro Search, Focus, Collections, Voice |
| **Grok** | xAI | Chat, Aurora (images), DeepSearch, Think Mode, Voice |
| **Local Models** | Various | Llama, Mistral, DeepSeek, Qwen, Codestral |

## Features

- **Plan-by-plan availability** — See exactly which tier unlocks each feature
- **Platform support** — Windows, macOS, Linux, iOS, Android, web, terminal, API
- **Talking points** — Ready-to-use sentences for presentations (click to copy)
- **Category filtering** — Voice, Coding, Research, Agents, and more
- **Price tier filtering** — Find features at your budget
- **Provider toggles** — Focus on specific platforms
- **Dark/light mode** — Toggle for your preference
- **Keyboard navigation** — ↑/↓/j/k to navigate, Enter to copy talking point
- **Shareable URLs** — Filter state preserved in URL parameters
- **Community maintained** — Submit PRs to keep it current

## How to Contribute

Found outdated info? Want to add a feature? See [CONTRIBUTING.md](CONTRIBUTING.md).

Quick version:
1. Edit the relevant file in `data/platforms/`
2. Include a source link
3. Submit a PR

## Local Development

```bash
# Clone the repo
git clone https://github.com/snapsynapse/ai-feature-tracker.git
cd ai-feature-tracker

# Build the dashboard
node scripts/build.js

# Open it
open docs/index.html
```

## Data Format

Platform data is stored in simple markdown files. Example:

```markdown
## Feature Name

| Property | Value |
|----------|-------|
| Category | agent |
| Status | ga |

### Availability

| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ❌ | — | Not available |
| Plus | ✅ | 40/month | Message limit |

### Talking Point

> "Your presenter-ready sentence with **key details bolded**."

### Sources

- [Official docs](https://example.com)
```

See [data/_schema.md](data/_schema.md) for the full specification.

## Deployment

The site auto-deploys to GitHub Pages when changes are merged to `main`. The GitHub Action runs `scripts/build.js` and commits the updated `docs/index.html`.

## License

MIT - see [LICENSE](LICENSE)

## Credits

Created by [SnapSynapse](https://snapsynapse.com) for the AI training community.

Built with help from Claude.

---

**Found an error?** [Open an issue](https://github.com/snapsynapse/ai-feature-tracker/issues) or submit a PR!
