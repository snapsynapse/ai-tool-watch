#!/bin/bash
# Close issue #255 with a comment summarizing the resolution

gh issue close 255 --repo snapsynapse/ai-capability-reference --comment "$(cat <<'EOF'
## Resolution: Data Updated

**Resolution type:** Data correction

### Changes made to `data/platforms/chatgpt.md` — DALL-E Image Generation:

1. **Gating corrected:** `paid` → `free` — Free users have access (~2 images/day), matching project convention (consistent with Deep Research, Memory, etc.)
2. **Added Team and Enterprise rows** to availability table (were missing)
3. **Added note about GPT-4o model transition** — ChatGPT now uses GPT-4o's native image generation rather than standalone DALL-E 3
4. **Updated Verified date** to 2026-03-15
5. **Added changelog entry** documenting all changes

### Conflict explanation:
Gemini Flash flagged a change because GPT-4o replaced DALL-E 3 as the underlying model. Perplexity saw no change because the user-facing feature works the same way. Both were partially correct — the data needed updates for gating consistency, missing plan rows, and a note about the model transition.
EOF
)"
