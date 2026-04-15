/**
 * Tests for cascade.parseResponse — section-level verdict parsing.
 *
 * These tests lock in the behavior that caused the 41-issue false-positive
 * batch on 2026-04-14: the old parser keyword-scanned the whole response and
 * flagged any "now available" / "deprecated" mention, even in historical or
 * non-material context. The new parser requires a MATERIAL section
 * (pricing/platform/status/gating) to be explicitly marked incorrect AND
 * a concrete change detail to be extracted.
 *
 * Run:  node --test tests/cascade-parser.test.js
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseResponse, detectContradiction } = require('../scripts/lib/cascade');

// --------------------------------------------------------------------
// parseResponse — negative cases (should NOT flag a change)
// --------------------------------------------------------------------

describe('parseResponse — negative cases', () => {

    it('returns hasChange=false when every material section is correct', () => {
        const r = parseResponse(`
1. Pricing tier availability: CORRECT. Stored data matches.
2. Platform/surface availability: CORRECT.
3. Current status: CORRECT. Still GA.
4. Access gating: CORRECT.
5. Regional availability: CORRECT.
6. Official URL: CORRECT.
7. Recent changes: No changes detected.
        `);
        assert.equal(r.hasChange, false);
        assert.equal(r.changes.length, 0);
    });

    it('treats "insufficient sources" as abstain, not incorrect', () => {
        // This is the Perplexity failure mode that caused many of the 41
        // false positives: a section is flagged because sources were missing.
        const r = parseResponse(`
1. Pricing tier availability: CORRECT.
2. Platform/surface availability: INCORRECT. Insufficient sources — I could not find confirmation of Linux desktop support.
3. Current status: CORRECT.
4. Access gating: CORRECT.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: No recent changes.
        `);
        assert.equal(r.hasChange, false);
        assert.ok(r.abstainCount >= 1);
    });

    it('ignores "now available" mentions in the recent-changes (non-material) section', () => {
        // The old parser would flip on this. The new one only counts changes
        // in sections 1-4, not section 7.
        const r = parseResponse(`
1. Pricing tier availability: CORRECT. Free tier has full access.
2. Platform/surface availability: CORRECT.
3. Current status: CORRECT. Still GA.
4. Access gating: CORRECT.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: A new beta option was announced and is now available on the experimental channel — no impact on the core feature.
        `);
        assert.equal(r.hasChange, false);
    });

    it('does not flip on historical "was deprecated in 2024" mentions', () => {
        const r = parseResponse(`
1. Pricing: CORRECT. (Note: the previous plan was deprecated in 2024 but our data already reflects this.)
2. Platform: CORRECT.
3. Status: CORRECT.
4. Gating: CORRECT.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: none.
        `);
        assert.equal(r.hasChange, false);
    });

    it('downgrades boilerplate responses to isEmpty', () => {
        const r = parseResponse('Okay, I will check this feature now.');
        assert.equal(r.isEmpty, true);
        assert.equal(r.hasChange, false);
    });
});

// --------------------------------------------------------------------
// parseResponse — positive cases (should flag a change)
// --------------------------------------------------------------------

describe('parseResponse — positive cases', () => {

    it('flags a real pricing change with concrete detail', () => {
        const r = parseResponse(`
1. Pricing tier availability: INCORRECT. Free users now have access.
2. Platform: CORRECT.
3. Status: CORRECT.
4. Gating: INCORRECT. The feature is now available on free tier as of last week.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: Anthropic announced free-tier rollout on March 15.
        `);
        assert.equal(r.hasChange, true);
        assert.ok(r.changes.length > 0);
    });

    it('flags a real platform change with concrete detail', () => {
        const r = parseResponse(`
1. Pricing: CORRECT.
2. Platform/surface availability: INCORRECT. Linux support was removed from the desktop app.
3. Status: CORRECT.
4. Gating: CORRECT.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: Linux app removed Feb 2026. It is no longer available on linux.
        `);
        assert.equal(r.hasChange, true);
        assert.ok(r.changes.some(c => c.type === 'platform'));
    });

    it('does NOT flag when material section is incorrect but no concrete detail extracted', () => {
        // "Incorrect" with no extractable change = model is being vague.
        // Old parser would count this as a change. New parser requires both.
        const r = parseResponse(`
1. Pricing: INCORRECT. Something seems off about the plans.
2. Platform: CORRECT.
3. Status: CORRECT.
4. Gating: CORRECT.
5. Regional: CORRECT.
6. URL: CORRECT.
7. Recent changes: none.
        `);
        assert.equal(r.hasChange, false);
    });
});

// --------------------------------------------------------------------
// detectContradiction
// --------------------------------------------------------------------

describe('detectContradiction', () => {

    it('is NOT a contradiction when one model flags change and another says no change', () => {
        // This was the old failure mode — a lone positive vs a no-change vote
        // was counted as conflict. Now it's just one model in the minority.
        const r1 = { hasChange: true,  changes: [{ type: 'availability', detail: 'now available on free' }] };
        const r2 = { hasChange: false, changes: [] };
        assert.equal(detectContradiction(r1, r2), false);
    });

    it('is NOT a contradiction when both flag change but in different material categories', () => {
        const r1 = { hasChange: true, changes: [{ type: 'platform', detail: 'windows support added' }] };
        const r2 = { hasChange: true, changes: [{ type: 'availability', detail: 'now available on pro' }] };
        assert.equal(detectContradiction(r1, r2), false);
    });

    it('IS a contradiction when both claim the same material change with incompatible details', () => {
        const r1 = { hasChange: true, changes: [{ type: 'availability', detail: 'now available on free' }] };
        const r2 = { hasChange: true, changes: [{ type: 'availability', detail: 'no longer available on free' }] };
        assert.equal(detectContradiction(r1, r2), true);
    });
});
