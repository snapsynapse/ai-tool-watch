#!/usr/bin/env bash
# Close issue #272 as not-planned (false positive from automated verification)
gh issue close 272 \
  --repo snapsynapse/ai-capability-reference \
  --reason "not planned" \
  --comment "Closing as no change needed. Manual review confirms AI Studio remains **generally available** (not deprecated). The Perplexity research in this issue states: 'Generally available (GA) as a core part of Google'\''s Gemini developer ecosystem in early 2026' with 'no indications of beta, preview, or deprecated status.' The current data (status: ga, gating: free) is accurate. The 1/3 confirmation rate correctly indicated this was a false positive."
