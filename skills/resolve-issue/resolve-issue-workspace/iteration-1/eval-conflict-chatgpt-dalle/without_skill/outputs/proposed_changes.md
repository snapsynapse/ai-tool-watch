# Proposed Changes: DALL-E Image Generation (chatgpt.md)

## File: data/platforms/chatgpt.md

### Change 1: Fix Gating from `paid` to `free`

**Before:**
```
| Gating | paid |
```

**After:**
```
| Gating | free |
```

**Reason:** Free users have access (~2 images/day). This matches the project convention where `⚠️` limited free access = `free` gating (consistent with Deep Research, Memory, etc.).

### Change 2: Update Verified Date

**Before:**
```
| Verified | 2026-03-08|
```

**After:**
```
| Verified | 2026-03-15|
```

### Change 3: Add Team and Enterprise Rows to Availability Table

**Before:**
```
| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | ~2/day | Very limited |
| Go | ✅ | 10x free | Standard access |
| Plus | ✅ | 50x free | Priority |
| Pro | ✅ | Unlimited | No limits |
```

**After:**
```
| Plan | Available | Limits | Notes |
|------|-----------|--------|-------|
| Free | ⚠️ | ~2/day | Very limited |
| Go | ✅ | 10x free | Standard access |
| Plus | ✅ | 50x free | Priority |
| Pro | ✅ | Unlimited | No limits |
| Team | ✅ | 50x free | Plus features |
| Enterprise | ✅ | Custom | Full access |
```

### Change 4: Add Note About GPT-4o / GPT Image 1 Transition

Add to the Notes section (new section, after Talking Point):

```
### Notes

**Model Transition (2025):**
As of 2025, ChatGPT's built-in image generation uses GPT-4o's native capabilities rather than the standalone DALL-E 3 model. The API also offers GPT Image 1 as a newer image generation model. The user-facing feature in ChatGPT continues to work the same way. DALL-E 3 remains available via the API.
```

### Change 5: Add Changelog Entry

**Before:**
```
### Changelog

| Date | Change |
|------|--------|
| 2023-10-01T12:00Z | Initial entry |
```

**After:**
```
### Changelog

| Date | Change |
|------|--------|
| 2026-03-15T12:00Z | [Verified] Gating corrected from paid to free (free users have ~2/day); Team/Enterprise rows added; note about GPT-4o model transition added |
| 2023-10-01T12:00Z | Initial entry |
```
