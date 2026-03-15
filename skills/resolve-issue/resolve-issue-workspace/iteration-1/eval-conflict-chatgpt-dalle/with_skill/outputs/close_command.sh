#!/bin/bash
gh issue close 255 --repo snapsynapse/ai-capability-reference --comment "$(cat <<'EOF'
**Closed — no data change needed.**

Reason: Both models agree on the actual access/pricing facts (free users get ~2-3 images/day, paid plans get higher/unlimited limits, GA globally on all major platforms). The "conflict" is about whether the underlying model is DALL-E 3 or GPT-4o — a naming/branding distinction, not a change to status, gating, pricing, or availability. Our data already accurately reflects the current state. Checked date bumped to 2026-03-15.
EOF
)"
