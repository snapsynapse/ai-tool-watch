# Assessment: Issue #255 — [Verification Conflict] ChatGPT - DALL-E Image Generation

## Resolution Type: Close with no data change (bump Checked date only)

## Reasoning

### What the models reported

- **Gemini Flash** (detected change): Claims GPT-4o has replaced DALL-E 3 as the built-in image generation model. States free users now have access. Reports availability on web, iOS, Android, Windows, macOS, and API.
- **Perplexity** (no change detected): Reports DALL-E 3 as legacy but still actively supported in ChatGPT. Confirms free users have limited access (2-3/day). Reports availability on web, iOS, and Android. Notes ongoing shift to GPT Image models.

### What our data currently says

- **Status:** ga (correct — both models agree)
- **Gating:** paid (with Free shown as limited/warning in availability table)
- **Free plan:** ~2/day, very limited (matches both models)
- **Plus/Pro:** Higher/unlimited limits (matches both models)
- **Platforms:** Web, iOS, Android, Windows, macOS, API all marked available (matches)
- **Regional:** Global (matches)

### Why no data change is needed

1. **The "conflict" is about the underlying model name, not access or availability.** Gemini says "GPT-4o replaced DALL-E 3" while Perplexity says "DALL-E 3 is legacy but still supported." This is a terminology/branding distinction about which model powers image generation within ChatGPT. The feature name in our data ("DALL-E Image Generation") refers to the user-facing image generation capability, and the underlying model shift is an incremental technical detail, not a change to status, gating, pricing, platform availability, or regional availability.

2. **Both models agree on the facts that matter for our data:**
   - Free users have limited access (~2-3 images/day)
   - Paid users get higher or unlimited limits
   - Available on web, iOS, Android, Windows, macOS
   - GA status, available globally

3. **Our current data already accurately reflects all of this.** The availability table correctly shows Free as limited, paid plans as full access.

4. **Per the skill heuristics:** "Close with no data change if both models agree on the facts but the 'conflict' is about phrasing or terminology" — this applies directly. The conflict is about DALL-E 3 vs GPT-4o naming, not about any factual change to access or availability.

### Note on Gating field

The Gating field says `paid` while Free users do have limited access (shown as warning icon in the availability table). This is consistent with how other features in the project handle "free with severe limits" — they use `paid` gating with a warning marker on the Free row. This is not something introduced by this issue and does not need to be changed here.
